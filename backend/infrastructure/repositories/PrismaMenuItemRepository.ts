import {
  IMenuItemRepository,
  MenuItemFilter,
  MenuItemSort,
} from "../../application/interfaces/IMenuItemRepository";
import { MenuItem } from "../../domain/entities/MenuItem";
import {
  Connection,
  Cursor,
  Edge,
  PaginationInfo,
} from "../../domain/valueObjects/Pagination";
import prisma from "../prisma/client";

export class PrismaMenuItemRepository implements IMenuItemRepository {
  async findById(id: number): Promise<MenuItem | null> {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) return null;

    return new MenuItem(
      menuItem.id,
      menuItem.sku,
      menuItem.name,
      Number(menuItem.price),
      menuItem.imageUrl || undefined,
      menuItem.isAvailable,
      menuItem.createdAt,
    );
  }

  async findBySku(sku: string): Promise<MenuItem | null> {
    const menuItem = await prisma.menuItem.findUnique({
      where: { sku },
    });

    if (!menuItem) return null;

    return new MenuItem(
      menuItem.id,
      menuItem.sku,
      menuItem.name,
      Number(menuItem.price),
      menuItem.imageUrl || undefined,
      menuItem.isAvailable,
      menuItem.createdAt,
    );
  }

  async findMany(
    filter?: MenuItemFilter,
    sort?: MenuItemSort,
    first: number = 10,
    after?: Cursor,
  ): Promise<Connection<MenuItem>> {
    const where: any = {};

    if (filter) {
      if (filter.name) {
        where.name = { contains: filter.name, mode: "insensitive" };
      }
      if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
        where.price = {};
        if (filter.priceMin !== undefined) {
          where.price.gte = filter.priceMin;
        }
        if (filter.priceMax !== undefined) {
          where.price.lte = filter.priceMax;
        }
      }
      if (filter.isAvailable !== undefined) {
        where.isAvailable = filter.isAvailable;
      }
    }

    // Handle cursor-based pagination
    if (after && !after.isEmpty()) {
      where.id = { gt: after.toId() };
    }

    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.order;
    } else {
      orderBy.id = "asc";
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy,
      take: first + 1, // Get one extra to check if there's a next page
    });

    const hasNextPage = items.length > first;
    const menuItems = hasNextPage ? items.slice(0, -1) : items;

    const edges: Edge<MenuItem>[] = menuItems.map((item) => ({
      node: new MenuItem(
        item.id,
        item.sku,
        item.name,
        Number(item.price),
        item.imageUrl || undefined,
        item.isAvailable,
        item.createdAt,
      ),
      cursor: Cursor.fromId(item.id),
    }));

    const pageInfo = new PaginationInfo(
      hasNextPage,
      !!after && !after.isEmpty(),
      edges.length > 0 ? edges[0].cursor : undefined,
      edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    );

    return new Connection(edges, pageInfo);
  }

  async create(menuItemData: {
    sku: string;
    name: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
  }): Promise<MenuItem> {
    const menuItem = await prisma.menuItem.create({
      data: {
        sku: menuItemData.sku,
        name: menuItemData.name,
        price: menuItemData.price,
        imageUrl: menuItemData.imageUrl,
        isAvailable: menuItemData.isAvailable ?? true,
      },
    });

    return new MenuItem(
      menuItem.id,
      menuItem.sku,
      menuItem.name,
      Number(menuItem.price),
      menuItem.imageUrl || undefined,
      menuItem.isAvailable,
      menuItem.createdAt,
    );
  }

  async update(id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> {
    const updateData: any = {};
    if (menuItemData.name !== undefined) updateData.name = menuItemData.name;
    if (menuItemData.price !== undefined) updateData.price = menuItemData.price;
    if (menuItemData.imageUrl !== undefined) updateData.imageUrl = menuItemData.imageUrl;
    if (menuItemData.isAvailable !== undefined)
      updateData.isAvailable = menuItemData.isAvailable;

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return new MenuItem(
      menuItem.id,
      menuItem.sku,
      menuItem.name,
      Number(menuItem.price),
      menuItem.imageUrl || undefined,
      menuItem.isAvailable,
      menuItem.createdAt,
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.menuItem.delete({
      where: { id },
    });
  }
}
