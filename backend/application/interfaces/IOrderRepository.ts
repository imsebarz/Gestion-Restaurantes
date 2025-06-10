import { Order, OrderItem, OrderStatus } from "../../domain/entities/Order";
import { Connection, Cursor } from "../../domain/valueObjects/Pagination";

export interface OrderFilter {
  status?: OrderStatus;
  tableId?: number;
  userId?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface OrderSort {
  field: "id" | "status" | "createdAt" | "tableId";
  order: "asc" | "desc";
}

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByTableId(tableId: number): Promise<Order[]>;
  findByQrCode(qrCode: string): Promise<Order[]>;
  findMany(
    filter?: OrderFilter,
    sort?: OrderSort,
    first?: number,
    after?: Cursor,
  ): Promise<Connection<Order>>;
  findManyWithPagination(
    filter?: OrderFilter,
    sort?: OrderSort,
    limit?: number,
    offset?: number,
  ): Promise<Order[]>;
  count(filter?: OrderFilter): Promise<number>;
  create(orderData: {
    status: OrderStatus;
    tableId: number;
    userId: number;
  }): Promise<Order>;
  update(id: number, orderData: Partial<Order>): Promise<Order>;
  delete(id: number): Promise<void>;
  addOrderItem(
    orderId: number,
    orderItemData: {
      menuItemId: number;
      quantity: number;
      price: number;
    },
  ): Promise<OrderItem>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order>;
}
