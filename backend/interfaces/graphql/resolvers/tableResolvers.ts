import { GraphQLContext } from "../context";
import { TableManagement } from "../../../application/useCases/TableManagement";
import { RoleEnum } from "@prisma/client";
import { requireRole } from "../utils/auth";

export const tableResolvers = {
  Query: {
    tables: async (
      _: unknown,
      args: {
        filter?: {
          number?: number;
          capacityMin?: number;
          capacityMax?: number;
          hasQrCode?: boolean;
        };
        sort?: {
          field: "id" | "number" | "capacity" | "orderCount";
          order: "asc" | "desc";
        };
        limit?: number;
        offset?: number;
      },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
      const tableManagement = new TableManagement(context.repositories.tableRepository);
      return tableManagement.listTables(args.filter, args.sort, args.limit, args.offset);
    },

    getTableById: async (
      _: unknown,
      args: { id: number },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return context.dataloaders.tableLoader.load(args.id);
    },

    getTableByQrCode: async (
      _: unknown,
      args: { qrCode: string },
      context: GraphQLContext
    ) => {
      // Public access - customers can access via QR code
      return context.repositories.tableRepository.findByQrCode(args.qrCode);
    },

    tablesCount: async (
      _: unknown,
      args: {
        filter?: {
          number?: number;
          capacityMin?: number;
          capacityMax?: number;
          hasQrCode?: boolean;
        };
      },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      return context.repositories.tableRepository.count(args.filter);
    },
  },

  Mutation: {
    addTable: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.MANAGER, RoleEnum.STAFF, RoleEnum.SUPERADMIN]);
      
      const tableManagement = new TableManagement(context.repositories.tableRepository);
      return tableManagement.addTable();
    },

    removeTable: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.MANAGER, RoleEnum.STAFF, RoleEnum.SUPERADMIN]);
      
      const tableManagement = new TableManagement(context.repositories.tableRepository);
      return tableManagement.removeTable();
    },

    generateQrCodeForTable: async (
      _: unknown,
      args: { tableId: string },
      context: GraphQLContext
    ) => {
      requireRole(context, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
      const tableManagement = new TableManagement(context.repositories.tableRepository);
      return tableManagement.generateQrCode(Number(args.tableId));
    },
  },

  Table: {
    orders: async (parent: any, _: unknown, context: GraphQLContext) => {
      return context.repositories.orderRepository.findByTableId(parent.id);
    },
  },
};