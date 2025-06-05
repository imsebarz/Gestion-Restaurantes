export enum OrderStatus {
  OPEN = "OPEN",
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export class OrderItem {
  constructor(
    public readonly id: number,
    public readonly orderId: number,
    public readonly menuItemId: number,
    public readonly quantity: number,
    public readonly price: number,
  ) {}

  public getTotal(): number {
    return this.quantity * this.price;
  }
}

export class Order {
  constructor(
    public readonly id: number,
    public readonly status: OrderStatus,
    public readonly tableId: number,
    public readonly userId: number,
    public readonly createdAt: Date = new Date(),
    public readonly orderItems: OrderItem[] = [],
  ) {}

  public isPaid(): boolean {
    return this.status === OrderStatus.PAID;
  }

  public isCancelled(): boolean {
    return this.status === OrderStatus.CANCELLED;
  }

  public canBeModified(): boolean {
    return ![
      OrderStatus.PAID,
      OrderStatus.CANCELLED,
      OrderStatus.DELIVERED,
    ].includes(this.status);
  }

  public getTotalAmount(): number {
    return this.orderItems.reduce((total, item) => total + item.getTotal(), 0);
  }

  public changeStatus(newStatus: OrderStatus): Order {
    if (!this.canBeModified() && newStatus !== OrderStatus.PAID) {
      throw new Error("Cannot modify a completed or cancelled order");
    }

    return new Order(
      this.id,
      newStatus,
      this.tableId,
      this.userId,
      this.createdAt,
      this.orderItems,
    );
  }

  public cancel(): Order {
    return this.changeStatus(OrderStatus.CANCELLED);
  }

  public markAsPaid(): Order {
    return this.changeStatus(OrderStatus.PAID);
  }
}
