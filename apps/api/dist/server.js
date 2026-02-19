import express, {} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import { isGitHubConfigured, listFiles as ghListFiles, getFileContent as ghGetFileContent, createOrUpdateFile as ghCreateOrUpdateFile, } from './github.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3333;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Caminho local para fallback em desenvolvimento
const DOCS_DIR = path.resolve(import.meta.dirname, '../../web/docs');
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    return res.json({
        message: 'Backend is running!',
        mode: isGitHubConfigured() ? 'github' : 'local',
    });
});
app.post('/chat', async (req, res) => {
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
    }
    catch (error) {
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
app.post('/digitize', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const prompt = `
Você é um Technical Writer Sênior especialista em criar documentações para o Docusaurus.
Sua única função é transformar imagens de anotações brutas e manuscritas em uma página de documentação oficial, coesa e extremamente fácil de ler.
Retorne EXCLUSIVAMENTE o código Markdown. NUNCA inclua saudações, explicações ou comentários fora do texto.

Regras de Transformação e Formatação:
1. Contexto em Primeiro Lugar: Analise o conteúdo geral para entender de qual matéria ou assunto se trata. Crie uma estrutura lógica baseada nesse contexto, como se estivesse escrevendo um artigo técnico.
2. Fluidez Absoluta (Sem Quebras Artificiais): Ignore completamente o layout físico do papel. Se uma frase ou ideia foi cortada por falta de espaço na folha ou por uma quebra de linha visual, junte-as em um parágrafo contínuo e bem redigido.
3. Adaptação para Documentação: 
   - Use um único '# Título' principal no topo, inferido pelo assunto geral.
   - Agrupe conceitos relacionados usando subtítulos ('##' ou '###').
   - Transforme rabiscos, setas ou pensamentos fragmentados em parágrafos coesos ou listas (bullet points) lógicas.
   - Use **negrito** para destacar termos técnicos ou palavras-chave importantes.
4. Limpeza Textual: Não faça uma transcrição literal linha por linha. Reescreva pequenos trechos fragmentados para que façam sentido gramatical e tenham uma leitura agradável e fluida de documentação.
5. Saída Estrita: O resultado deve ser apenas o Markdown formatado, pronto para ser lido em uma tela.
`;
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        };
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        return res.json({ answer: text });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// ============================================================
// GET /docs/files — Lista arquivos .md
// Produção: via GitHub API | Local: via filesystem
// ============================================================
app.get('/docs/files', async (req, res) => {
    try {
        if (isGitHubConfigured()) {
            const files = await ghListFiles();
            return res.json({ files });
        }
        // Fallback local
        const files = [];
        async function walk(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await walk(fullPath);
                }
                else if (entry.name.endsWith('.md')) {
                    files.push(path.relative(DOCS_DIR, fullPath));
                }
            }
        }
        await walk(DOCS_DIR);
        files.sort();
        return res.json({ files });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// ============================================================
// POST /save — Salva texto digitalizado como .md
// Produção: via GitHub API (commit) | Local: via filesystem
// Body: { text: string, path: string, mode?: 'create' | 'append' }
// ============================================================
app.post('/save', async (req, res) => {
    try {
        const { text, path: destPath, mode = 'create' } = req.body;
        if (!text || !destPath) {
            return res.status(400).json({ error: 'text and path are required' });
        }
        // Sanitiza o caminho
        const sanitized = destPath.replace(/\.\./g, '').replace(/^\/+/, '');
        if (isGitHubConfigured()) {
            // ---- MODO GITHUB ----
            let filePath;
            let commitMsg;
            if (mode === 'append') {
                const { content: existing, sha } = await ghGetFileContent(sanitized);
                const updated = existing + '\n\n---\n\n' + text;
                filePath = await ghCreateOrUpdateFile(sanitized, updated, `docs: atualiza ${sanitized}`, sha);
                commitMsg = 'Texto anexado com sucesso!';
            }
            else {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                const fileName = `anotacao-${timestamp}.md`;
                const newPath = `${sanitized}/${fileName}`;
                filePath = await ghCreateOrUpdateFile(newPath, text, `docs: adiciona ${newPath}`);
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
        let filePath;
        if (mode === 'append') {
            try {
                await fs.access(resolvedPath);
            }
            catch {
                return res.status(404).json({ error: `Arquivo não encontrado: ${sanitized}` });
            }
            const existing = await fs.readFile(resolvedPath, 'utf-8');
            await fs.writeFile(resolvedPath, existing + '\n\n---\n\n' + text, 'utf-8');
            filePath = sanitized;
            console.log(`[LOCAL] Texto anexado em: ${resolvedPath}`);
        }
        else {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Mode: ${isGitHubConfigured() ? 'GitHub API' : 'Local filesystem'}`);
});
//# sourceMappingURL=server.js.map