// // src/resolvers.ts
// import { RoleEnum } from '@prisma/client';
// import bcrypt from 'bcryptjs';
// import { PubSub } from 'graphql-subscriptions';
// import { signToken, requireRole, Context } from './auth';
// import prisma from './prisma';

// const pubsub = new PubSub();

// // Define interfaces for better type safety
// interface CreateOrderArgs {
//   tableId: string;
//   itemId: string;
//   paymentId?: string;
// }

// interface CreateOrderByQrCodeArgs {
//   qrCode: string;
//   items: { menuItemId: string; quantity: number }[];
// }

// interface QrCodeArgs {
//   qrCode: string;
// }

// interface GenerateQrCodeArgs {
//   tableId: string;
// }

// interface CreatePaymentArgs {
//   type: string;
//   orderId: string;
// }

// interface CreatePaymentForTableArgs {
//   type: string;
//   tableId: string;
// }

// interface CreateItemArgs {
//   title: string;
//   description?: string;
//   price: number;
//   imageUrl?: string;
// }

// interface EditItemArgs {
//   id: string;
//   title?: string;
//   description?: string;
//   price?: number;
//   imageUrl?: string;
// }

// interface SignupArgs {
//   email: string;
//   password: string;
//   name: string;
//   role?: RoleEnum;
// }

// interface LoginArgs {
//   email: string;
//   password: string;
// }

// interface IdArgs {
//   id: string;
// }

// interface TableIdArgs {
//   tableId: string;
// }

// interface StatusArgs {
//   id: string;
//   status: string;
// }

// // New interfaces for filters and sorting
// interface MenuItemFilter {
//   name?: string;
//   priceMin?: number;
//   priceMax?: number;
//   isAvailable?: boolean;
// }

// interface TableFilter {
//   number?: number;
//   capacityMin?: number;
//   capacityMax?: number;
//   hasQrCode?: boolean;
// }

// interface OrderFilter {
//   status?: string;
//   tableId?: number;
//   userId?: number;
//   createdAfter?: string;
//   createdBefore?: string;
// }

// interface MenuItemSort {
//   field: 'id' | 'name' | 'price' | 'createdAt' | 'isAvailable';
//   order: 'asc' | 'desc';
// }

// interface TableSort {
//   field: 'id' | 'number' | 'capacity' | 'orderCount';
//   order: 'asc' | 'desc';
// }

// interface OrderSort {
//   field: 'id' | 'status' | 'createdAt' | 'tableId' | 'orderNumber';
//   order: 'asc' | 'desc';
// }

// interface ItemsArgs {
//   filter?: MenuItemFilter;
//   sort?: MenuItemSort;
//   limit?: number;
//   offset?: number;
// }

// interface TablesArgs {
//   filter?: TableFilter;
//   sort?: TableSort;
//   limit?: number;
//   offset?: number;
// }

// interface OrdersArgs {
//   filter?: OrderFilter;
//   sort?: OrderSort;
//   limit?: number;
//   offset?: number;
// }

// // Prisma where and orderBy types
// interface MenuItemWhere {
//   name?: { contains: string; mode: 'insensitive' };
//   price?: { gte?: number; lte?: number };
//   isAvailable?: boolean;
// }

// interface TableWhere {
//   number?: number;
//   capacity?: { gte?: number; lte?: number };
//   qrCode?: { not: null } | null;
// }

// interface OrderWhere {
//   status?: string;
//   tableId?: number;
//   userId?: number;
//   createdAt?: { gte?: Date; lte?: Date };
// }

// interface MenuItemOrderBy {
//   id?: 'asc' | 'desc';
//   name?: 'asc' | 'desc';
//   price?: 'asc' | 'desc';
//   createdAt?: 'asc' | 'desc';
//   isAvailable?: 'asc' | 'desc';
// }

// interface TableOrderBy {
//   id?: 'asc' | 'desc';
//   number?: 'asc' | 'desc';
//   capacity?: 'asc' | 'desc';
// }

// interface OrderOrderBy {
//   id?: 'asc' | 'desc';
//   status?: 'asc' | 'desc';
//   createdAt?: 'asc' | 'desc';
//   tableId?: 'asc' | 'desc';
// }

// // Interfaces for GraphQL resolvers
// interface TableParent {
//   id: number;
// }

// interface OrderParent {
//   id: number;
//   tableId: number;
//   userId: number;
// }

// interface OrderItemParent {
//   menuItemId: number;
// }

// // Define context type for resolvers
// interface ResolverContext {
//   [key: string]: unknown;
// }

// export const resolvers = {
//   /* ----------  Queries ---------- */
//   Query: {
//     // F-02: consultar menú dinámico
//     items: async (_: unknown, args: ItemsArgs) => {
//       // público; sin restricciones
//       const { filter, sort, limit, offset } = args;
      
//       // Build where clause for filtering
//       const where: MenuItemWhere = {};
      
//       if (filter) {
//         if (filter.name) {
//           where.name = { contains: filter.name, mode: 'insensitive' };
//         }
//         if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
//           where.price = {};
//           if (filter.priceMin !== undefined) {
//             where.price.gte = filter.priceMin;
//           }
//           if (filter.priceMax !== undefined) {
//             where.price.lte = filter.priceMax;
//           }
//         }
//         if (filter.isAvailable !== undefined) {
//           where.isAvailable = filter.isAvailable;
//         }
//       }
      
//       // Build orderBy clause for sorting
//       const orderBy: MenuItemOrderBy = {};
//       if (sort) {
//         orderBy[sort.field] = sort.order;
//       }
      
//       return prisma.menuItem.findMany({
//         where,
//         orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
//         take: limit,
//         skip: offset,
//       });
//     },

//     // New queries from schema
//     me: async (_: unknown, __: unknown, ctx: Context) => {
//       if (!ctx.user) throw new Error('No autorizado');

//       // Buscar el usuario completo en la base de datos para obtener todos los campos
//       const fullUser = await prisma.user.findUnique({
//         where: { id: ctx.user.id },
//       });

//       if (!fullUser) throw new Error('Usuario no encontrado');

//       return fullUser;
//     },

//     getItemById: (_: unknown, { id }: IdArgs) => {
//       return prisma.menuItem.findUnique({ where: { id: Number(id) } });
//     },

//     tables: async (_: unknown, args: TablesArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
//       const { filter, sort, limit, offset } = args;
      
//       // Build where clause for filtering
//       const where: TableWhere = {};
      
//       if (filter) {
//         if (filter.number !== undefined) {
//           where.number = filter.number;
//         }
//         if (filter.capacityMin !== undefined || filter.capacityMax !== undefined) {
//           where.capacity = {};
//           if (filter.capacityMin !== undefined) {
//             where.capacity.gte = filter.capacityMin;
//           }
//           if (filter.capacityMax !== undefined) {
//             where.capacity.lte = filter.capacityMax;
//           }
//         }
//       }
      
//       // Handle special ordering for orderCount
//       if (sort?.field === 'orderCount') {
//         // For orderCount, we need to use a custom query with aggregation
//         const tables = await prisma.table.findMany({
//           where,
//           take: limit,
//           skip: offset,
//           include: {
//             orders: {
//               where: { status: { not: 'PAID' } },
//               include: { orderItems: { include: { menuItem: true } } },
//             },
//             _count: {
//               select: { orders: { where: { status: { not: 'PAID' } } } }
//             }
//           },
//         });
        
//         // Sort by order count in memory
//         const sortedTables = tables.sort((a, b) => {
//           const countA = a._count.orders;
//           const countB = b._count.orders;
//           return sort.order === 'asc' ? countA - countB : countB - countA;
//         });
        
//         return sortedTables;
//       }
      
//       // Build orderBy clause for regular sorting (exclude orderCount as it's handled above)
//       const orderBy: TableOrderBy = {};
//       if (sort && sort.field as string !== 'orderCount') {
//         // Type assertion to ensure we only use valid Prisma fields
//         const validField = sort.field as keyof TableOrderBy;
//         orderBy[validField] = sort.order;
//       }
      
//       return prisma.table.findMany({
//         where,
//         orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
//         take: limit,
//         skip: offset,
//         include: {
//           orders: {
//             where: { status: { not: 'PAID' } },
//             include: { orderItems: { include: { menuItem: true } } },
//           },
//         },
//       });
//     },

//     getTableById: (_: unknown, { id }: IdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.table.findUnique({ where: { id: Number(id) } });
//     },

//     // QR Code queries - public access for customers
//     getTableByQrCode: (_: unknown, { qrCode }: QrCodeArgs) => {
//       // Public access - no authentication required for customers
//       return prisma.table.findUnique({ where: { qrCode } });
//     },

//     getOrdersByQrCode: async (_: unknown, { qrCode }: QrCodeArgs) => {
//       // Public access - customers can see orders for their table
//       const table = await prisma.table.findUnique({ where: { qrCode } });
//       if (!table) throw new Error('Mesa no encontrada');

//       return prisma.order.findMany({
//         where: { tableId: table.id },
//         include: { orderItems: { include: { menuItem: true } } },
//       });
//     },

//     orders: async (_: unknown, args: OrdersArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
      
//       const { filter, sort, limit, offset } = args;
      
//       // Build where clause for filtering
//       const where: OrderWhere = {};
      
//       if (filter) {
//         if (filter.status) {
//           where.status = filter.status;
//         }
//         if (filter.tableId !== undefined) {
//           where.tableId = filter.tableId;
//         }
//         if (filter.userId !== undefined) {
//           where.userId = filter.userId;
//         }
//         if (filter.createdAfter || filter.createdBefore) {
//           where.createdAt = {};
//           if (filter.createdAfter) {
//             where.createdAt.gte = new Date(filter.createdAfter);
//           }
//           if (filter.createdBefore) {
//             where.createdAt.lte = new Date(filter.createdBefore);
//           }
//         }
//       }
      
//       // Handle special ordering for orderNumber (which is the same as id)
//       if (sort?.field === 'orderNumber') {
//         const orders = await prisma.order.findMany({
//           where,
//           orderBy: { id: sort.order },
//           take: limit,
//           skip: offset,
//           include: {
//             orderItems: { include: { menuItem: true } },
//             table: true,
//             user: true,
//           },
//         });
//         return orders;
//       }
      
//       // Build orderBy clause for regular sorting (exclude orderNumber as it's handled above)
//       const orderBy: OrderOrderBy = {};
//       if (sort && sort.field as string !== 'orderNumber') {
//         // Type assertion to ensure we only use valid Prisma fields
//         const validField = sort.field as keyof OrderOrderBy;
//         orderBy[validField] = sort.order;
//       }
      
//       return prisma.order.findMany({
//         where,
//         orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
//         take: limit,
//         skip: offset,
//         include: {
//           orderItems: { include: { menuItem: true } },
//           table: true,
//           user: true,
//         },
//       });
//     },

//     getOrdersByTableId: (_: unknown, { tableId }: TableIdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.order.findMany({ where: { tableId: Number(tableId) } });
//     },

//     payments: (_: unknown, __: unknown, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.payment.findMany();
//     },

//     getPaymentById: (_: unknown, { id }: IdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.payment.findUnique({ where: { id: Number(id) } });
//     },
//   },

//   /* ----------  Mutations ---------- */
//   Mutation: {
//     // F-01: registro / login
//     signup: async (
//       _: unknown,
//       { email, password, name: _name, role = RoleEnum.STAFF }: SignupArgs,
//     ) => {
//       const hashed = await bcrypt.hash(password, 10);
//       const user = await prisma.user.create({
//         data: { email, password: hashed, role },
//       });
//       return { token: signToken(user), user };
//     },

//     login: async (_: unknown, { email, password }: LoginArgs) => {
//       const user = await prisma.user.findUnique({ where: { email } });
//       if (!user) throw new Error('Usuario no existe');
//       const valid = await bcrypt.compare(password, user.password);
//       if (!valid) throw new Error('Contraseña inválida');
//       return { token: signToken(user), user };
//     },

//     // F-03: crear pedido y asignar mesa - Updated for new schema
//     createOrder: async (_: unknown, { tableId, itemId }: CreateOrderArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

//       if (!ctx.user) throw new Error('No autorizado');

//       const data: {
//         tableId: number;
//         status: string;
//         userId: number;
//       } = {
//         tableId: Number(tableId),
//         status: 'PENDING',
//         userId: ctx.user.id,
//       };

//       const order = await prisma.order.create({
//         data,
//         include: { orderItems: { include: { menuItem: true } }, table: true, user: true },
//       });

//       // Get the menu item price
//       const menuItem = await prisma.menuItem.findUnique({
//         where: { id: Number(itemId) },
//       });

//       if (!menuItem) throw new Error('Menu item not found');

//       // Create order items
//       await prisma.orderItem.create({
//         data: {
//           orderId: order.id,
//           menuItemId: Number(itemId),
//           quantity: 1,
//           price: menuItem.price,
//         },
//       });

//       // Publish order created event for real-time updates
//       pubsub.publish('ORDER_CREATED', { orderCreated: order });

//       return order;
//     },

//     // New mutations from schema
//     deleteOrder: async (_: unknown, { id }: IdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.order.delete({ where: { id: Number(id) } });
//     },

//     setOrderStatus: async (_: unknown, { id, status }: StatusArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       const updatedOrder = await prisma.order.update({
//         where: { id: Number(id) },
//         data: { status },
//         include: { orderItems: { include: { menuItem: true } }, table: true, user: true },
//       });

//       // Publish order status changed event for real-time updates
//       pubsub.publish('ORDER_STATUS_CHANGED', { orderStatusChanged: updatedOrder });
//       pubsub.publish('ORDER_UPDATED', { orderUpdated: updatedOrder });

//       return updatedOrder;
//     },

//     cancelOrder: async (_: unknown, { id }: IdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       const cancelledOrder = await prisma.order.update({
//         where: { id: Number(id) },
//         data: { status: 'CANCELLED' },
//         include: { orderItems: { include: { menuItem: true } }, table: true, user: true },
//       });

//       // Publish order status changed event for real-time updates
//       pubsub.publish('ORDER_STATUS_CHANGED', { orderStatusChanged: cancelledOrder });
//       pubsub.publish('ORDER_UPDATED', { orderUpdated: cancelledOrder });

//       return cancelledOrder;
//     },

//     // F-04: procesar pago - Updated for new schema
//     createPaymentForOrder: async (
//       _: unknown,
//       { type, orderId }: CreatePaymentArgs,
//       ctx: Context,
//     ) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

//       // Get the order to calculate amount
//       const order = await prisma.order.findUnique({
//         where: { id: Number(orderId) },
//         include: { orderItems: true },
//       });

//       if (!order) throw new Error('Order not found');
//       if (!order.orderItems || order.orderItems.length === 0) throw new Error('No items in order');

//       const amount = order.orderItems.reduce(
//         (total, item) =>
//           total +
//           (typeof item.price === 'number' ? item.price : Number(item.price)) *
//             Number(item.quantity),
//         0,
//       );

//       const payment = await prisma.payment.create({
//         data: {
//           orderId: Number(orderId),
//           amount,
//           method: type,
//         },
//       });

//       // Update order status to PAID
//       await prisma.order.update({
//         where: { id: Number(orderId) },
//         data: { status: 'PAID' },
//       });

//       return payment;
//     },

//     createPaymentForTable: async (
//       _: unknown,
//       { tableId }: CreatePaymentForTableArgs,
//       ctx: Context,
//     ) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);

//       // Get all unpaid orders for the table
//       const orders = await prisma.order.findMany({
//         where: {
//           tableId: Number(tableId),
//           status: { not: 'PAID' },
//         },
//         include: { orderItems: { include: { menuItem: true } } },
//       });

//       if (orders.length === 0) throw new Error('No unpaid orders found for this table');

//       // Update all orders to PAID
//       const updatedOrders = await Promise.all(
//         orders.map((order) =>
//           prisma.order.update({
//             where: { id: order.id },
//             data: { status: 'PAID' },
//           }),
//         ),
//       );

//       return updatedOrders;
//     },

//     deletePayment: async (_: unknown, { id }: IdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.payment.delete({ where: { id: Number(id) } });
//     },

//     // F-05: CRUD menú en panel admin - Updated for new schema
//     createItem: (_: unknown, { title, price }: CreateItemArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.menuItem.create({
//         data: {
//           sku: `${title.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`,
//           name: title,
//           price,
//         },
//       });
//     },

//     editItem: (_: unknown, { id, title, price }: EditItemArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       const updateData: {
//         name?: string;
//         price?: number;
//       } = {};
//       if (title !== undefined) updateData.name = title;
//       if (price !== undefined) updateData.price = price;

//       return prisma.menuItem.update({
//         where: { id: Number(id) },
//         data: updateData,
//       });
//     },

//     deleteItem: (_: unknown, { id }: IdArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       return prisma.menuItem.delete({ where: { id: Number(id) } });
//     },

//     addTable: async (_: unknown, __: unknown, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.STAFF, RoleEnum.SUPERADMIN]);
//       // Find the highest table number and add 1
//       const lastTable = await prisma.table.findFirst({
//         orderBy: { number: 'desc' },
//       });
//       const nextNumber = lastTable ? lastTable.number + 1 : 1;

//       return prisma.table.create({
//         data: {
//           number: nextNumber,
//           capacity: 4, // default capacity
//         },
//       });
//     },

//     removeTable: async (_: unknown, __: unknown, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.STAFF, RoleEnum.SUPERADMIN]);
//       // Remove the table with the highest number
//       const lastTable = await prisma.table.findFirst({
//         orderBy: { number: 'desc' },
//       });

//       if (!lastTable) throw new Error('No tables to remove');

//       return prisma.table.delete({ where: { id: lastTable.id } });
//     },

//     // QR Code mutations - public access for customer orders
//     createOrderByQrCode: async (_: unknown, { qrCode, items }: CreateOrderByQrCodeArgs) => {
//       // Public access - customers can create orders using QR code
//       const table = await prisma.table.findUnique({ where: { qrCode } });
//       if (!table) throw new Error('Mesa no encontrada');

//       // Create a guest user for the order (or find existing guest user)
//       let guestUser = await prisma.user.findFirst({
//         where: { email: 'guest@restaurant.local' },
//       });

//       if (!guestUser) {
//         guestUser = await prisma.user.create({
//           data: {
//             email: 'guest@restaurant.local',
//             password: await bcrypt.hash('guest', 10),
//             role: RoleEnum.STAFF,
//           },
//         });
//       }

//       // Create the order
//       const order = await prisma.order.create({
//         data: {
//           tableId: table.id,
//           status: 'PENDING',
//           userId: guestUser.id,
//         },
//         include: { orderItems: { include: { menuItem: true } }, table: true, user: true },
//       });

//       // Create order items
//       for (const item of items) {
//         const menuItem = await prisma.menuItem.findUnique({
//           where: { id: Number(item.menuItemId) },
//         });

//         if (!menuItem) {
//           throw new Error(`Menu item with ID ${item.menuItemId} not found`);
//         }

//         await prisma.orderItem.create({
//           data: {
//             orderId: order.id,
//             menuItemId: Number(item.menuItemId),
//             quantity: item.quantity,
//             price: menuItem.price,
//           },
//         });
//       }

//       // Publish order created event for real-time updates
//       pubsub.publish('ORDER_CREATED', { orderCreated: order });

//       return order;
//     },

//     // Generate QR code for table (admin only)
//     generateQrCodeForTable: async (_: unknown, { tableId }: GenerateQrCodeArgs, ctx: Context) => {
//       requireRole(ctx, [RoleEnum.MANAGER, RoleEnum.SUPERADMIN]);
//       // Generate a unique QR code using table ID and timestamp
//       const qrCode = `table-${tableId}-${Date.now()}`;

//       return prisma.table.update({
//         where: { id: Number(tableId) },
//         data: { qrCode },
//       });
//     },
//   },

//   Table: {
//     orders: (parent: TableParent, _args: unknown, _ctx: ResolverContext) => {
//       return prisma.order.findMany({ where: { tableId: parent.id } });
//     },
//   },

//   Order: {
//     orderItems: (parent: OrderParent, _args: unknown, _ctx: ResolverContext) => {
//       return prisma.orderItem.findMany({ where: { orderId: parent.id } });
//     },
//     table: (parent: OrderParent, _args: unknown, _ctx: ResolverContext) => {
//       return prisma.table.findUnique({ where: { id: parent.tableId } });
//     },
//     user: (parent: OrderParent, _args: unknown, _ctx: ResolverContext) => {
//       return prisma.user.findUnique({ where: { id: parent.userId } });
//     },
//   },

//   OrderItem: {
//     menuItem: (parent: OrderItemParent, _args: unknown, _ctx: ResolverContext) => {
//       return prisma.menuItem.findUnique({ where: { id: parent.menuItemId } });
//     },
//   },

//   /* ----------  Subscriptions ---------- */
//   Subscription: {
//     orderCreated: {
//       subscribe: () => pubsub.asyncIterableIterator(['ORDER_CREATED']),
//     },
//     orderUpdated: {
//       subscribe: () => pubsub.asyncIterableIterator(['ORDER_UPDATED']),
//     },
//     orderStatusChanged: {
//       subscribe: () => pubsub.asyncIterableIterator(['ORDER_STATUS_CHANGED']),
//     },
//   },
// };
