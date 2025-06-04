// backend/src/schema.ts

export const typeDefs = /* GraphQL */ `
  enum RoleEnum {
    SUPERADMIN
    MANAGER
    STAFF
  }

  type MenuItem {
    id: ID!
    sku: String!
    name: String!
    price: Float!
    isAvailable: Boolean!
    createdAt: String!
  }

  type Table {
    id: ID!
    number: Int!
    capacity: Int!
    orders: [Order!]
  }

  enum OrderStatus {
    OPEN
    PENDING
    PREPARING
    READY
    DELIVERED
    PAID
    CANCELLED
  }

  type Order {
    id: ID!
    status: String!
    tableId: Int!
    userId: Int!
    createdAt: String!
    orderItems: [OrderItem!]
    payment: Payment
    table: Table!
    user: User!
  }

  type OrderItem {
    id: ID!
    orderId: Int!
    menuItemId: Int!
    quantity: Int!
    price: Float!
    order: Order!
    menuItem: MenuItem!
  }

  type Payment {
    id: ID!
    orderId: Int!
    amount: Float!
    method: String!
    paidAt: String!
    order: Order!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    email: String!
    role: RoleEnum!
    createdAt: String!
    orders: [Order!]
  }

  type Query {
    me: User!
    items: [MenuItem!]!
    getItemById(id: ID!): MenuItem
    tables: [Table!]!
    getTableById(id: ID!): Table
    orders: [Order!]!
    getOrdersByTableId(tableId: ID!): [Order!]!
    payments: [Payment!]!
    getPaymentById(id: ID!): Payment
  }

  type Mutation {
    signup(email: String!, password: String!, name: String, role: RoleEnum): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createItem(title: String!, price: Float!): MenuItem!
    deleteItem(id: ID!): MenuItem!
    editItem(id: ID!, title: String, price: Float): MenuItem!
    createOrder(tableId: ID!, itemId: ID!): Order!
    deleteOrder(id: ID!): Order!
    setOrderStatus(id: ID!, status: String!): Order!
    cancelOrder(id: ID!): Order!
    createPaymentForOrder(type: String!, orderId: ID!): Payment!
    createPaymentForTable(type: String!, tableId: ID!): [Order!]!
    deletePayment(id: ID!): Payment!
    addTable: Table!
    removeTable: Table!
  }
`;
