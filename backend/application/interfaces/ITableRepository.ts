import { Table } from "../../domain/entities/Table";
import { Connection, Cursor } from "../../domain/valueObjects/Pagination";

export interface TableFilter {
  number?: number;
  capacityMin?: number;
  capacityMax?: number;
  hasQrCode?: boolean;
}

export interface TableSort {
  field: "id" | "number" | "capacity" | "orderCount";
  order: "asc" | "desc";
}

export interface ITableRepository {
  findById(id: number): Promise<Table | null>;
  findByNumber(number: number): Promise<Table | null>;
  findByQrCode(qrCode: string): Promise<Table | null>;
  
  // Overloaded method for different pagination types
  findMany(
    filter?: TableFilter,
    sort?: TableSort,
    first?: number,
    after?: Cursor,
  ): Promise<Connection<Table>>;
  findMany(
    filter?: any,
    sort?: any,
    limit?: number,
    offset?: number,
  ): Promise<Table[]>;
  
  create(tableData: {
    number: number;
    capacity: number;
    qrCode?: string;
  }): Promise<Table>;
  update(id: number, tableData: Partial<Table>): Promise<Table>;
  delete(id: number): Promise<Table>; // Changed to return Table instead of void
  getNextTableNumber(): Promise<number>;
}
