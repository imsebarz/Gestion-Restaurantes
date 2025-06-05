import { GraphQLContext } from "../context";
import { CreateOrderByQrCode } from "../../../application/useCases/CreateOrderByQrCode";
import { UpdateOrderStatus } from "../../../application/useCases/UpdateOrderStatus";
import { OrderStatus } from "../../../domain/entities/Order";
import { Cursor } from "../../../domain/valueObjects/Pagination";
import { RoleEnum } from "@prisma/client";
import { pubsub, SUBSCRIPTION_EVENTS } from "../pubsub";

function requireRole(context: GraphQLContext, allowedRoles: RoleEnum[]): void {
  if (!context.user) {
    throw new Error("No autorizado");
  }
  if (!allowedRoles.includes(context.user.role)) {
    throw new Error("Permiso insuficiente");
  }
}

export const orderResolvers = {
  Query: {
    orders: async (
      _: any,
      args: {
        filter?: {
          status?: OrderStatus;
          tableId?: number;
          userId?: number;
          createdAfter?: string;
          createdBefore?: string;
        };
        sort?: {
          field: "id" | "status" | "createdAt" | "tableId";
          order: "asc" | "desc";
        };
        first?: number;
        after?: string;
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
      const filter = args.filter
        ? {
            ...args.filter,
            createdAfter: args.filter.createdAfter
              ? new Date(args.filter.createdAfter)
              : undefined,
            createdBefore: args.filter.createdBefore
              ? new Date(args.filter.createdBefore)
              : undefined,
          }
        : undefined;

      const result = await context.repositories.orderRepository.findMany(
        filter,
        args.sort,
        args.first,
        args.after ? new Cursor(args.after) : undefined,
      );

      return {
        edges: result.edges.map((edge) => ({
          node: edge.node,
          cursor: edge.cursor.value,
        })),
        pageInfo: {
          hasNextPage: result.pageInfo.hasNextPage,
          hasPreviousPage: result.pageInfo.hasPreviousPage,
          startCursor: result.pageInfo.startCursor?.value,
          endCursor: result.pageInfo.endCursor?.value,
        },
      };
    },

    order: async (_: any, args: { id: number }, context: GraphQLContext) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return context.dataloaders.orderLoader.load(args.id);
    },

    ordersByQrCode: async (
      _: any,
      args: { qrCode: string },
      context: GraphQLContext,
    ) => {
      return context.repositories.orderRepository.findByQrCode(args.qrCode);
    },

    getOrdersByQrCode: async (
      _: any,
      args: { qrCode: string },
      context: GraphQLContext,
    ) => {
      // Public access for customers
      return context.repositories.orderRepository.findByQrCode(args.qrCode);
    },
  },

  Mutation: {
    createOrder: async (
      _: unknown,
      args: { tableId: string; itemId: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

      if (!context.user) throw new Error("No autorizado");

      // Create order with single item
      const order = await context.repositories.orderRepository.create({
        tableId: Number(args.tableId),
        status: OrderStatus.PENDING,
        userId: context.user.id,
        items: [{ menuItemId: Number(args.itemId), quantity: 1 }]
      });

      // Publish real-time events
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_CREATED, { orderCreated: order });
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_UPDATED, { orderUpdated: order });

      return order;
    },

    createOrderByQrCode: async (
      _: any,
      args: {
        qrCode: string;
        items: {
          menuItemId: string;
          quantity: number;
        }[];
      },
      context: GraphQLContext,
    ) => {
      const createOrderByQrCode = new CreateOrderByQrCode(
        context.repositories.orderRepository,
        context.repositories.tableRepository,
        context.repositories.menuItemRepository,
        context.repositories.userRepository,
      );

      const order = await createOrderByQrCode.execute({
        qrCode: args.qrCode,
        items: args.items.map(item => ({
          menuItemId: Number(item.menuItemId),
          quantity: item.quantity
        })),
      });

      // Publish real-time events for QR code orders
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_CREATED, { orderCreated: order });
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_UPDATED, { orderUpdated: order });

      return order;
    },

    updateOrderStatus: async (
      _: any,
      args: {
        input: {
          orderId: number;
          status: OrderStatus;
        };
      },
      context: GraphQLContext,
    ) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }

      const updateOrderStatus = new UpdateOrderStatus(
        context.repositories.orderRepository,
      );

      const order = await updateOrderStatus.execute({
        orderId: args.input.orderId,
        newStatus: args.input.status,
        user: context.user,
      });

      // Publish real-time events
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_STATUS_CHANGED, { orderStatusChanged: order });
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_UPDATED, { orderUpdated: order });

      return order;
    },

    setOrderStatus: async (
      _: unknown,
      args: { id: string; status: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
      const order = await context.repositories.orderRepository.updateStatus(
        Number(args.id), 
        args.status as OrderStatus
      );

      // Publish real-time events
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_STATUS_CHANGED, { orderStatusChanged: order });
      pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_UPDATED, { orderUpdated: order });

      return order;
    },

    deleteOrder: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return context.repositories.orderRepository.delete(Number(args.id));
    },
  },

  Order: {
    table: async (parent: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.tableLoader.load(parent.tableId);
    },

    user: async (parent: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.userLoader.load(parent.userId);
    },

    orderItems: async (parent: any) => {
      return parent.orderItems;
    },

    totalAmount: async (parent: any) => {
      return parent.getTotalAmount();
    },
  },

  OrderItem: {
    menuItem: async (parent: any, _: any, context: GraphQLContext) => {
      return context.dataloaders.menuItemLoader.load(parent.menuItemId);
    },

    total: async (parent: any) => {
      return parent.getTotal();
    },
  },
};
