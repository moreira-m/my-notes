// Para rodar: npx ts-node src/check-models.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

    try {
        // Isso vai listar todos os modelos disponíveis para sua conta
        // Se der erro aqui, sua API Key pode estar errada/inválida
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey;
        // Ops, o método correto no SDK novo é listar via API direta ou testar um genérico, 
        // mas vamos simplificar usando o método listModels se a versão permitir, 
        // ou apenas testar o endpoint de listagem.

        // Como o SDK JS foca em inferência, a forma mais crua de ver os modelos 
        // é fazendo um fetch direto na API de listagem:
        const key = process.env.GOOGLE_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        console.log("=== MODELOS DISPONÍVEIS ===");
        // @ts-ignore
        data.models.forEach((m: any) => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(m.name.replace("models/", ""));
            }
        });

    } catch (error) {
        console.error("Erro ao listar:", error);
    }
}

listModels();