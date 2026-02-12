import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});