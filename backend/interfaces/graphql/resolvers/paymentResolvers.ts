import { GraphQLContext } from "../context";
import { RoleEnum } from "@prisma/client";

function requireRole(context: GraphQLContext, allowedRoles: RoleEnum[]): void {
  if (!context.user) {
    throw new Error("No autorizado");
  }
  if (!allowedRoles.includes(context.user.role)) {
    throw new Error("Permiso insuficiente");
  }
}

export const paymentResolvers = {
  Mutation: {
    createPaymentForOrder: async (
      _: unknown,
      args: { type: string; orderId: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

      // Get the order to calculate amount
      const order = await context.repositories.orderRepository.findById(Number(args.orderId));
      if (!order) throw new Error("Order not found");

      const amount = order.getTotalAmount();

      // Create payment record and update order status
      const payment = await context.repositories.orderRepository.processPayment(
        Number(args.orderId),
        {
          amount,
          method: args.type,
        }
      );

      return payment;
    },

    createPaymentForTable: async (
      _: unknown,
      args: { type: string; tableId: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

      // Get all unpaid orders for the table
      const orders = await context.repositories.orderRepository.findUnpaidByTableId(Number(args.tableId));

      if (orders.length === 0) {
        throw new Error("No unpaid orders found for this table");
      }

      // Process payment for all orders
      const updatedOrders = await Promise.all(
        orders.map(order =>
          context.repositories.orderRepository.processPayment(order.id, {
            amount: order.getTotalAmount(),
            method: args.type,
          })
        )
      );

      return orders; // Return the original orders as they were before payment
    },
  },
};