import {
  ITableRepository,
  TableFilter,
  TableSort,
} from "../../application/interfaces/ITableRepository";
import { Table } from "../../domain/entities/Table";
import {
  Connection,
  Cursor,
  Edge,
  PaginationInfo,
} from "../../domain/valueObjects/Pagination";
import prisma from "../prisma/client";

export class PrismaTableRepository implements ITableRepository {
  async findById(id: number): Promise<Table | null> {
    const table = await prisma.table.findUnique({
      where: { id },
    });

    if (!table) return null;

    return new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    );
  }

  async findByNumber(number: number): Promise<Table | null> {
    const table = await prisma.table.findUnique({
      where: { number },
    });

    if (!table) return null;

    return new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    );
  }

  async findByQrCode(qrCode: string): Promise<Table | null> {
    const table = await prisma.table.findUnique({
      where: { qrCode },
    });

    if (!table) return null;

    return new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    );
  }

  // Overloaded method to support both cursor and limit/offset pagination
  async findMany(
    filter?: any,
    sort?: any,
    limitOrFirst?: number,
    offsetOrAfter?: number | Cursor,
  ): Promise<any> {
    // If offsetOrAfter is a number, use limit/offset pagination
    if (typeof offsetOrAfter === 'number') {
      return this.findManyWithOffset(filter, sort, limitOrFirst, offsetOrAfter);
    }
    
    // Otherwise use cursor-based pagination
    return this.findManyWithCursor(filter, sort, limitOrFirst, offsetOrAfter);
  }

  private async findManyWithOffset(
    filter?: any,
    sort?: any,
    limit?: number,
    offset?: number,
  ): Promise<Table[]> {
    const where: any = {};

    if (filter) {
      if (filter.number !== undefined) {
        where.number = filter.number;
      }
      if (filter.capacityMin !== undefined || filter.capacityMax !== undefined) {
        where.capacity = {};
        if (filter.capacityMin !== undefined) {
          where.capacity.gte = filter.capacityMin;
        }
        if (filter.capacityMax !== undefined) {
          where.capacity.lte = filter.capacityMax;
        }
      }
      if (filter.hasQrCode !== undefined) {
        where.qrCode = filter.hasQrCode ? { not: null } : null;
      }
    }

    const orderBy: any = {};
    if (sort) {
      if (sort.field === "id" || sort.field === "number" || sort.field === "capacity") {
        orderBy[sort.field] = sort.order;
      } else {
        orderBy.id = "asc";
      }
    } else {
      orderBy.id = "asc";
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    });

    return tables.map((table: any) => new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    ));
  }

  private async findManyWithCursor(
    filter?: TableFilter,
    sort?: TableSort,
    first: number = 10,
    after?: Cursor,
  ): Promise<Connection<Table>> {
    const where: {
      number?: number;
      capacity?: { gte?: number; lte?: number };
      qrCode?: { not: null } | null;
      id?: { gt: number };
    } = {};

    if (filter) {
      if (filter.number !== undefined) {
        where.number = filter.number;
      }
      if (
        filter.capacityMin !== undefined ||
        filter.capacityMax !== undefined
      ) {
        where.capacity = {};
        if (filter.capacityMin !== undefined) {
          where.capacity.gte = filter.capacityMin;
        }
        if (filter.capacityMax !== undefined) {
          where.capacity.lte = filter.capacityMax;
        }
      }
      if (filter.hasQrCode !== undefined) {
        where.qrCode = filter.hasQrCode ? { not: null } : null;
      }
    }

    // Handle cursor-based pagination
    if (after && !after.isEmpty()) {
      where.id = { gt: after.toId() };
    }

    // Handle special ordering for orderCount
    if (sort?.field === "orderCount") {
      const tables = await prisma.table.findMany({
        where,
        take: first + 1,
        include: {
          _count: {
            select: { orders: { where: { status: { not: "PAID" } } } },
          },
        },
      });

      const hasNextPage = tables.length > first;
      const tableList = hasNextPage ? tables.slice(0, -1) : tables;

      // Sort by order count in memory
      const sortedTables = tableList.sort((a, b) => {
        const countA = a._count.orders;
        const countB = b._count.orders;
        return sort.order === "asc" ? countA - countB : countB - countA;
      });

      const edges: Edge<Table>[] = sortedTables.map((table) => ({
        node: new Table(
          table.id,
          table.number,
          table.capacity,
          table.qrCode || undefined,
        ),
        cursor: Cursor.fromId(table.id),
      }));

      const pageInfo = new PaginationInfo(
        hasNextPage,
        !!after && !after.isEmpty(),
        edges.length > 0 ? edges[0].cursor : undefined,
        edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      );

      return new Connection(edges, pageInfo);
    }

    const orderBy: {
      id?: "asc" | "desc";
      number?: "asc" | "desc";
      capacity?: "asc" | "desc";
    } = {};

    if (sort) {
      if (
        sort.field === "id" ||
        sort.field === "number" ||
        sort.field === "capacity"
      ) {
        orderBy[sort.field] = sort.order;
      } else {
        // Default fallback for any unhandled sort fields
        orderBy.id = "asc";
      }
    } else {
      orderBy.id = "asc";
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy,
      take: first + 1,
    });

    const hasNextPage = tables.length > first;
    const tableList = hasNextPage ? tables.slice(0, -1) : tables;

    const edges: Edge<Table>[] = tableList.map((table) => ({
      node: new Table(
        table.id,
        table.number,
        table.capacity,
        table.qrCode || undefined,
      ),
      cursor: Cursor.fromId(table.id),
    }));

    const pageInfo = new PaginationInfo(
      hasNextPage,
      !!after && !after.isEmpty(),
      edges.length > 0 ? edges[0].cursor : undefined,
      edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    );

    return new Connection(edges, pageInfo);
  }

  async create(tableData: {
    number: number;
    capacity: number;
    qrCode?: string;
  }): Promise<Table> {
    const table = await prisma.table.create({
      data: {
        number: tableData.number,
        capacity: tableData.capacity,
        qrCode: tableData.qrCode,
      },
    });

    return new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    );
  }

  async update(id: number, tableData: Partial<Table>): Promise<Table> {
    const updateData: {
      number?: number;
      capacity?: number;
      qrCode?: string;
    } = {};
    if (tableData.number !== undefined) updateData.number = tableData.number;
    if (tableData.capacity !== undefined)
      updateData.capacity = tableData.capacity;
    if (tableData.qrCode !== undefined) updateData.qrCode = tableData.qrCode;

    const table = await prisma.table.update({
      where: { id },
      data: updateData,
    });

    return new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    );
  }

  async delete(id: number): Promise<Table> {
    const table = await prisma.table.delete({
      where: { id },
    });

    return new Table(
      table.id,
      table.number,
      table.capacity,
      table.qrCode || undefined,
    );
  }

  async getNextTableNumber(): Promise<number> {
    const lastTable = await prisma.table.findFirst({
      orderBy: { number: "desc" },
    });
    return lastTable ? lastTable.number + 1 : 1;
  }

  async count(filter?: TableFilter): Promise<number> {
    const where: any = {};

    if (filter) {
      if (filter.number !== undefined) {
        where.number = filter.number;
      }
      if (filter.capacityMin !== undefined || filter.capacityMax !== undefined) {
        where.capacity = {};
        if (filter.capacityMin !== undefined) {
          where.capacity.gte = filter.capacityMin;
        }
        if (filter.capacityMax !== undefined) {
          where.capacity.lte = filter.capacityMax;
        }
      }
      if (filter.hasQrCode !== undefined) {
        where.qrCode = filter.hasQrCode ? { not: null } : null;
      }
    }

    return await prisma.table.count({ where });
  }
}
