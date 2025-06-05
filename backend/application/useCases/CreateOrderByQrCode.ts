import { Order, OrderStatus } from "../../domain/entities/Order";
import { IOrderRepository } from "../interfaces/IOrderRepository";
import { ITableRepository } from "../interfaces/ITableRepository";
import { IMenuItemRepository } from "../interfaces/IMenuItemRepository";
import { IUserRepository } from "../interfaces/IUserRepository";

export interface CreateOrderByQrCodeRequest {
  qrCode: string;
  items: {
    menuItemId: number;
    quantity: number;
  }[];
}

export class CreateOrderByQrCode {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly tableRepository: ITableRepository,
    private readonly menuItemRepository: IMenuItemRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: CreateOrderByQrCodeRequest): Promise<Order> {
    // Validate table exists by QR code
    const table = await this.tableRepository.findByQrCode(request.qrCode);
    if (!table) {
      throw new Error("Mesa no encontrada");
    }

    // Get or create guest user
    let guestUser = await this.userRepository.findByEmail(
      "guest@restaurant.local",
    );
    if (!guestUser) {
      guestUser = await this.userRepository.create({
        email: "guest@restaurant.local",
        password: await require("bcryptjs").hash("guest", 10),
        role: require("../../domain/entities/User").RoleEnum.STAFF,
      });
    }

    // Create order
    const order = await this.orderRepository.create({
      status: OrderStatus.PENDING,
      tableId: table.id,
      userId: guestUser.id,
    });

    // Add order items
    for (const item of request.items) {
      const menuItem = await this.menuItemRepository.findById(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menuItemId} not found`);
      }

      if (!menuItem.isOrderable()) {
        throw new Error(`Menu item ${menuItem.name} is not available`);
      }

      await this.orderRepository.addOrderItem(order.id, {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    return this.orderRepository.findById(order.id) as Promise<Order>;
  }
}
