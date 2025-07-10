import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { createYoga, createSchema } from 'graphql-yoga';
import { createServer } from 'http';

/**
 * Utilidades para Pruebas BDD y Unit Tests
 * 
 * Este archivo contiene funciones helpers que se reutilizan
 * en múltiples archivos de prueba para mantener consistencia
 * y reducir duplicación de código.
 */

// === TIPOS Y INTERFACES ===

export interface TestUser {
  id: number;
  email: string;
  role: string;
  token: string;
}

export interface TestMenuItem {
  id: number;
  sku: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface TestTable {
  id: number;
  number: number;
  capacity: number;
  qrCode: string;
}

export interface TestOrder {
  id: number;
  status: string;
  tableId: number;
  userId: number;
  totalAmount?: number;
}

export interface CreateOrderRequest {
  qrCode: string;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
}

// === CONSTANTES DE PRUEBA ===

export const TEST_JWT_SECRET = 'test-secret-key-very-long-and-secure';

export const DEFAULT_TEST_USERS = {
  manager: {
    email: 'manager@food360.local',
    password: 'manager',
    role: 'MANAGER'
  },
  staff: {
    email: 'staff@food360.local',
    password: 'staff',
    role: 'STAFF'
  },
  cashier: {
    email: 'cashier@food360.local',
    password: 'cashier',
    role: 'STAFF'
  }
};

export const DEFAULT_TEST_MENU_ITEMS = [
  {
    sku: 'BURGER-001',
    name: 'Hamburguesa Clásica',
    price: 15000,
    isAvailable: true,
    imageUrl: 'https://example.com/burger.jpg',
  },
  {
    sku: 'PIZZA-001',
    name: 'Pizza Margherita',
    price: 18000,
    isAvailable: true,
    imageUrl: 'https://example.com/pizza.jpg',
  },
  {
    sku: 'PASTA-001',
    name: 'Pasta Carbonara',
    price: 16000,
    isAvailable: true,
    imageUrl: 'https://example.com/pasta.jpg',
  },
  {
    sku: 'SALAD-001',
    name: 'Ensalada César',
    price: 12000,
    isAvailable: true,
    imageUrl: 'https://example.com/salad.jpg',
  },
  {
    sku: 'DRINK-001',
    name: 'Coca Cola',
    price: 4000,
    isAvailable: true,
    imageUrl: 'https://example.com/coke.jpg',
  }
];

export const DEFAULT_TEST_TABLES = [
  {
    number: 7,
    capacity: 4,
    qrCode: 'table-7-123456789'
  },
  {
    number: 8,
    capacity: 6,
    qrCode: 'table-8-987654321'
  },
  {
    number: 9,
    capacity: 2,
    qrCode: 'table-9-555666777'
  }
];

// === FUNCIONES DE SETUP Y CLEANUP ===

/**
 * Limpia todos los datos de prueba de la base de datos
 */
export async function cleanupTestDatabase(prisma: PrismaClient): Promise<void> {
  try {
    // Limpiar en orden correcto para evitar violaciones de foreign key
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.table.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

/**
 * Inicializa la base de datos con datos de prueba básicos
 */
export async function setupTestDatabase(prisma: PrismaClient): Promise<{
  users: TestUser[];
  menuItems: TestMenuItem[];
  tables: TestTable[];
}> {
  const bcrypt = require('bcryptjs');

  // Crear usuarios
  const userPromises = Object.entries(DEFAULT_TEST_USERS).map(async ([key, userData]) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role as any,
      },
    });
  });

  const createdUsers = await Promise.all(userPromises);

  // Generar tokens JWT
  const users: TestUser[] = createdUsers.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    token: sign(
      { id: user.id, email: user.email, role: user.role },
      TEST_JWT_SECRET,
      { expiresIn: '24h' }
    )
  }));

  // Crear items de menú
  const menuItemPromises = DEFAULT_TEST_MENU_ITEMS.map(item =>
    prisma.menuItem.create({ data: item })
  );

  const createdMenuItems = await Promise.all(menuItemPromises);
  const menuItems: TestMenuItem[] = createdMenuItems.map(item => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    price: Number(item.price),
    isAvailable: item.isAvailable
  }));

  // Crear mesas
  const tablePromises = DEFAULT_TEST_TABLES.map(table =>
    prisma.table.create({ data: table })
  );

  const createdTables = await Promise.all(tablePromises);
  const tables: TestTable[] = createdTables.map(table => ({
    id: table.id,
    number: table.number,
    capacity: table.capacity!,
    qrCode: table.qrCode!
  }));

  return { users, menuItems, tables };
}

// === FUNCIONES DE UTILIDAD PARA GRAPHQL ===

/**
 * Crea un cliente GraphQL simplificado para pruebas
 */
export function createTestGraphQLClient(schema: any) {
  const yoga = createYoga({
    schema,
    context: () => ({}),
  });

  return {
    execute: async (query: string, variables?: any, token?: string) => {
      const request = require('supertest');
      const requestBuilder = request(yoga)
        .post('/graphql')
        .send({ query, variables });

      if (token) {
        requestBuilder.set('Authorization', `Bearer ${token}`);
      }

      return await requestBuilder;
    }
  };
}

/**
 * Esquema GraphQL simplificado para pruebas
 */
export const TEST_GRAPHQL_SCHEMA = `
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
    receiptNumber: String
  }

  input OrderItemInput {
    menuItemId: ID!
    quantity: Int!
  }

  input MenuItemFilter {
    name: String
    priceMin: Float
    priceMax: Float
    isAvailable: Boolean
  }

  type Query {
    items(filter: MenuItemFilter): [MenuItem!]!
    orders: [Order!]!
    tables: [Table!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createOrderByQrCode(qrCode: String!, items: [OrderItemInput!]!): Order!
    setOrderStatus(id: String!, status: String!): Order!
    createPaymentForOrder(type: String!, orderId: ID!): Payment!
  }

  type Subscription {
    orderStatusChanged: Order!
  }
`;

// === FUNCIONES DE VALIDACIÓN ===

/**
 * Valida la estructura de una respuesta GraphQL
 */
export function validateGraphQLResponse(response: any, expectedFields: string[]): void {
  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
  
  if (response.body.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(response.body.errors)}`);
  }

  expect(response.body.data).toBeDefined();

  expectedFields.forEach(field => {
    expect(response.body.data).toHaveProperty(field);
  });
}

/**
 * Valida la estructura de un error GraphQL
 */
export function validateGraphQLError(response: any, expectedErrorMessage?: string): void {
  expect(response.body.errors).toBeDefined();
  expect(response.body.errors).toHaveLength(1);

  if (expectedErrorMessage) {
    expect(response.body.errors[0].message).toContain(expectedErrorMessage);
  }
}

/**
 * Valida la estructura de un pedido
 */
export function validateOrder(order: any): void {
  expect(order).toHaveProperty('id');
  expect(order).toHaveProperty('status');
  expect(order).toHaveProperty('tableId');
  expect(order).toHaveProperty('userId');
  expect(order).toHaveProperty('createdAt');
  expect(order).toHaveProperty('orderItems');
  
  if (order.orderItems && order.orderItems.length > 0) {
    order.orderItems.forEach((item: any) => {
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('menuItem');
      expect(item.menuItem).toHaveProperty('name');
      expect(item.menuItem).toHaveProperty('price');
    });
  }
}

/**
 * Valida la estructura de un pago
 */
export function validatePayment(payment: any): void {
  expect(payment).toHaveProperty('id');
  expect(payment).toHaveProperty('orderId');
  expect(payment).toHaveProperty('amount');
  expect(payment).toHaveProperty('method');
  expect(payment).toHaveProperty('paidAt');
  
  expect(typeof payment.amount).toBe('number');
  expect(payment.amount).toBeGreaterThan(0);
  expect(['CASH', 'CARD', 'TRANSFER']).toContain(payment.method);
}

// === FUNCIONES DE GENERACIÓN DE DATOS ===

/**
 * Genera datos de prueba aleatorios para un pedido
 */
export function generateRandomOrderData(tableQrCode: string, menuItems: TestMenuItem[]): CreateOrderRequest {
  const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
  const selectedItems = menuItems
    .filter(item => item.isAvailable)
    .sort(() => 0.5 - Math.random())
    .slice(0, numItems);

  return {
    qrCode: tableQrCode,
    items: selectedItems.map(item => ({
      menuItemId: item.id,
      quantity: Math.floor(Math.random() * 3) + 1 // 1-3 quantity
    }))
  };
}

/**
 * Calcula el total esperado de un pedido
 */
export function calculateOrderTotal(
  items: Array<{ menuItemId: number; quantity: number }>,
  menuItems: TestMenuItem[]
): number {
  return items.reduce((total, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
    return total + (menuItem.price * item.quantity);
  }, 0);
}

// === FUNCIONES DE TIEMPO Y PERFORMANCE ===

/**
 * Mide el tiempo de ejecución de una función
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  const duration = endTime - startTime;

  return { result, duration };
}

/**
 * Espera un tiempo determinado (útil para simular delays)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === MOCKS Y STUBS ===

/**
 * Crea mocks básicos para repositorios
 */
export function createRepositoryMocks() {
  return {
    userRepository: {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orderRepository: {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      addOrderItem: jest.fn(),
      findMany: jest.fn(),
    },
    menuItemRepository: {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tableRepository: {
      findById: jest.fn(),
      findByQrCode: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    paymentRepository: {
      findById: jest.fn(),
      create: jest.fn(),
      findByOrderId: jest.fn(),
    }
  };
}

// === ASSERTIONS PERSONALIZADAS ===

/**
 * Verifica que un objeto tenga las propiedades de timestamp válidas
 */
export function expectValidTimestamps(obj: any): void {
  if (obj.createdAt) {
    expect(new Date(obj.createdAt)).toBeInstanceOf(Date);
    expect(new Date(obj.createdAt).getTime()).not.toBeNaN();
  }
  
  if (obj.updatedAt) {
    expect(new Date(obj.updatedAt)).toBeInstanceOf(Date);
    expect(new Date(obj.updatedAt).getTime()).not.toBeNaN();
  }
}

/**
 * Verifica que un precio sea válido
 */
export function expectValidPrice(price: any): void {
  expect(typeof price).toBe('number');
  expect(price).toBeGreaterThan(0);
  expect(price).toBeLessThan(1000000); // Precio máximo razonable
  expect(price % 1).toBe(0); // Entero (pesos colombianos)
}

/**
 * Verifica que una cantidad sea válida
 */
export function expectValidQuantity(quantity: any): void {
  expect(typeof quantity).toBe('number');
  expect(quantity).toBeGreaterThan(0);
  expect(quantity).toBeLessThan(100); // Cantidad máxima razonable
  expect(quantity % 1).toBe(0); // Entero
}
