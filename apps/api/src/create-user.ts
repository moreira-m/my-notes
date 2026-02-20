import dotenv from 'dotenv';
import { createUser } from './auth.js';

dotenv.config();

// ============================================================
// Script CLI para criar usuários
// Uso: npx tsx src/create-user.ts <username> <password>
// ============================================================

const [, , username, password] = process.argv;

if (!username || !password) {
    console.error('❌ Uso: npx tsx src/create-user.ts <username> <password>');
    process.exit(1);
}

try {
    await createUser(username, password);
    console.log(`✅ Usuário "${username}" criado com sucesso!`);
} catch (error) {
    console.error(`❌ Erro: ${(error as Error).message}`);
    process.exit(1);
}
