import {
  IOrderRepository,
  OrderFilter,
  OrderSort,
} from "../../application/interfaces/IOrderRepository";
import { Order, OrderItem, OrderStatus } from "../../domain/entities/Order";
import {
  Connection,
  Cursor,
  Edge,
  PaginationInfo,
} from "../../domain/valueObjects/Pagination";
import prisma from "../prisma/client";

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: number): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!order) return null;

    const orderItems = order.orderItems.map(
      (item) =>
        new OrderItem(
          item.id,
          item.orderId,
          item.menuItemId,
          item.quantity,
          Number(item.price),
        ),
    );

    return new Order(
      order.id,
      order.status as OrderStatus,
      order.tableId,
      order.userId,
      order.createdAt,
      orderItems,
    );
  }

  async findByTableId(tableId: number): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { tableId },
      include: {
        orderItems: true,
      },
    });

    return this.mapOrdersFromPrisma(orders);
  }

  async findByQrCode(qrCode: string): Promise<Order[]> {
    const table = await prisma.table.findUnique({
      where: { qrCode },
    });

    if (!table) return [];

    return this.findByTableId(table.id);
  }

  async findMany(
    filter?: OrderFilter,
    sort?: OrderSort,
    first: number = 10,
    after?: Cursor,
  ): Promise<Connection<Order>> {
    const where: any = {};

    if (filter) {
      if (filter.status) {
        where.status = filter.status;
      }
      if (filter.tableId !== undefined) {
        where.tableId = filter.tableId;
      }
      if (filter.userId !== undefined) {
        where.userId = filter.userId;
      }
      if (filter.createdAfter || filter.createdBefore) {
        where.createdAt = {};
        if (filter.createdAfter) {
          where.createdAt.gte = filter.createdAfter;
        }
        if (filter.createdBefore) {
          where.createdAt.lte = filter.createdBefore;
        }
      }
    }

    // Handle cursor-based pagination
    if (after && !after.isEmpty()) {
      where.id = { gt: after.toId() };
    }

    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.order;
    } else {
      orderBy.id = "asc";
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy,
      take: first + 1,
      include: {
        orderItems: true,
      },
    });

    const hasNextPage = orders.length > first;
    const orderList = hasNextPage ? orders.slice(0, -1) : orders;

    const edges: Edge<Order>[] = orderList.map((order) => ({
      node: this.mapOrderFromPrisma(order),
      cursor: Cursor.fromId(order.id),
    }));

    const pageInfo = new PaginationInfo(
      hasNextPage,
      !!after && !after.isEmpty(),
      edges.length > 0 ? edges[0].cursor : undefined,
      edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    );

    return new Connection(edges, pageInfo);
  }

  async create(orderData: {
    status: OrderStatus;
    tableId: number;
    userId: number;
    items?: { menuItemId: number; quantity: number }[];
  }): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        status: orderData.status,
        tableId: orderData.tableId,
        userId: orderData.userId,
      },
      include: {
        orderItems: true,
      },
    });

    // Add order items if provided
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        // Get menu item to get price
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (!menuItem) {
          throw new Error(`Menu item with ID ${item.menuItemId} not found`);
        }

        await this.addOrderItem(order.id, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: Number(menuItem.price),
        });
      }

      // Fetch the order again with order items
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: true,
        },
      });

      return this.mapOrderFromPrisma(updatedOrder);
    }

    return this.mapOrderFromPrisma(order);
  }

  async update(id: number, orderData: Partial<Order>): Promise<Order> {
    const updateData: any = {};
    if (orderData.status !== undefined) updateData.status = orderData.status;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: true,
      },
    });

    return this.mapOrderFromPrisma(order);
  }

  async delete(id: number): Promise<void> {
    await prisma.order.delete({
      where: { id },
    });
  }

  async addOrderItem(
    orderId: number,
    orderItemData: {
      menuItemId: number;
      quantity: number;
      price: number;
    },
  ): Promise<OrderItem> {
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: orderItemData.menuItemId,
        quantity: orderItemData.quantity,
        price: orderItemData.price,
      },
    });

    return new OrderItem(
      orderItem.id,
      orderItem.orderId,
      orderItem.menuItemId,
      orderItem.quantity,
      Number(orderItem.price),
    );
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: true,
      },
    });

    return this.mapOrderFromPrisma(order);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    return this.updateOrderStatus(id, status);
  }

  async processPayment(
    orderId: number,
    paymentData: {
      amount: number;
      method: string;
    }
  ): Promise<any> {
    // Create payment record and update order status to PAID
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: paymentData.amount,
        method: paymentData.method,
      },
    });

    // Update order status to PAID
    await this.updateOrderStatus(orderId, OrderStatus.PAID);

    return payment;
  }

  async findUnpaidByTableId(tableId: number): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        tableId,
        status: { not: OrderStatus.PAID },
      },
      include: {
        orderItems: true,
      },
    });

    return this.mapOrdersFromPrisma(orders);
  }

  private mapOrderFromPrisma(order: any): Order {
    const orderItems = order.orderItems.map(
      (item: any) =>
        new OrderItem(
          item.id,
          item.orderId,
          item.menuItemId,
          item.quantity,
          Number(item.price),
        ),
    );

    // Asegurar que createdAt es una fecha válida
    let createdAt = new Date();
    if (order.createdAt) {
      if (order.createdAt instanceof Date) {
        createdAt = order.createdAt;
      } else {
        createdAt = new Date(order.createdAt);
      }

      // Verificar que la fecha es válida
      if (isNaN(createdAt.getTime())) {
        console.warn(
          `Invalid createdAt date for order ${order.id}: ${order.createdAt}`,
        );
        createdAt = new Date(); // Fallback a la fecha actual
      }
    }

    return new Order(
      order.id,
      order.status as OrderStatus,
      order.tableId,
      order.userId,
      createdAt,
      orderItems,
    );
  }

  private mapOrdersFromPrisma(orders: any[]): Order[] {
    return orders.map((order) => this.mapOrderFromPrisma(order));
  }
}
