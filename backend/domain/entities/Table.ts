export class Table {
  constructor(
    public readonly id: number,
    public readonly number: number,
    public readonly capacity: number,
    public readonly qrCode?: string,
  ) {}

  public hasQrCode(): boolean {
    return !!this.qrCode;
  }

  public canAccommodate(guests: number): boolean {
    return this.capacity >= guests;
  }

  public generateQrCode(): string {
    return `table-${this.id}-${Date.now()}`;
  }

  public withQrCode(qrCode: string): Table {
    return new Table(this.id, this.number, this.capacity, qrCode);
  }
}
