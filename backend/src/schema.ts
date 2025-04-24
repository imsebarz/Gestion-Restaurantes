// backend/src/schema.ts

export const typeDefs = /* GraphQL */ `
  type Item {
    id: ID!
    title: String!
    description: String!
    price: Float!
    imageUrl: String!
    orders: [Order!]
  }

  type Table {
    id: ID!
    number: Int!
    orders: [Order!]
  }

  enum OrderStatus {
    PENDING
    PREPARING
    READY
    DELIVERED
    PAID
    CANCELLED
  }

  enum NewOrderStatus {
    PENDING
    PREPARING
    READY
    DELIVERED
  }

  enum PaymentType {
    CASH
    CARD
    OTHER
  }

  type Order {
    id: ID!
    createdAt: String!
    table: Table!
    item: Item!
    payment: Payment
    status: OrderStatus!
  }

  type Payment {
    id: ID!
    createdAt: String!
    type: PaymentType!
    orders: [Order!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Query {
    me: User!
    items: [Item!]!
    getItemById(id: ID!): Item
    tables: [Table!]!
    getTableById(id: ID!): Table
    orders: [Order!]!
    getOrdersByTableId(tableId: ID!): [Order!]!
    payments: [Payment!]!
    getPaymentById(id: ID!): Payment
  }

  type Mutation {
    signup(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createItem(title: String!, description: String!, price: Float!, imageUrl: String!): Item!
    deleteItem(id: ID!): Item!
    editItem(id: ID!, title: String, description: String, price: Float, imageUrl: String): Item!
    createOrder(tableId: ID!, itemId: ID!, paymentId: ID): Order!
    deleteOrder(id: ID!): Order!
    setOrderStatus(id: ID!, status: NewOrderStatus!): Order!
    cancelOrder(id: ID!): Order!
    createPaymentForOrder(type: PaymentType!, orderId: ID!): Payment!
    createPaymentForTable(type: PaymentType!, tableId: ID!): [Order!]!
    deletePayment(id: ID!): Payment!
    addTable: Table!
    removeTable: Table!
  }
`;
