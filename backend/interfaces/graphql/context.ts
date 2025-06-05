import DataLoader from "dataloader";
import { RoleEnum } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { MenuItem } from "../../domain/entities/MenuItem";
import { Table } from "../../domain/entities/Table";
import { Order } from "../../domain/entities/Order";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { PrismaMenuItemRepository } from "../../infrastructure/repositories/PrismaMenuItemRepository";
import { PrismaTableRepository } from "../../infrastructure/repositories/PrismaTableRepository";
import { PrismaOrderRepository } from "../../infrastructure/repositories/PrismaOrderRepository";
import { AuthenticateUser } from "../../application/useCases/UserAuthentication";
import jwt from "jsonwebtoken";

export interface GraphQLContext {
  user?: User;
  dataloaders: {
    userLoader: DataLoader<number, User | null>;
    menuItemLoader: DataLoader<number, MenuItem | null>;
    tableLoader: DataLoader<number, Table | null>;
    orderLoader: DataLoader<number, Order | null>;
    ordersByTableLoader: DataLoader<number, Order[]>;
  };
  repositories: {
    userRepository: PrismaUserRepository;
    menuItemRepository: PrismaMenuItemRepository;
    tableRepository: PrismaTableRepository;
    orderRepository: PrismaOrderRepository;
  };
  useCases: {
    authenticateUser: AuthenticateUser;
  };
}

// Type alias for Context used in resolvers
export type Context = GraphQLContext;

// Authentication utilities
export function signToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );
}

export function requireRole(ctx: Context, allowedRoles: RoleEnum[]): void {
  if (!ctx.user) {
    throw new Error("No autorizado");
  }
  
  if (!allowedRoles.includes(ctx.user.role as RoleEnum)) {
    throw new Error("No tienes permisos para realizar esta acción");
  }
}

export async function createGraphQLContext(req: any): Promise<GraphQLContext> {
  console.log('=== CONTEXT DEBUG ===');
  console.log('Request type:', typeof req);
  console.log('Request keys:', req ? Object.keys(req) : 'no request');
  
  // Handle different request types (Express vs GraphQL Yoga)
  let authHeader: string | null = null;
  
  if (req?.headers) {
    // Check if headers is a Headers-like object with .get() method
    if (typeof req.headers.get === 'function') {
      authHeader = req.headers.get('authorization');
      console.log('Headers is Headers-like object, using .get() method');
    } else if (req.headers.authorization) {
      // Standard object headers
      authHeader = req.headers.authorization;
      console.log('Headers is standard object');
    }
  }
  
  console.log('Authorization header extracted:', authHeader);
  
  // Initialize repositories
  const userRepository = new PrismaUserRepository();
  const menuItemRepository = new PrismaMenuItemRepository();
  const tableRepository = new PrismaTableRepository();
  const orderRepository = new PrismaOrderRepository();

  // Initialize use cases
  const authenticateUser = new AuthenticateUser(userRepository);

  // Create DataLoaders
  const userLoader = new DataLoader<number, User | null>(async (ids) => {
    const users = await Promise.all(
      ids.map((id) => userRepository.findById(id)),
    );
    return users;
  });

  const menuItemLoader = new DataLoader<number, MenuItem | null>(
    async (ids) => {
      const items = await Promise.all(
        ids.map((id) => menuItemRepository.findById(id)),
      );
      return items;
    },
  );

  const tableLoader = new DataLoader<number, Table | null>(async (ids) => {
    const tables = await Promise.all(
      ids.map((id) => tableRepository.findById(id)),
    );
    return tables;
  });

  const orderLoader = new DataLoader<number, Order | null>(async (ids) => {
    const orders = await Promise.all(
      ids.map((id) => orderRepository.findById(id)),
    );
    return orders;
  });

  const ordersByTableLoader = new DataLoader<number, Order[]>(
    async (tableIds) => {
      const ordersByTable = await Promise.all(
        tableIds.map((tableId) => orderRepository.findByTableId(tableId)),
      );
      return ordersByTable;
    },
  );

  // Extract user from JWT token
  let user: User | undefined;
  
  console.log('Auth header present:', !!authHeader);
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      ) as any;
      
      console.log('JWT decoded successfully:', decoded);
      
      // Use the correct field name from the JWT payload
      const userId = decoded.id || decoded.userId;
      console.log('User ID from token:', userId);
      
      if (userId) {
        const loadedUser = await userLoader.load(userId);
        console.log('User loaded from DB:', loadedUser);
        user = loadedUser || undefined;
      }
    } catch (error) {
      // Invalid token, user remains undefined
      console.log('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  } else {
    console.log('No valid Bearer token found');
  }
  
  console.log('Final context user:', user);
  console.log('==================');

  return {
    user,
    dataloaders: {
      userLoader,
      menuItemLoader,
      tableLoader,
      orderLoader,
      ordersByTableLoader,
    },
    repositories: {
      userRepository,
      menuItemRepository,
      tableRepository,
      orderRepository,
    },
    useCases: {
      authenticateUser,
    },
  };
}
