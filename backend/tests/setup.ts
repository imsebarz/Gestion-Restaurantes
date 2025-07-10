// Test setup file
import { PrismaClient } from '@prisma/client';

// Mock JWT for testing
process.env.JWT_SECRET = 'test-secret-key';

// Create test database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Clean up after each test
global.afterEach(async () => {
  // Clear all tables but preserve structure
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  } catch (error) {
    console.log({ error });
  }
});

// Close connection after all tests
global.afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
