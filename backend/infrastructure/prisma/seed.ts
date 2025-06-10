// prisma/seed.ts
import { PrismaClient, RoleEnum } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      email: "admin@food360.local",
      password: await bcrypt.hash("123456", 10), // Properly hash the password
      role: RoleEnum.SUPERADMIN,
    },
  });

  // Create additional users for testing
  await prisma.user.createMany({
    data: [
      {
        email: "manager@food360.local",
        password: await bcrypt.hash("manager", 10),
        role: RoleEnum.MANAGER,
      },
      {
        email: "staff@food360.local",
        password: await bcrypt.hash("staff", 10),
        role: RoleEnum.STAFF,
      },
    ],
  });

  // 3. Mesas
  await prisma.table.createMany({
    data: [
      { number: 1, capacity: 4, qrCode: `table-1-${Date.now()}` },
      { number: 2, capacity: 4, qrCode: `table-2-${Date.now()}` },
      { number: 3, capacity: 6, qrCode: `table-3-${Date.now()}` },
      { number: 4, capacity: 2, qrCode: `table-4-${Date.now()}` },
      { number: 5, capacity: 8, qrCode: `table-5-${Date.now()}` },
      { number: 6, capacity: 4, qrCode: `table-6-${Date.now()}` },
      { number: 7, capacity: 2, qrCode: `table-7-${Date.now()}` },
      { number: 8, capacity: 6, qrCode: `table-8-${Date.now()}` },
      { number: 9, capacity: 4, qrCode: `table-9-${Date.now()}` },
      { number: 10, capacity: 8, qrCode: `table-10-${Date.now()}` },
    ],
  });

  // 4. Menú - Add more variety with stock images
  await prisma.menuItem.createMany({
    data: [
      { 
        sku: "QUESADILLA-CLAS", 
        name: "Quesadilla Clásica", 
        price: 15000,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
      },
      { 
        sku: "BURGER-ANGUS", 
        name: "Hamburguesa Angus", 
        price: 28000,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop"
      },
      { 
        sku: "LIMONADA-MNT", 
        name: "Limonada de Menta", 
        price: 8000,
        imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=300&fit=crop"
      },
      { 
        sku: "TACOS-PASTOR", 
        name: "Tacos al Pastor", 
        price: 18000,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop"
      },
      { 
        sku: "AREPA-QUESO", 
        name: "Arepa con Queso", 
        price: 12000,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop"
      },
      { 
        sku: "CAFE-AMERICANO", 
        name: "Café Americano", 
        price: 5000,
        imageUrl: "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=300&fit=crop"
      },
      { 
        sku: "CERVEZA-CLUB", 
        name: "Cerveza Club Colombia", 
        price: 7000,
        imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop"
      },
      { 
        sku: "BANDEJA-PAISA", 
        name: "Bandeja Paisa", 
        price: 35000,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop"
      },
      { 
        sku: "SALMON-GRILL", 
        name: "Salmón a la Parrilla", 
        price: 32000,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop"
      },
      { 
        sku: "PIZZA-MARG", 
        name: "Pizza Margherita", 
        price: 25000,
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop"
      },
      { 
        sku: "ENSALADA-CAES", 
        name: "Ensalada César", 
        price: 18000,
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop"
      },
      { 
        sku: "PASTA-CARB", 
        name: "Pasta Carbonara", 
        price: 22000,
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop"
      }
    ],
  });

  // 5. Pedido demo
  const order = await prisma.order.create({
    data: {
      status: "OPEN",
      table: { connect: { number: 1 } },
      user: { connect: { id: admin.id } },
      orderItems: {
        create: [
          {
            menuItem: { connect: { sku: "BURGER-ANGUS" } },
            quantity: 2,
            price: 28000,
          },
          {
            menuItem: { connect: { sku: "LIMONADA-MNT" } },
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
      method: "CASH",
    },
  });

  console.log("✅ Seed completed successfully");
  console.log("👤 Test users created:");
  console.log("   - admin@food360.local (password: 123456)");
  console.log("   - manager@food360.local (password: manager)");
  console.log("   - staff@food360.local (password: staff)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
