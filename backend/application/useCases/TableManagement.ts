import { Table } from "../../domain/entities/Table";
import { Connection, Cursor } from "../../domain/valueObjects/Pagination";
import {
  ITableRepository,
  TableFilter,
  TableSort,
} from "../interfaces/ITableRepository";

export interface ListTablesRequest {
  filter?: TableFilter;
  sort?: TableSort;
  first?: number;
  after?: Cursor;
}

export interface CreateTableRequest {
  number?: number;
  capacity: number;
  generateQrCode?: boolean;
}

export class ListTables {
  constructor(private readonly tableRepository: ITableRepository) {}

  async execute(request: ListTablesRequest): Promise<Connection<Table>> {
    return this.tableRepository.findMany(
      request.filter,
      request.sort,
      request.first,
      request.after,
    );
  }
}

export class CreateTable {
  constructor(private readonly tableRepository: ITableRepository) {}

  async execute(request: CreateTableRequest): Promise<Table> {
    const number =
      request.number ?? (await this.tableRepository.getNextTableNumber());

    // Check if table number already exists
    const existingTable = await this.tableRepository.findByNumber(number);
    if (existingTable) {
      throw new Error(`Mesa con número ${number} ya existe`);
    }

    let qrCode: string | undefined;
    if (request.generateQrCode) {
      const table = new Table(0, number, request.capacity);
      qrCode = table.generateQrCode();
    }

    return this.tableRepository.create({
      number,
      capacity: request.capacity,
      qrCode,
    });
  }
}

export class TableManagement {
  constructor(private readonly tableRepository: ITableRepository) {}

  async listTables(
    filter?: {
      number?: number;
      capacityMin?: number;
      capacityMax?: number;
      hasQrCode?: boolean;
    },
    sort?: {
      field: "id" | "number" | "capacity" | "orderCount";
      order: "asc" | "desc";
    },
    limit?: number,
    offset?: number
  ): Promise<Table[]> {
    return this.tableRepository.findMany(filter, sort, limit, offset);
  }

  async addTable(): Promise<Table> {
    // Find the highest table number and add 1
    const tables = await this.tableRepository.findMany(
      {},
      { field: "number", order: "desc" },
      1,
      0
    );
    const nextNumber = tables.length > 0 ? tables[0].number + 1 : 1;

    return this.tableRepository.create({
      number: nextNumber,
      capacity: 4, // default capacity
    });
  }

  async removeTable(): Promise<Table> {
    // Remove the table with the highest number
    const tables = await this.tableRepository.findMany(
      {},
      { field: "number", order: "desc" },
      1,
      0
    );

    if (tables.length === 0) {
      throw new Error("No tables to remove");
    }

    return this.tableRepository.delete(tables[0].id);
  }

  async generateQrCode(tableId: number): Promise<Table> {
    // Generate a unique QR code using table ID and timestamp
    const qrCode = `table-${tableId}-${Date.now()}`;

    return this.tableRepository.update(tableId, { qrCode });
  }
}
