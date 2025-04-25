// src/resolvers.ts
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken, requireRole, Context } from './auth';
import prisma from './prisma';

export const resolvers = {
  /* ----------  Queries ---------- */
  Query: {
    // F-02: consultar menú dinámico
    items: (_: unknown, __: unknown) => {
      // público; sin restricciones
      return prisma.item.findMany();
    },
  },

  /* ----------  Mutations ---------- */
  Mutation: {
    // F-01: registro / login
    signup: async (_: any, { email, password, name, role = 'CLIENTE' }: any) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, name, password: hashed, role },
      });
      return { token: signToken(user), user };
    },

    login: async (_: any, { email, password }: any) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Usuario no existe');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Contraseña inválida');
      return { token: signToken(user), user };
    },

    // F-03: crear pedido y asignar mesa (dummy)
    createOrder: async (_: any, { tableId, itemId }: any, ctx: Context) => {
      requireRole(ctx, [Role.MESERO, Role.CLIENTE, Role.ADMIN]);

      return prisma.order.create({
        data: { tableId, itemId: Number(itemId) },
        include: {
          table: true,
          item: true,
          payment: true,
        },
      });
    },

    // F-04: procesar pago (dummy)
    createPaymentForOrder: async (_: any, { type, orderId }: any, ctx: Context) => {
      requireRole(ctx, [Role.CAJERO, Role.CLIENTE, Role.ADMIN]);

      // 1. Crea el pago
      const payment = await prisma.payment.create({
        data: { type },
      });

      // 2. Actualiza la orden para asociarla
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { paymentId: payment.id, status: 'PAID' },
      });

      // 3. Devuelve el pago con la relación 'orders'
      return prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          orders: {
            include: { table: true, item: true }, // opcional
          },
        },
      });
    },

    // F-05: CRUD menú en panel admin (dummy)
    createItem: (_: any, args: any, ctx: Context) => {
      requireRole(ctx, [Role.ADMIN, Role.SUPERADMIN]);
      return prisma.item.create({ data: args });
    },
    editItem: (_: any, { id, ...patch }: any, ctx: Context) => {
      requireRole(ctx, [Role.ADMIN, Role.SUPERADMIN]);
      return prisma.item.update({
        where: { id: Number(id) },
        data: patch,
      });
    },
    deleteItem: (_: any, { id }: any, ctx: Context) => {
      requireRole(ctx, [Role.ADMIN, Role.SUPERADMIN]);
      return prisma.item.delete({ where: { id: Number(id) } });
    },
    addTable: async (_: any, __: any, ctx: Context) => {
      requireRole(ctx, [Role.ADMIN, Role.MESERO, Role.SUPERADMIN]);
      return prisma.table.create({ data: {} });
    },
  },
};
