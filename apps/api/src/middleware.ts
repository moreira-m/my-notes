import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './auth.js';

// ============================================================
// Middleware de Autenticação
// ============================================================

/**
 * Middleware que exige um JWT válido no header Authorization.
 * Uso: app.post('/rota-protegida', requireAuth, handler)
 *
 * Header esperado: Authorization: Bearer <token>
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido. Faça login primeiro.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Token inválido.' });
        return;
    }

    try {
        const payload = verifyToken(token);
        // Anexa o usuário ao request para uso nos handlers
        (req as any).user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Token expirado ou inválido. Faça login novamente.' });
    }
}
