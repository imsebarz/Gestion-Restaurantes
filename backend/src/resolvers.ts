import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { APP_SECRET, requireAuth } from './auth';
import { Context } from './context';

export const resolvers = {
  Query: {
    items: () => prisma.item.findMany(),
    getOrdersByTableId: (_: any, { tableId }: any) =>
      prisma.order.findMany({ where: { tableId }, include: { item: true } }),
  },
  Mutation: {
    signup: async (_: any, { email, password, name }: any) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, name, password: hashed } });
      const token = jwt.sign({ userId: user.id }, APP_SECRET);
      return { token, user };
    },
    login: async (_: any, { email, password }: any) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Usuario no existe');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Contraseña inválida');
      const token = jwt.sign({ userId: user.id }, APP_SECRET);
      return { token, user };
    },
    createOrder: async (_: any, { tableId, itemId }: any, ctx: Context) => {
      requireAuth(ctx);
      return prisma.order.create({ data: { tableId, itemId: Number(itemId) } });
    },
    createPaymentForOrder: async (_: any, { type, orderId }: any, ctx: Context) => {
      requireAuth(ctx);
      const payment = await prisma.payment.create({ data: { type } });
      await prisma.order.update({
        where: { id: Number(orderId) },
        data: { paymentId: payment.id, status: 'PAID' },
      });
      return payment;
    },
  },
};
