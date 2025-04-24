import { Request } from 'express';
import { authenticate, Context } from './auth';
export async function createContext({ req }: { req: Request }): Promise<Context> {
  return authenticate(req);
}

export type { Context };
