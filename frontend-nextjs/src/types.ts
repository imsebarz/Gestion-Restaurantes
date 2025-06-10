export enum RoleEnum {
  SUPERADMIN = 'SUPERADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  qrCode?: string;
  orders?: Order[];
}

export interface OrderItem {
  id: string;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  status: string;
  tableId: number;
  userId: number;
  createdAt: string;
  orderItems?: OrderItem[];
  table?: Table;
  user?: User;
}

export interface Payment {
  id: string;
  orderId: number;
  amount: number;
  method: string;
  paidAt: string;
  order?: Order;
}

export interface User {
  id: string;
  email: string;
  role: RoleEnum;
  createdAt: string;
  orders?: Order[];
}

export interface AuthPayload {
  token: string;
  user: User;
}