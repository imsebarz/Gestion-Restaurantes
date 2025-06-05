import { GraphQLContext } from "../context";
import { ListMenuItems } from "../../../application/useCases/ListMenuItems";
import { Cursor } from "../../../domain/valueObjects/Pagination";
import { RoleEnum } from "@prisma/client";

function requireRole(context: GraphQLContext, allowedRoles: RoleEnum[]): void {
  if (!context.user) {
    throw new Error("No autorizado");
  }
  if (!allowedRoles.includes(context.user.role)) {
    throw new Error("Permiso insuficiente");
  }
}

export const menuResolvers = {
  Query: {
    menuItems: async (
      _: any,
      args: {
        filter?: {
          name?: string;
          priceMin?: number;
          priceMax?: number;
          isAvailable?: boolean;
        };
        sort?: {
          field: "id" | "name" | "price" | "createdAt" | "isAvailable";
          order: "asc" | "desc";
        };
        first?: number;
        after?: string;
      },
      context: GraphQLContext,
    ) => {
      const listMenuItems = new ListMenuItems(
        context.repositories.menuItemRepository,
      );

      const result = await listMenuItems.execute({
        filter: args.filter,
        sort: args.sort,
        first: args.first,
        after: args.after ? new Cursor(args.after) : undefined,
      });

      return {
        edges: result.edges.map((edge) => ({
          node: edge.node,
          cursor: edge.cursor.value,
        })),
        pageInfo: {
          hasNextPage: result.pageInfo.hasNextPage,
          hasPreviousPage: result.pageInfo.hasPreviousPage,
          startCursor: result.pageInfo.startCursor?.value,
          endCursor: result.pageInfo.endCursor?.value,
        },
      };
    },

    // Add the items field that the frontend expects
    items: async (
      _: unknown,
      args: {
        filter?: {
          name?: string;
          priceMin?: number;
          priceMax?: number;
          isAvailable?: boolean;
        };
        sort?: {
          field: "id" | "name" | "price" | "createdAt" | "isAvailable";
          order: "asc" | "desc";
        };
        limit?: number;
        offset?: number;
      },
      context: GraphQLContext,
    ) => {
      // Convert limit/offset to first/after for the paginated resolver
      const first = args.limit || 50;
      const skip = args.offset || 0;
      
      // Use the existing menuItems resolver but extract just the nodes
      const result = await menuResolvers.Query.menuItems(
        _,
        {
          filter: args.filter,
          sort: args.sort,
          first: first + skip, // Get more items to handle offset
        },
        context,
      );
      
      // Extract just the menu items and apply manual offset
      const items = result.edges.map((edge: { node: unknown }) => edge.node);
      return items.slice(skip, skip + first);
    },

    menuItem: async (_: any, args: { id: number }, context: GraphQLContext) => {
      return context.dataloaders.menuItemLoader.load(args.id);
    },
  },

  Mutation: {
    createItem: async (
      _: unknown,
      args: { title: string; price: number },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
      return context.repositories.menuItemRepository.create({
        sku: `${args.title.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: args.title,
        price: args.price,
        isAvailable: true,
      });
    },

    editItem: async (
      _: unknown,
      args: { id: string; title?: string; price?: number },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
      const updateData: any = {};
      if (args.title !== undefined) updateData.name = args.title;
      if (args.price !== undefined) updateData.price = args.price;

      return context.repositories.menuItemRepository.update(Number(args.id), updateData);
    },

    deleteItem: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return context.repositories.menuItemRepository.delete(Number(args.id));
    },
  },

  MenuItem: {
    // No additional resolvers needed as all fields are primitive
  },
};
