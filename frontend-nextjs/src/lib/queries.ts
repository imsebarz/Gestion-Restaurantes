import { gql } from '@apollo/client';

// Auth mutations
export const LOGIN_MUTATION = gql`
  mutation LoginUsuario($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation SignupUsuario($email: String!, $password: String!, $name: String, $role: RoleEnum) {
    signup(email: $email, password: $password, name: $name, role: $role) {
      token
      user {
        id
        email
        role
      }
    }
  }
`;

// Menu queries and mutations
export const GET_MENU_ITEMS = gql`
  query VerMenu($filter: MenuItemFilter, $sort: MenuItemSort, $limit: Int, $offset: Int) {
    items(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      id
      sku
      name
      price
      isAvailable
      createdAt
    }
  }
`;

export const CREATE_MENU_ITEM = gql`
  mutation CrearMenuItem($title: String!, $price: Float!) {
    createItem(title: $title, price: $price) {
      id
      sku
      name
      price
      isAvailable
      createdAt
    }
  }
`;

export const EDIT_MENU_ITEM = gql`
  mutation EditarMenuItem($id: ID!, $title: String, $price: Float) {
    editItem(id: $id, title: $title, price: $price) {
      id
      sku
      name
      price
      isAvailable
      createdAt
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation EliminarMenuItem($id: ID!) {
    deleteItem(id: $id) {
      id
      name
    }
  }
`;

// Tables queries and mutations
export const GET_TABLES = gql`
  query VerMesas($filter: TableFilter, $sort: TableSort, $limit: Int, $offset: Int) {
    tables(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      id
      number
      capacity
      qrCode
      orders {
        id
        status
        tableId
        userId
        createdAt
        orderItems {
          id
          quantity
          price
          menuItem {
            id
            name
            price
          }
        }
      }
    }
  }
`;

export const ADD_TABLE = gql`
  mutation AgregarMesa {
    addTable {
      id
      number
      capacity
    }
  }
`;

export const REMOVE_TABLE = gql`
  mutation EliminarUltimaMesa {
    removeTable {
      id
      number
      capacity
    }
  }
`;

// Orders queries and mutations
export const GET_ORDERS = gql`
  query VerPedidos($filter: OrderFilter, $sort: OrderSort, $limit: Int, $offset: Int) {
    orders(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
      table {
        id
        number
      }
      user {
        id
        email
      }
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CrearPedido($tableId: ID!, $itemId: ID!) {
    createOrder(tableId: $tableId, itemId: $itemId) {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
    }
  }
`;

export const SET_ORDER_STATUS = gql`
  mutation CambiarEstadoPedido($id: ID!, $status: String!) {
    setOrderStatus(id: $id, status: $status) {
      id
      status
      tableId
      userId
      createdAt
    }
  }
`;

// Payments mutations
export const CREATE_PAYMENT_FOR_ORDER = gql`
  mutation ProcesarPagoPedido($type: String!, $orderId: ID!) {
    createPaymentForOrder(type: $type, orderId: $orderId) {
      id
      orderId
      amount
      method
      paidAt
    }
  }
`;

export const CREATE_PAYMENT_FOR_TABLE = gql`
  mutation ProcesarPagoMesa($type: String!, $tableId: ID!) {
    createPaymentForTable(type: $type, tableId: $tableId) {
      id
      status
      tableId
      userId
      createdAt
    }
  }
`;

// User query
export const GET_ME = gql`
  query UsuarioActual {
    me {
      id
      email
      role
      createdAt
    }
  }
`;

// QR Code queries and mutations
export const GET_TABLE_BY_QR_CODE = gql`
  query GetTableByQrCode($qrCode: String!) {
    getTableByQrCode(qrCode: $qrCode) {
      id
      number
      capacity
      qrCode
    }
  }
`;

export const GET_ORDERS_BY_QR_CODE = gql`
  query GetOrdersByQrCode($qrCode: String!) {
    getOrdersByQrCode(qrCode: $qrCode) {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
    }
  }
`;

export const CREATE_ORDER_BY_QR_CODE = gql`
  mutation CreateOrderByQrCode($qrCode: String!, $items: [OrderItemInput!]!) {
    createOrderByQrCode(qrCode: $qrCode, items: $items) {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
    }
  }
`;

export const GENERATE_QR_CODE_FOR_TABLE = gql`
  mutation GenerateQrCodeForTable($tableId: ID!) {
    generateQrCodeForTable(tableId: $tableId) {
      id
      number
      capacity
      qrCode
    }
  }
`;

// Real-time subscriptions for orders
export const ORDER_CREATED_SUBSCRIPTION = gql`
  subscription OnOrderCreated {
    orderCreated {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
      table {
        id
        number
      }
      user {
        id
        email
      }
    }
  }
`;

export const ORDER_UPDATED_SUBSCRIPTION = gql`
  subscription OnOrderUpdated {
    orderUpdated {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
      table {
        id
        number
      }
      user {
        id
        email
      }
    }
  }
`;

export const ORDER_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription OnOrderStatusChanged {
    orderStatusChanged {
      id
      status
      tableId
      userId
      createdAt
      orderItems {
        id
        quantity
        price
        menuItem {
          id
          name
          price
        }
      }
      table {
        id
        number
      }
      user {
        id
        email
      }
    }
  }
`;