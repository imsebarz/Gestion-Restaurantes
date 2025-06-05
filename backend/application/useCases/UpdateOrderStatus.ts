import { Order, OrderStatus } from "../../domain/entities/Order";
import { User } from "../../domain/entities/User";
import { IOrderRepository } from "../interfaces/IOrderRepository";
import { pubsub, SUBSCRIPTION_EVENTS } from "../../interfaces/graphql/pubsub";

export interface UpdateOrderStatusRequest {
  orderId: number;
  newStatus: OrderStatus;
  user: User;
}

export class UpdateOrderStatus {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(request: UpdateOrderStatusRequest): Promise<Order> {
    if (!request.user.canManageOrders()) {
      throw new Error("No tienes permisos para actualizar pedidos");
    }

    const order = await this.orderRepository.findById(request.orderId);
    if (!order) {
      throw new Error("Pedido no encontrado");
    }

    const updatedOrder = order.changeStatus(request.newStatus);
    const result = await this.orderRepository.updateOrderStatus(
      request.orderId,
      request.newStatus,
    );

    // Publish real-time events for dashboard updates
    pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_STATUS_CHANGED, { orderStatusChanged: result });
    pubsub.publish(SUBSCRIPTION_EVENTS.ORDER_UPDATED, { orderUpdated: result });

    return result;
  }
}
