// src/server.ts
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { createYoga, createSchema } from "graphql-yoga";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { createGraphQLContext } from "../interfaces/graphql/context";
import { menuResolvers } from "../interfaces/graphql/resolvers/menuResolvers";
import { orderResolvers } from "../interfaces/graphql/resolvers/orderResolvers";
import { userResolvers } from "../interfaces/graphql/resolvers/userResolvers";
import { tableResolvers } from "../interfaces/graphql/resolvers/tableResolvers";
import { paymentResolvers } from "../interfaces/graphql/resolvers/paymentResolvers";
import { subscriptionResolvers } from "../interfaces/graphql/resolvers/subscriptionResolvers";

// GraphQL Type Definitions
const typeDefs = `
  scalar DateTime

  enum OrderStatus {
    OPEN
    PENDING
    PREPARING
    READY
    DELIVERED
    PAID
    CANCELLED
  }

  enum RoleEnum {
    SUPERADMIN
    MANAGER
    STAFF
  }

  type User {
    id: Int!
    email: String!
    role: RoleEnum!
    createdAt: DateTime!
  }

  type MenuItem {
    id: Int!
    sku: String!
    name: String!
    price: Float!
    imageUrl: String
    isAvailable: Boolean!
    createdAt: DateTime!
  }

  type Table {
    id: Int!
    number: Int!
    capacity: Int!
    qrCode: String
    orders: [Order!]!
  }

  type OrderItem {
    id: Int!
    orderId: Int!
    menuItemId: Int!
    menuItem: MenuItem!
    quantity: Int!
    price: Float!
    total: Float!
  }

  type Order {
    id: Int!
    status: OrderStatus!
    tableId: Int!
    table: Table!
    userId: Int!
    user: User!
    createdAt: DateTime!
    orderItems: [OrderItem!]!
    totalAmount: Float!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type MenuItemEdge {
    node: MenuItem!
    cursor: String!
  }

  type MenuItemConnection {
    edges: [MenuItemEdge!]!
    pageInfo: PageInfo!
  }

  type OrderEdge {
    node: Order!
    cursor: String!
  }

  type OrderConnection {
    edges: [OrderEdge!]!
    pageInfo: PageInfo!
  }

  input MenuItemFilter {
    name: String
    priceMin: Float
    priceMax: Float
    isAvailable: Boolean
  }

  input MenuItemSort {
    field: String!
    order: String!
  }

  input TableFilter {
    number: Int
    capacityMin: Int
    capacityMax: Int
    hasQrCode: Boolean
  }

  input TableSort {
    field: String!
    order: String!
  }

  input OrderFilter {
    status: OrderStatus
    tableId: Int
    userId: Int
    createdAfter: String
    createdBefore: String
  }

  input OrderSort {
    field: String!
    order: String!
  }

  input CreateOrderByQrCodeInput {
    qrCode: String!
    items: [CreateOrderItemInput!]!
  }

  input CreateOrderItemInput {
    menuItemId: Int!
    quantity: Int!
  }

  input UpdateOrderStatusInput {
    orderId: Int!
    status: OrderStatus!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Payment {
    id: ID!
    orderId: Int!
    amount: Float!
    method: String!
    paidAt: String!
  }

  input OrderItemInput {
    menuItemId: ID!
    quantity: Int!
  }

  type Query {
    menuItems(
      filter: MenuItemFilter
      sort: MenuItemSort
      first: Int
      after: String
    ): MenuItemConnection!
    
    # Add the items field that the frontend expects
    items(
      filter: MenuItemFilter
      sort: MenuItemSort
      limit: Int
      offset: Int
    ): [MenuItem!]!
    
    menuItem(id: Int!): MenuItem
    
    # User queries
    me: User!
    
    # Table queries
    tables(
      filter: TableFilter
      sort: TableSort
      limit: Int
      offset: Int
    ): [Table!]!
    getTableById(id: Int!): Table
    getTableByQrCode(qrCode: String!): Table
    
    # Order queries
    orders(
      filter: OrderFilter
      sort: OrderSort
      first: Int
      after: String
    ): OrderConnection!
    
    order(id: Int!): Order
    ordersByQrCode(qrCode: String!): [Order!]!
    getOrdersByQrCode(qrCode: String!): [Order!]!
  }

  type Mutation {
    # Authentication
    login(email: String!, password: String!): AuthPayload!
    signup(email: String!, password: String!, name: String, role: RoleEnum): AuthPayload!
    
    # Menu management
    createItem(title: String!, price: Float!, imageUrl: String): MenuItem!
    editItem(id: ID!, title: String, price: Float, imageUrl: String): MenuItem!
    deleteItem(id: ID!): MenuItem!
    
    # Table management
    addTable: Table!
    removeTable: Table!
    generateQrCodeForTable(tableId: ID!): Table!
    
    # Order management
    createOrder(tableId: ID!, itemId: ID!): Order!
    createOrderByQrCode(qrCode: String!, items: [OrderItemInput!]!): Order!
    setOrderStatus(id: ID!, status: String!): Order!
    deleteOrder(id: ID!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!
    
    # Payment management
    createPaymentForOrder(type: String!, orderId: ID!): Payment!
    createPaymentForTable(type: String!, tableId: ID!): [Order!]!
  }

  type Subscription {
    orderCreated: Order!
    orderUpdated: Order!
    orderStatusChanged: Order!
  }
`;

// Merge resolvers from domain modules
const resolvers = {
  Query: {
    ...menuResolvers.Query,
    ...orderResolvers.Query,
    ...userResolvers.Query,
    ...tableResolvers.Query,
  },
  Mutation: {
    ...menuResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...userResolvers.Mutation,
    ...tableResolvers.Mutation,
    ...paymentResolvers.Mutation,
  },
  Subscription: {
    ...subscriptionResolvers.Subscription,
  },
  MenuItem: {
    ...menuResolvers.MenuItem,
  },
  Order: {
    ...orderResolvers.Order,
  },
  OrderItem: {
    ...orderResolvers.OrderItem,
  },
  Table: {
    ...tableResolvers.Table,
  },
  DateTime: {
    serialize: (value: Date | string | number) => {
      // Si el valor es nulo o undefined, devolver null
      if (value == null) return null;
      
      // Si es un número (timestamp), convertir a Date
      if (typeof value === 'number') {
        const date = new Date(value);
        return date.toISOString();
      }
      
      // Si es una string, verificar si es una fecha válida
      if (typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date string: ${value}`);
        }
        return date.toISOString();
      }
      
      // Si es una instancia de Date
      if (value instanceof Date) {
        if (isNaN(value.getTime())) {
          throw new Error(`Invalid Date object`);
        }
        return value.toISOString();
      }
      
      // Si llegamos aquí, el tipo no es válido
      throw new Error(`Value is not a valid date: ${value} (type: ${typeof value})`);
    },
    parseValue: (value: string) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${value}`);
      }
      return date;
    },
    parseLiteral: (ast: { value: string }) => {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date string: ${ast.value}`);
      }
      return date;
    },
  },
};

async function main(): Promise<void> {
  const app = express();
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));
  app.use(express.json());

  // Build GraphQL schema
  const schema = createSchema({ typeDefs, resolvers });

  // Initialize Yoga with proper context function
  const yoga = createYoga({
    schema,
    context: async (params) => {
      // Extract the request object from GraphQL Yoga context
      const req = params.request;
      return createGraphQLContext(req);
    },
    // Habilitar CORS para WebSockets
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    graphiql: {
      defaultQuery: `
        query GetMenuItems {
          menuItems(first: 10) {
            edges {
              node {
                id
                name
                price
                isAvailable
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }

        mutation CreateOrder {
          createOrderByQrCode(qrCode: "table-1-123456789", items: [
            { menuItemId: "1", quantity: 2 }
            { menuItemId: "2", quantity: 1 }
          ]) {
            id
            status
            totalAmount
            table {
              number
            }
            orderItems {
              quantity
              price
              total
              menuItem {
                name
              }
            }
          }
        }
        
        subscription OnOrderCreated {
          orderCreated {
            id
            status
            tableId
            userId
            createdAt
            orderItems {
              id
              quantity
              price
              menuItem {
                id
                name
                price
              }
            }
            table {
              id
              number
            }
          }
        }
      `,
      headers: JSON.stringify(
        {
          Authorization: "Bearer TOKEN_DE_EJEMPLO",
        },
        null,
        2,
      ),
    },
  });

  const port = process.env.PORT ?? 4000;
  const httpServer = createServer(app);

  // Configurar WebSocket Server para suscripciones
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Configurar el servidor de GraphQL-WS
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        // Extraer token de los parámetros de conexión
        const authHeader = ctx.connectionParams?.authorization;
        
        // Crear un objeto request mock para el contexto
        const mockRequest = {
          headers: {
            authorization: authHeader || '',
            get: (name: string) => {
              if (name.toLowerCase() === 'authorization') {
                return authHeader || '';
              }
              return '';
            }
          }
        };
        
        return createGraphQLContext(mockRequest);
      },
      onConnect: (ctx) => {
        console.log('🔌 WebSocket client connected for subscriptions');
        return true;
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket client disconnected');
      },
    },
    wsServer
  );

  // Use Yoga as Express middleware
  app.use("/graphql", yoga as any);
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    serverCleanup.dispose();
    httpServer.close(() => {
      console.log('HTTP server closed');
    });
  });
  
  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    console.log(`🔌 WebSocket server ready at ws://localhost:${port}/graphql`);
  });
}

main().catch(console.error);
