import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import {
    isGitHubConfigured,
    listFiles as ghListFiles,
    getFileContent as ghGetFileContent,
    createOrUpdateFile as ghCreateOrUpdateFile,
} from './github.js';
import { findUser, verifyPassword, generateToken, ensureDefaultUser } from './auth.js';
import { prompts, getPromptById } from './prompts.js';
import { requireAuth } from './middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

// Caminho local para fallback em desenvolvimento
const DOCS_DIR = path.resolve(import.meta.dirname, '../../web/docs');

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.json({
        message: 'Backend is running!',
        mode: isGitHubConfigured() ? 'github' : 'local',
    });
});

// ============================================================
// POST /login — Autenticação de usuário
// ============================================================
app.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password são obrigatórios.' });
        }

        const user = await findUser(username);
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = generateToken({ username: user.username });
        return res.json({ token, username: user.username });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        return res.json({ answer: text });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================
// GET /prompts — Lista os prompts disponíveis
// ============================================================
app.get('/prompts', (req: Request, res: Response) => {
    const list = prompts.map(({ id, name, description }) => ({ id, name, description }));
    return res.json({ prompts: list });
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});

// ============================================================
// POST /digitize — Digitalização de imagens (PROTEGIDA)
// ============================================================
app.post('/digitize', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' })
        }

        const promptId = req.body.promptId as string;
        if (!promptId) {
            return res.status(400).json({ error: 'promptId is required' });
        }

        const targetLanguage = req.body.targetLanguage as string || 'original';

        const selectedPrompt = getPromptById(promptId);
        if (!selectedPrompt) {
            return res.status(400).json({ error: `Prompt não encontrado: ${promptId}` });
        }

        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        }

        let finalPrompt = selectedPrompt.prompt;
        if (targetLanguage === 'pt') {
            finalPrompt += '\n\nATENÇÃO: Você DEVE traduzir todo o conteúdo final extraído para o idioma Português (Portuguese), mantendo intacta toda a estrutura e fidelidade exigida pelas regras acima.';
        } else if (targetLanguage === 'en') {
            finalPrompt += '\n\nATENÇÃO: Você DEVE traduzir todo o conteúdo final extraído para o idioma Inglês (English), mantendo intacta toda a estrutura e fidelidade exigida pelas regras acima.';
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([finalPrompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return res.json({ answer: text });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================
// GET /docs/files — Lista arquivos .md
// Produção: via GitHub API | Local: via filesystem
// ============================================================
app.get('/docs/files', async (req: Request, res: Response) => {
    try {
        if (isGitHubConfigured()) {
            const files = await ghListFiles();
            return res.json({ files });
        }

        // Fallback local
        const files: string[] = [];
        async function walk(dir: string) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                } else if (entry.name.endsWith('.md')) {
                    files.push(path.relative(DOCS_DIR, fullPath));
                }
            }
        }
        await walk(DOCS_DIR);
        files.sort();
        return res.json({ files });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================
// POST /save — Salva texto digitalizado como .md
// Produção: via GitHub API (commit) | Local: via filesystem
// Body: { text: string, path: string, mode?: 'create' | 'append' }
// ============================================================
app.post('/save', requireAuth, async (req: Request, res: Response) => {
    try {
        const { text, path: destPath, mode = 'create', title } = req.body;

        if (!text || destPath === undefined) {
            return res.status(400).json({ error: 'text e path são obrigatórios' });
        }

        // Sanitiza o caminho (agora pode ser string vazia para o root)
        const sanitized = destPath.replace(/\.\./g, '').replace(/^\/+/, '').replace(/\/+$/, '');

        if (isGitHubConfigured()) {
            // ---- MODO GITHUB ----
            let filePath: string;
            let commitMsg: string;

            if (mode === 'append') {
                const { content: existing, sha } = await ghGetFileContent(sanitized);
                const updated = existing + '\n\n---\n\n' + text;
                filePath = await ghCreateOrUpdateFile(
                    sanitized,
                    updated,
                    `docs: atualiza ${sanitized}`,
                    sha
                );
                commitMsg = 'Texto anexado com sucesso!';
            } else {
                let fileName: string = '';
                if (title) {
                    // Transforma em kebab-case
                    const cleanTitle = title.trim().toLowerCase()
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
                        .replace(/[^a-z0-9]+/g, '-');
                    fileName = cleanTitle ? `${cleanTitle}.md` : '';
                }

                if (!fileName || fileName === '.md') {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                    fileName = `anotacao-${timestamp}.md`;
                }

                const newPath = sanitized ? `${sanitized}/${fileName}` : fileName;
                filePath = await ghCreateOrUpdateFile(
                    newPath,
                    text,
                    `docs: adiciona ${newPath}`
                );
                commitMsg = 'Arquivo salvo com sucesso!';
            }

            return res.json({ message: commitMsg, filePath });
        }

        // ---- MODO LOCAL (fallback) ----
        const fullPath = sanitized ? path.join(DOCS_DIR, sanitized) : DOCS_DIR;
        const resolvedPath = path.resolve(fullPath);

        if (!resolvedPath.startsWith(path.resolve(DOCS_DIR))) {
            return res.status(400).json({ error: 'Invalid path: must be inside docs/' });
        }

        let filePath: string;

        if (mode === 'append') {
            try {
                await fs.access(resolvedPath);
            } catch {
                return res.status(404).json({ error: `Arquivo não encontrado: ${sanitized}` });
            }

            const existing = await fs.readFile(resolvedPath, 'utf-8');
            await fs.writeFile(resolvedPath, existing + '\n\n---\n\n' + text, 'utf-8');
            filePath = sanitized;
            console.log(`[LOCAL] Texto anexado em: ${resolvedPath}`);
        } else {
            await fs.mkdir(resolvedPath, { recursive: true });

            let fileName: string = '';
            if (title) {
                const cleanTitle = title.trim().toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-');
                fileName = cleanTitle ? `${cleanTitle}.md` : '';
            }

            if (!fileName || fileName === '.md') {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                fileName = `anotacao-${timestamp}.md`;
            }

            const fullFilePath = path.join(resolvedPath, fileName);
            await fs.writeFile(fullFilePath, text, 'utf-8');
            filePath = path.relative(DOCS_DIR, fullFilePath);
            console.log(`[LOCAL] Arquivo salvo em: ${fullFilePath}`);
        }

        return res.json({
            message: mode === 'append' ? 'Texto anexado com sucesso!' : 'Arquivo salvo com sucesso!',
            filePath,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Mode: ${isGitHubConfigured() ? 'GitHub API' : 'Local filesystem'}`);

    // Cria usuário padrão a partir de variáveis de ambiente (produção)
    await ensureDefaultUser();
});