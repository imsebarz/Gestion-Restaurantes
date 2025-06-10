export class MenuItem {
  constructor(
    public readonly id: number,
    public readonly sku: string,
    public readonly name: string,
    public readonly price: number,
    public readonly imageUrl?: string,
    public readonly isAvailable: boolean = true,
    public readonly createdAt: Date = new Date(),
  ) {}

  public validatePrice(): boolean {
    return this.price > 0;
  }

  public isOrderable(): boolean {
    return this.isAvailable && this.validatePrice();
  }

  public updateAvailability(isAvailable: boolean): MenuItem {
    return new MenuItem(
      this.id,
      this.sku,
      this.name,
      this.price,
      this.imageUrl,
      isAvailable,
      this.createdAt,
    );
  }
}
