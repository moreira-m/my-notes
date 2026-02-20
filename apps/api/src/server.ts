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

        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const prompt = `
Você é um organizador de documentações técnicas focado no princípio KISS (Keep It Simple, Stupid).
Sua tarefa é digitalizar a imagem da anotação manuscrita e retornar EXCLUSIVAMENTE código Markdown válido.
NÃO inclua saudações, explicações ou qualquer texto fora do Markdown.

Regras de Transformação:
1. Estrutura Fiel e Direta: Mantenha a essência da anotação original. Priorize o uso de listas (bullet points) e frases curtas. PROIBIDO criar parágrafos longos ou textos elaborados que não estavam no papel.
2. Fidelidade Inteligente: Mantenha as palavras originais na medida do possível, mas aplique correções gramaticais e conecte frases fragmentadas para que a leitura fique fluida e didática.
3. Hierarquia Lógica: Transforme o assunto principal em um título '#'. Use '##' para agrupar subtópicos lógicos, mesmo que não estivessem explicitamente marcados como títulos no papel.
4. Interpretação Visual: Traduza setas (->, ↓) e conexões visuais como hierarquia nos bullet points (sub-itens) ou como pequenas palavras de conexão (ex: "logo", "resultando em"), sem descrever o desenho.
5. Destaque: Use **negrito** para palavras-chave para facilitar o escaneamento visual da documentação.
`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([prompt, imagePart]);
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
        const { text, path: destPath, mode = 'create' } = req.body;

        if (!text || !destPath) {
            return res.status(400).json({ error: 'text and path are required' });
        }

        // Sanitiza o caminho
        const sanitized = destPath.replace(/\.\./g, '').replace(/^\/+/, '');

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
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const fileName = `anotacao-${timestamp}.md`;
                const newPath = `${sanitized}/${fileName}`;
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
        const fullPath = path.join(DOCS_DIR, sanitized);
        const resolvedPath = path.resolve(fullPath);

        if (!resolvedPath.startsWith(DOCS_DIR)) {
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
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const fileName = `anotacao-${timestamp}.md`;
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