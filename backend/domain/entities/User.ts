export enum RoleEnum {
  SUPERADMIN = "SUPERADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    private readonly password: string,
    public readonly role: RoleEnum,
    public readonly createdAt: Date = new Date(),
  ) {}

  public hasRole(allowedRoles: RoleEnum[]): boolean {
    return allowedRoles.includes(this.role);
  }

  public isManager(): boolean {
    return this.role === RoleEnum.MANAGER || this.role === RoleEnum.SUPERADMIN;
  }

  public canManageMenu(): boolean {
    return this.role === RoleEnum.MANAGER || this.role === RoleEnum.SUPERADMIN;
  }

  public canManageOrders(): boolean {
    return this.role !== undefined; // All authenticated users can manage orders
  }

  public getPassword(): string {
    return this.password;
  }
}
