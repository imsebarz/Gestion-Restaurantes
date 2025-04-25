import { Role } from '@prisma/client';

// src/graphql/types.ts
export interface GetOrdersByTableArgs {
  tableId: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface Mutation {
  signup(
    email: string,
    password: string,
    name: string,
    role?: Role, // Assuming role is optional based on GraphQL syntax without '!'
  ): AuthPayload;
}
