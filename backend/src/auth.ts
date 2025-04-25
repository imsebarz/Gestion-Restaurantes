// src/auth.ts
import { verify, sign, JwtPayload } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export const APP_SECRET = process.env.APP_SECRET!;

export interface JwtData extends JwtPayload {
  userId: number;
  role: Role;
}

export interface Context {
  userId: number | null;
  role: Role | null;
}

/** Firma el JWT con id y rol */
export function signToken(user: { id: number; role: Role }): string {
  return sign({ userId: user.id, role: user.role }, APP_SECRET, { expiresIn: '7d' });
}

export function getTokenPayload(token: string): JwtData {
  return verify(token, APP_SECRET) as JwtData;
}

export async function authenticate(req: any): Promise<Context> {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return { userId: null, role: null };

  try {
    const { userId, role } = getTokenPayload(auth.replace('Bearer ', ''));
    return { userId, role };
  } catch {
    return { userId: null, role: null };
  }
}

/** Protege un resolver cualquiera — login ya no lo usa */
export function requireAuth(ctx: Context): void {
  if (!ctx.userId) throw new Error('No autorizado');
}

/** Autoriza sólo si el rol actual está incluido en la lista */
export function requireRole(ctx: Context, allowed: Role[]): void {
  requireAuth(ctx);
  if (!ctx.role || !allowed.includes(ctx.role)) {
    throw new Error('Permiso insuficiente');
  }
}
