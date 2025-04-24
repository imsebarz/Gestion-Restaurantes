import { verify, sign, JwtPayload } from 'jsonwebtoken';
import prisma from './prisma';
export const APP_SECRET = process.env.APP_SECRET!;
export interface Context {
  userId: number | null;
}
export function getTokenPayload(token: string): JwtPayload {
  return verify(token, APP_SECRET) as JwtPayload;
}
export async function authenticate(req: any): Promise<Context> {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return { userId: null };
  try {
    const payload = getTokenPayload(token);
    return { userId: payload.userId };
  } catch {
    return { userId: null };
  }
}
export function requireAuth(ctx: Context) {
  if (!ctx.userId) throw new Error('No autorizado');
}
