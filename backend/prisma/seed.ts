// prisma/seed.ts
import { PrismaClient, RoleEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Limpiar tablas dependientes (mantener idempotencia)
  await prisma.$transaction([
    prisma.payment.deleteMany({}),
    prisma.orderItem.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.table.deleteMany({}),
    prisma.menuItem.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  // 2. Usuarios y roles
  const admin = await prisma.user.create({
    data: {
      email: 'admin@food360.local',
      password: await bcrypt.hash('123456', 10), // Properly hash the password
      role: RoleEnum.SUPERADMIN,
    },
  });

  // Create additional users for testing
  await prisma.user.createMany({
    data: [
      {
        email: 'manager@food360.local',
        password: await bcrypt.hash('manager', 10),
        role: RoleEnum.MANAGER,
      },
      {
        email: 'staff@food360.local',
        password: await bcrypt.hash('staff', 10),
        role: RoleEnum.STAFF,
      },
    ],
  });

  // 3. Mesas
  await prisma.table.createMany({
    data: [
      { number: 1, capacity: 4 },
      { number: 2, capacity: 4 },
      { number: 3, capacity: 6 },
      { number: 4, capacity: 2 },
      { number: 5, capacity: 8 },
      { number: 6, capacity: 4 },
      { number: 7, capacity: 2 },
      { number: 8, capacity: 6 },
      { number: 9, capacity: 4 },
      { number: 10, capacity: 8 },
    ],
  });

  // 4. Menú - Add more variety
  await prisma.menuItem.createMany({
    data: [
      { sku: 'QUESADILLA-CLAS', name: 'Quesadilla Clásica', price: 15000 },
      { sku: 'BURGER-ANGUS', name: 'Hamburguesa Angus', price: 28000 },
      { sku: 'LIMONADA-MNT', name: 'Limonada de Menta', price: 8000 },
      { sku: 'TACOS-PASTOR', name: 'Tacos al Pastor', price: 18000 },
      { sku: 'AREPA-QUESO', name: 'Arepa con Queso', price: 12000 },
      { sku: 'CAFE-AMERICANO', name: 'Café Americano', price: 5000 },
      { sku: 'CERVEZA-CLUB', name: 'Cerveza Club Colombia', price: 7000 },
    ],
  });

  // 5. Pedido demo
  const order = await prisma.order.create({
    data: {
      status: 'OPEN',
      table: { connect: { number: 1 } },
      user: { connect: { id: admin.id } },
      orderItems: {
        create: [
          {
            menuItem: { connect: { sku: 'BURGER-ANGUS' } },
            quantity: 2,
            price: 28000,
          },
          {
            menuItem: { connect: { sku: 'LIMONADA-MNT' } },
            quantity: 2,
            price: 8000,
          },
        ],
      },
    },
  });

  // 6. Pago demo
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: 2 * 28000 + 2 * 8000,
      method: 'CASH',
    },
  });

  console.log('✅ Seed completed successfully');
  console.log('👤 Test users created:');
  console.log('   - admin@food360.local (password: 123456)');
  console.log('   - manager@food360.local (password: manager)');
  console.log('   - staff@food360.local (password: staff)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });