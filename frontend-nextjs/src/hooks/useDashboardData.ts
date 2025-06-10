import { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_MENU_ITEMS, 
  GET_TABLES, 
  GET_ORDERS,
  CREATE_MENU_ITEM,
  EDIT_MENU_ITEM,
  DELETE_MENU_ITEM,
  ADD_TABLE,
  REMOVE_TABLE,
  CREATE_ORDER,
  SET_ORDER_STATUS,
  CREATE_PAYMENT_FOR_ORDER,
  GET_ME,
  GENERATE_QR_CODE_FOR_TABLE,
  ORDER_CREATED_SUBSCRIPTION,
  ORDER_UPDATED_SUBSCRIPTION,
  ORDER_STATUS_CHANGED_SUBSCRIPTION
} from '../lib/queries';
import type { MenuItem, Table, Order, User } from '../types';

// Filter interfaces
export interface MenuItemFilter {
  name?: string;
  priceMin?: number;
  priceMax?: number;
  isAvailable?: boolean;
}

export interface TableFilter {
  number?: number;
  capacityMin?: number;
  capacityMax?: number;
  hasQrCode?: boolean;
}

export interface OrderFilter {
  status?: string;
  tableId?: number;
  userId?: number;
  createdAfter?: string;
  createdBefore?: string;
}

// Sort interfaces
export interface MenuItemSort {
  field: 'id' | 'name' | 'price' | 'createdAt' | 'isAvailable';
  order: 'asc' | 'desc';
}

export interface TableSort {
  field: 'id' | 'number' | 'capacity' | 'orderCount';
  order: 'asc' | 'desc';
}

export interface OrderSort {
  field: 'id' | 'status' | 'createdAt' | 'tableId' | 'orderNumber';
  order: 'asc' | 'desc';
}

export const useDashboardData = () => {
  // Filter and sort states
  const [menuFilter, setMenuFilter] = useState<MenuItemFilter>({});
  const [menuSort, setMenuSort] = useState<MenuItemSort>({ field: 'name', order: 'asc' });
  const [tableFilter, setTableFilter] = useState<TableFilter>({});
  const [tableSort, setTableSort] = useState<TableSort>({ field: 'number', order: 'asc' });
  const [orderFilter, setOrderFilter] = useState<OrderFilter>({});
  const [orderSort, setOrderSort] = useState<OrderSort>({ field: 'createdAt', order: 'desc' });

  // Pagination states
  const [menuPage, setMenuPage] = useState(0);
  const [tablePage, setTablePage] = useState(0);
  const [orderCursor, setOrderCursor] = useState<string | undefined>(undefined);
  const itemsPerPage = 12;

  // Queries with filters and sorting
  const { data: userData, loading: userLoading, error: userError } = useQuery<{ me: User }>(GET_ME);
  
  const { data: menuData, loading: menuLoading, error: menuError, refetch: refetchMenu } = useQuery<{ items: MenuItem[] }>(GET_MENU_ITEMS, {
    variables: {
      filter: Object.keys(menuFilter).length > 0 ? menuFilter : undefined,
      sort: menuSort,
      limit: itemsPerPage,
      offset: menuPage * itemsPerPage
    }
  });

  const { data: tablesData, loading: tablesLoading, error: tablesError, refetch: refetchTables } = useQuery<{ tables: Table[] }>(GET_TABLES, {
    variables: {
      filter: Object.keys(tableFilter).length > 0 ? tableFilter : undefined,
      sort: tableSort,
      limit: itemsPerPage,
      offset: tablePage * itemsPerPage
    }
  });

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery<{ 
    orders: {
      edges: Array<{
        node: Order;
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
      };
    };
  }>(GET_ORDERS, {
    variables: {
      filter: Object.keys(orderFilter).length > 0 ? orderFilter : undefined,
      sort: orderSort,
      first: itemsPerPage,
      after: orderCursor
    }
  });

  // Mutations
  const [createMenuItem] = useMutation(CREATE_MENU_ITEM);
  const [editMenuItem] = useMutation(EDIT_MENU_ITEM);
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);
  const [addTable, { loading: addTableLoading }] = useMutation(ADD_TABLE);
  const [removeTable, { loading: removeTableLoading }] = useMutation(REMOVE_TABLE);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [setOrderStatus] = useMutation(SET_ORDER_STATUS);
  const [createPayment] = useMutation(CREATE_PAYMENT_FOR_ORDER);
  const [generateQrCode] = useMutation(GENERATE_QR_CODE_FOR_TABLE);

  // Subscriptions
  useSubscription(ORDER_CREATED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.orderCreated) {
        refetchOrders();
        refetchTables();
      }
    },
    onError: (error) => {
      console.error('Order created subscription error:', error);
    }
  });

  useSubscription(ORDER_UPDATED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.orderUpdated) {
        refetchOrders();
        refetchTables();
      }
    },
    onError: (error) => {
      console.error('Order updated subscription error:', error);
    }
  });

  useSubscription(ORDER_STATUS_CHANGED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.orderStatusChanged) {
        refetchOrders();
        refetchTables();
      }
    },
    onError: (error) => {
      console.error('Order status changed subscription error:', error);
    }
  });

  return {
    // User data
    userData,
    userLoading,
    userError,

    // Menu data
    menuData,
    menuLoading,
    menuError,
    refetchMenu,
    menuFilter,
    setMenuFilter,
    menuSort,
    setMenuSort,
    menuPage,
    setMenuPage,

    // Table data
    tablesData,
    tablesLoading,
    tablesError,
    refetchTables,
    tableFilter,
    setTableFilter,
    tableSort,
    setTableSort,
    tablePage,
    setTablePage,

    // Order data
    ordersData,
    ordersLoading,
    ordersError,
    refetchOrders,
    orderFilter,
    setOrderFilter,
    orderSort,
    setOrderSort,
    orderCursor,
    setOrderCursor,

    // Mutations
    createMenuItem,
    editMenuItem,
    deleteMenuItem,
    addTable,
    addTableLoading,
    removeTable,
    removeTableLoading,
    createOrder,
    setOrderStatus,
    createPayment,
    generateQrCode,

    // Constants
    itemsPerPage
  };
};