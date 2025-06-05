import { MenuItem } from "../../domain/entities/MenuItem";
import { Connection, Cursor } from "../../domain/valueObjects/Pagination";

export interface MenuItemFilter {
  name?: string;
  priceMin?: number;
  priceMax?: number;
  isAvailable?: boolean;
}

export interface MenuItemSort {
  field: "id" | "name" | "price" | "createdAt" | "isAvailable";
  order: "asc" | "desc";
}

export interface IMenuItemRepository {
  findById(id: number): Promise<MenuItem | null>;
  findBySku(sku: string): Promise<MenuItem | null>;
  findMany(
    filter?: MenuItemFilter,
    sort?: MenuItemSort,
    first?: number,
    after?: Cursor,
  ): Promise<Connection<MenuItem>>;
  create(menuItemData: {
    sku: string;
    name: string;
    price: number;
    isAvailable?: boolean;
  }): Promise<MenuItem>;
  update(id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem>;
  delete(id: number): Promise<void>;
}
