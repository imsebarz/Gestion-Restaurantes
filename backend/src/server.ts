// src/server.ts
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import { createYoga, createSchema } from "graphql-yoga";
import { createGraphQLContext } from "../interfaces/graphql/context";
import { menuResolvers } from "../interfaces/graphql/resolvers/menuResolvers";
import { orderResolvers } from "../interfaces/graphql/resolvers/orderResolvers";
import { userResolvers } from "../interfaces/graphql/resolvers/userResolvers";
import { tableResolvers } from "../interfaces/graphql/resolvers/tableResolvers";
import { paymentResolvers } from "../interfaces/graphql/resolvers/paymentResolvers";

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
    createItem(title: String!, price: Float!): MenuItem!
    editItem(id: ID!, title: String, price: Float): MenuItem!
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
    serialize: (value: Date | string) =>
      value instanceof Date ? value.toISOString() : value,
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: { value: string }) => new Date(ast.value),
  },
};

async function main(): Promise<void> {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Build GraphQL schema
  const schema = createSchema({ typeDefs, resolvers });

  // Initialize Yoga with proper context function
  const yoga = createYoga({
    schema,
    context: async (params) => {
      // Extract the request object from GraphQL Yoga context
      const req = params.request;
      console.log('=== YOGA CONTEXT DEBUG ===');
      console.log('Yoga params:', Object.keys(params));
      console.log('Request object exists:', !!req);
      console.log('Request headers:', req?.headers);
      console.log('========================');
      
      return createGraphQLContext(req);
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

  // Express middleware bridge for Yoga at /graphql
  app.use("/graphql", (req: Request, res: Response, next: NextFunction) => {
    yoga(req, res).catch(next);
  });

  const port = process.env.PORT ?? 4000;
  createServer(app).listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    console.log(`📊 Clean Architecture + Screaming Architecture implemented`);
    console.log(`🔄 DataLoader optimization enabled`);
    console.log(`📄 Cursor-based pagination ready`);
  });
}

main().catch(console.error);
