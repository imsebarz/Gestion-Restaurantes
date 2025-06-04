import { RoleEnum } from '@prisma/client';

// src/graphql/types.ts
export interface GetOrdersByTableArgs {
  tableId: string;
}

export interface User {
  id: string;
  email: string;
  role: RoleEnum;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface Mutation {
  signup(email: string, password: string, name: string, role?: RoleEnum): AuthPayload;
}
