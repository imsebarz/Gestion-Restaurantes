// src/resolvers.ts
import { RoleEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken, requireRole, Context } from './auth';
import prisma from './prisma';

// Define interfaces for better type safety
interface CreateOrderArgs {
  tableId: string;
  itemId: string;
  paymentId?: string;
}

interface CreatePaymentArgs {
  type: string;
  orderId: string;
}

interface CreatePaymentForTableArgs {
  type: string;
  tableId: string;
}

interface CreateItemArgs {
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

interface EditItemArgs {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface SignupArgs {
  email: string;
  password: string;
  name: string;
  role?: RoleEnum;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface IdArgs {
  id: string;
}

interface TableIdArgs {
  tableId: string;
}

interface StatusArgs {
  id: string;
  status: string;
}

export const resolvers = {
  /* ----------  Queries ---------- */
  Query: {
    // F-02: consultar menú dinámico
    items: () => {
      // público; sin restricciones
      return prisma.menuItem.findMany();
    },

    // New queries from schema
    me: (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.user) throw new Error('No autorizado');
      return ctx.user;
    },

    getItemById: (_: unknown, { id }: IdArgs) => {
      return prisma.menuItem.findUnique({ where: { id: Number(id) } });
    },

    tables: (_: unknown, __: unknown, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.table.findMany();
    },

    getTableById: (_: unknown, { id }: IdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.table.findUnique({ where: { id: Number(id) } });
    },

    orders: (_: unknown, __: unknown, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.order.findMany();
    },

    getOrdersByTableId: (_: unknown, { tableId }: TableIdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.order.findMany({ where: { tableId: Number(tableId) } });
    },

    payments: (_: unknown, __: unknown, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.payment.findMany();
    },

    getPaymentById: (_: unknown, { id }: IdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.payment.findUnique({ where: { id: Number(id) } });
    },
  },

  /* ----------  Mutations ---------- */
  Mutation: {
    // F-01: registro / login
    signup: async (
      _: unknown,
      { email, password, name: _name, role = RoleEnum.STAFF }: SignupArgs,
    ) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashed, role },
      });
      return { token: signToken(user), user };
    },

    login: async (_: unknown, { email, password }: LoginArgs) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Usuario no existe');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Contraseña inválida');
      return { token: signToken(user), user };
    },

    // F-03: crear pedido y asignar mesa - Updated for new schema
    createOrder: async (_: unknown, { tableId, itemId }: CreateOrderArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

      if (!ctx.user) throw new Error('No autorizado');

      const data: {
        tableId: number;
        status: string;
        userId: number;
      } = {
        tableId: Number(tableId),
        status: 'PENDING',
        userId: ctx.user.id,
      };

      const order = await prisma.order.create({ data });

      // Get the menu item price
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: Number(itemId) },
      });

      if (!menuItem) throw new Error('Menu item not found');

      // Create order items
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: Number(itemId),
          quantity: 1,
          price: menuItem.price,
        },
      });

      return order;
    },

    // New mutations from schema
    deleteOrder: async (_: unknown, { id }: IdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.order.delete({ where: { id: Number(id) } });
    },

    setOrderStatus: async (_: unknown, { id, status }: StatusArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.order.update({
        where: { id: Number(id) },
        data: { status },
      });
    },

    cancelOrder: async (_: unknown, { id }: IdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.order.update({
        where: { id: Number(id) },
        data: { status: 'CANCELLED' },
      });
    },

    // F-04: procesar pago - Updated for new schema
    createPaymentForOrder: async (
      _: unknown,
      { type, orderId }: CreatePaymentArgs,
      ctx: Context,
    ) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

      // Get the order to calculate amount
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
        include: { orderItems: true },
      });

      if (!order) throw new Error('Order not found');
      if (!order.orderItems || order.orderItems.length === 0) throw new Error('No items in order');

      const amount = order.orderItems.reduce(
        (total, item) =>
          total +
          (typeof item.price === 'number' ? item.price : Number(item.price)) *
            Number(item.quantity),
        0,
      );

      const payment = await prisma.payment.create({
        data: {
          orderId: Number(orderId),
          amount,
          method: type,
        },
      });

      // Update order status to PAID
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { status: 'PAID' },
      });

      return payment;
    },

    createPaymentForTable: async (
      _: unknown,
      { tableId }: CreatePaymentForTableArgs,
      ctx: Context,
    ) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

      // Get all unpaid orders for the table
      const orders = await prisma.order.findMany({
        where: {
          tableId: Number(tableId),
          status: { not: 'PAID' },
        },
        include: { orderItems: { include: { menuItem: true } } },
      });

      if (orders.length === 0) throw new Error('No unpaid orders found for this table');

      // Update all orders to PAID
      const updatedOrders = await Promise.all(
        orders.map((order) =>
          prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID' },
          }),
        ),
      );

      return updatedOrders;
    },

    deletePayment: async (_: unknown, { id }: IdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.payment.delete({ where: { id: Number(id) } });
    },

    // F-05: CRUD menú en panel admin - Updated for new schema
    createItem: (_: unknown, { title, price }: CreateItemArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.menuItem.create({
        data: {
          sku: `${title.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`,
          name: title,
          price,
        },
      });
    },

    editItem: (_: unknown, { id, title, price }: EditItemArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      const updateData: {
        name?: string;
        price?: number;
      } = {};
      if (title !== undefined) updateData.name = title;
      if (price !== undefined) updateData.price = price;

      return prisma.menuItem.update({
        where: { id: Number(id) },
        data: updateData,
      });
    },

    deleteItem: (_: unknown, { id }: IdArgs, ctx: Context) => {
      requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return prisma.menuItem.delete({ where: { id: Number(id) } });
    },

    addTable: async (_: unknown, __: unknown, ctx: Context) => {
      requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.STAFF, RoleEnum.SUPERADMIN]);
      // Find the highest table number and add 1
      const lastTable = await prisma.table.findFirst({
        orderBy: { number: 'desc' },
      });
      const nextNumber = lastTable ? lastTable.number + 1 : 1;

      return prisma.table.create({
        data: {
          number: nextNumber,
          capacity: 4, // default capacity
        },
      });
    },

    removeTable: async (_: unknown, __: unknown, ctx: Context) => {
      requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      // Remove the table with the highest number
      const lastTable = await prisma.table.findFirst({
        orderBy: { number: 'desc' },
      });

      if (!lastTable) throw new Error('No tables to remove');

      return prisma.table.delete({ where: { id: lastTable.id } });
    },
  },
};
