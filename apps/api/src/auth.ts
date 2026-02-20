import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';

// ============================================================
// Configuração
// ============================================================

const USERS_FILE = path.resolve(import.meta.dirname, '../users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

// ============================================================
// Tipos
// ============================================================

export interface User {
    username: string;
    passwordHash: string;
}

export interface TokenPayload {
    username: string;
}

// ============================================================
// Gestão de Usuários (arquivo JSON)
// ============================================================

async function loadUsers(): Promise<User[]> {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data) as User[];
    } catch {
        // Arquivo não existe ainda → sem usuários
        return [];
    }
}

async function saveUsers(users: User[]): Promise<void> {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function findUser(username: string): Promise<User | undefined> {
    const users = await loadUsers();
    return users.find((u) => u.username === username);
}

export async function createUser(username: string, password: string): Promise<void> {
    const users = await loadUsers();

    if (users.find((u) => u.username === username)) {
        throw new Error(`Usuário "${username}" já existe.`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ username, passwordHash });
    await saveUsers(users);
}

// ============================================================
// Autenticação
// ============================================================

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
