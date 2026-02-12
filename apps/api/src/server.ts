import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.json({ message: 'Backend is running!' })
})

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

app.post('/digitize', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' })
        }

        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const prompt = `
            Atue como um digitalizador de documentos profissional.
            Analise a imagem manuscrita fornecida e transcreva o texto fielmente.

            Regras de formatação:
            1. Use Markdown para estruturar (títulos, bullets, negrito se houver ênfase no papel).
            2. Se houver datas no topo da página, destaque-as.
            3. Se houver desenhos ou diagramas, descreva-os brevemente entre colchetes [Desenho: descrição...].
            4. Corrija apenas erros ortográficos óbvios, mas mantenha o estilo da escrita.
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
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});