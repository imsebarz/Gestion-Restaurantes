'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_MENU_ITEMS, 
  GET_TABLES, 
  GET_ORDERS,
  CREATE_MENU_ITEM,
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
import { RoleEnum } from '../types';
import type { ApolloError } from '@apollo/client';

interface DashboardProps {
  onLogout: () => void;
}

// Define proper error types
interface GraphQLError {
  message: string;
}

interface NetworkError {
  message: string;
}

interface ErrorWithDetails {
  networkError?: NetworkError;
  graphQLErrors?: GraphQLError[];
  message?: string;
}

// Filter interfaces
interface MenuItemFilter {
  name?: string;
  priceMin?: number;
  priceMax?: number;
  isAvailable?: boolean;
}

interface TableFilter {
  number?: number;
  capacityMin?: number;
  capacityMax?: number;
  hasQrCode?: boolean;
}

interface OrderFilter {
  status?: string;
  tableId?: number;
  userId?: number;
  createdAfter?: string;
  createdBefore?: string;
}

// Sort interfaces
interface MenuItemSort {
  field: 'id' | 'name' | 'price' | 'createdAt' | 'isAvailable';
  order: 'asc' | 'desc';
}

interface TableSort {
  field: 'id' | 'number' | 'capacity' | 'orderCount';
  order: 'asc' | 'desc';
}

interface OrderSort {
  field: 'id' | 'status' | 'createdAt' | 'tableId' | 'orderNumber';
  order: 'asc' | 'desc';
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

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
  const [orderPage, setOrderPage] = useState(0);
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

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery<{ orders: Order[] }>(GET_ORDERS, {
    variables: {
      filter: Object.keys(orderFilter).length > 0 ? orderFilter : undefined,
      sort: orderSort,
      limit: itemsPerPage,
      offset: orderPage * itemsPerPage
    }
  });

  // Mutations
  const [createMenuItem] = useMutation(CREATE_MENU_ITEM);
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);
  const [addTable, { loading: addTableLoading }] = useMutation(ADD_TABLE);
  const [removeTable, { loading: removeTableLoading }] = useMutation(REMOVE_TABLE);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [setOrderStatus] = useMutation(SET_ORDER_STATUS);
  const [createPayment] = useMutation(CREATE_PAYMENT_FOR_ORDER);
  const [generateQrCode] = useMutation(GENERATE_QR_CODE_FOR_TABLE);

  // Subscriptions
  const { data: orderCreatedData } = useSubscription(ORDER_CREATED_SUBSCRIPTION);
  const { data: orderUpdatedData } = useSubscription(ORDER_UPDATED_SUBSCRIPTION);
  const { data: orderStatusChangedData } = useSubscription(ORDER_STATUS_CHANGED_SUBSCRIPTION);

  useEffect(() => {
    if (orderCreatedData) {
      refetchOrders();
      refetchTables();
    }
  }, [orderCreatedData, refetchOrders, refetchTables]);

  useEffect(() => {
    if (orderUpdatedData) {
      refetchOrders();
      refetchTables();
    }
  }, [orderUpdatedData, refetchOrders, refetchTables]);

  useEffect(() => {
    if (orderStatusChangedData) {
      refetchOrders();
      refetchTables();
    }
  }, [orderStatusChangedData, refetchOrders, refetchTables]);

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMenuItem({
        variables: { title: newItemName, price: parseFloat(newItemPrice) }
      });
      setNewItemName('');
      setNewItemPrice('');
      refetchMenu();
    } catch (error) {
      console.error('Error creating menu item:', error);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await deleteMenuItem({ variables: { id } });
      refetchMenu();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleAddTable = async () => {
    try {
      await addTable();
      refetchTables();
    } catch (error: unknown) {
      console.error('Error adding table:', error);
      const errorMessage = getErrorMessage(error as ErrorWithDetails);
      alert('Error al agregar mesa: ' + errorMessage);
    }
  };

  const handleRemoveTable = async () => {
    try {
      await removeTable();
      refetchTables();
    } catch (error: unknown) {
      console.error('Error removing table:', error);
      const errorMessage = getErrorMessage(error as ErrorWithDetails);
      alert('Error al eliminar mesa: ' + errorMessage);
    }
  };

  const handleCreateOrder = async (tableId: string, itemId: string) => {
    try {
      await createOrder({ variables: { tableId, itemId } });
      refetchOrders();
      refetchTables();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await setOrderStatus({ variables: { id: orderId, status } });
      refetchOrders();
      refetchTables();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handlePayOrder = async (orderId: string) => {
    try {
      await createPayment({ variables: { type: 'CASH', orderId } });
      refetchOrders();
      refetchTables();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleGenerateQrCode = async (tableId: string) => {
    try {
      await generateQrCode({ variables: { tableId } });
      refetchTables();
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getQrCodeUrl = (qrCode: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${qrCode}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageMenu = userData?.me.role === RoleEnum.MANAGER || userData?.me.role === RoleEnum.SUPERADMIN;
  const canManageTables = userData?.me.role !== undefined;

  // Helper function to get detailed error message
  const getErrorMessage = (error: ErrorWithDetails | ApolloError) => {
    if (error?.networkError) {
      if (error.networkError.message.includes('Failed to fetch')) {
        return 'No se puede conectar al servidor backend. Asegúrate de que el backend esté ejecutándose en http://localhost:4000/graphql';
      }
      return `Error de conexión: ${error.networkError.message}`;
    }
    if (error?.graphQLErrors?.length && error.graphQLErrors.length > 0) {
      return error.graphQLErrors.map((err: GraphQLError) => err.message).join(', ');
    }
    return error?.message || 'Error desconocido';
  };

  // Check if we have connection issues
  const hasConnectionIssues = (menuError?.networkError || tablesError?.networkError || ordersError?.networkError) && 
    [menuError, tablesError, ordersError].some(error => 
      error?.networkError?.message?.includes('Failed to fetch')
    );

  // Filter components
  const MenuFilters = () => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filtros</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buscar por nombre</label>
            <input
              type="text"
              value={menuFilter.name || ''}
              onChange={(e) => setMenuFilter({ ...menuFilter, name: e.target.value || undefined })}
              placeholder="Nombre del plato..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio mínimo</label>
            <input
              type="number"
              value={menuFilter.priceMin || ''}
              onChange={(e) => setMenuFilter({ ...menuFilter, priceMin: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio máximo</label>
            <input
              type="number"
              value={menuFilter.priceMax || ''}
              onChange={(e) => setMenuFilter({ ...menuFilter, priceMax: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="999999"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Disponibilidad</label>
            <select
              value={menuFilter.isAvailable === undefined ? '' : menuFilter.isAvailable.toString()}
              onChange={(e) => setMenuFilter({ ...menuFilter, isAvailable: e.target.value === '' ? undefined : e.target.value === 'true' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>
        </div>

        {/* Clear filters button */}
        <div className="mt-4">
          <button
            onClick={() => {
              setMenuFilter({});
              setMenuPage(0);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );

  const MenuSorting = () => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Ordenamiento</h3>
        
        {/* Sorting */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
            <select
              value={menuSort.field}
              onChange={(e) => setMenuSort({ ...menuSort, field: e.target.value as MenuItemSort['field'] })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="name">Nombre (A-Z)</option>
              <option value="price">Precio</option>
              <option value="createdAt">Fecha de creación</option>
              <option value="isAvailable">Disponibilidad</option>
              <option value="id">ID</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Orden</label>
            <select
              value={menuSort.order}
              onChange={(e) => setMenuSort({ ...menuSort, order: e.target.value as 'asc' | 'desc' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>

        {/* Reset sorting button */}
        <div className="mt-4">
          <button
            onClick={() => {
              setMenuSort({ field: 'name', order: 'asc' });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Restablecer orden
          </button>
        </div>
      </div>
    </div>
  );

  const TableFilters = () => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filtros</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Número de mesa</label>
            <input
              type="number"
              value={tableFilter.number || ''}
              onChange={(e) => setTableFilter({ ...tableFilter, number: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Número..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidad mínima</label>
            <input
              type="number"
              value={tableFilter.capacityMin || ''}
              onChange={(e) => setTableFilter({ ...tableFilter, capacityMin: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidad máxima</label>
            <input
              type="number"
              value={tableFilter.capacityMax || ''}
              onChange={(e) => setTableFilter({ ...tableFilter, capacityMax: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="999"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Clear filters button */}
        <div className="mt-4">
          <button
            onClick={() => {
              setTableFilter({});
              setTablePage(0);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );

  const TableSorting = () => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Ordenamiento</h3>
        
        {/* Sorting */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
            <select
              value={tableSort.field}
              onChange={(e) => setTableSort({ ...tableSort, field: e.target.value as TableSort['field'] })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="number">Número de mesa</option>
              <option value="capacity">Capacidad</option>
              <option value="orderCount">Cantidad de pedidos activos</option>
              <option value="id">ID de mesa</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Orden</label>
            <select
              value={tableSort.order}
              onChange={(e) => setTableSort({ ...tableSort, order: e.target.value as 'asc' | 'desc' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>

        {/* Reset sorting button */}
        <div className="mt-4">
          <button
            onClick={() => {
              setTableSort({ field: 'number', order: 'asc' });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Restablecer orden
          </button>
        </div>
      </div>
    </div>
  );

  const OrderFilters = () => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filtros</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              value={orderFilter.status || ''}
              onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value || undefined })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="PREPARING">Preparando</option>
              <option value="READY">Listo</option>
              <option value="DELIVERED">Entregado</option>
              <option value="PAID">Pagado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Mesa</label>
            <input
              type="number"
              value={orderFilter.tableId || ''}
              onChange={(e) => setOrderFilter({ ...orderFilter, tableId: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Número de mesa..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario ID</label>
            <input
              type="number"
              value={orderFilter.userId || ''}
              onChange={(e) => setOrderFilter({ ...orderFilter, userId: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="ID del usuario..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Desde</label>
            <input
              type="datetime-local"
              value={orderFilter.createdAfter ? new Date(orderFilter.createdAfter).toISOString().slice(0, 16) : ''}
              onChange={(e) => setOrderFilter({ ...orderFilter, createdAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Hasta</label>
            <input
              type="datetime-local"
              value={orderFilter.createdBefore ? new Date(orderFilter.createdBefore).toISOString().slice(0, 16) : ''}
              onChange={(e) => setOrderFilter({ ...orderFilter, createdBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Clear filters button */}
        <div className="mt-4">
          <button
            onClick={() => {
              setOrderFilter({});
              setOrderPage(0);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );

  const OrderSorting = () => (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Ordenamiento</h3>
        
        {/* Sorting */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ordenar por</label>
            <select
              value={orderSort.field}
              onChange={(e) => setOrderSort({ ...orderSort, field: e.target.value as OrderSort['field'] })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="createdAt">Fecha de creación</option>
              <option value="status">Estado</option>
              <option value="tableId">Número de mesa</option>
              <option value="orderNumber">Número de pedido</option>
              <option value="id">ID del pedido</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Orden</label>
            <select
              value={orderSort.order}
              onChange={(e) => setOrderSort({ ...orderSort, order: e.target.value as 'asc' | 'desc' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>

        {/* Reset sorting button */}
        <div className="mt-4">
          <button
            onClick={() => {
              setOrderSort({ field: 'createdAt', order: 'desc' });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded text-sm"
          >
            Restablecer orden
          </button>
        </div>
      </div>
    </div>
  );

  // Pagination component
  const Pagination = ({ currentPage, setPage, hasMore }: { currentPage: number; setPage: (page: number) => void; hasMore: boolean }) => (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={() => setPage(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded"
      >
        Anterior
      </button>
      
      <span className="text-gray-700">
        Página {currentPage + 1}
      </span>
      
      <button
        onClick={() => setPage(currentPage + 1)}
        disabled={!hasMore}
        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded"
      >
        Siguiente
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Restaurante</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {userLoading ? (
                  'Cargando usuario...'
                ) : userError ? (
                  'Error cargando usuario'
                ) : userData?.me ? (
                  <>Bienvenido, <strong>{userData.me.email}</strong> ({userData.me.role})</>
                ) : (
                  'Usuario no encontrado'
                )}
              </span>
              <button 
                onClick={onLogout} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                aria-label="Cerrar sesión"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            {['menu', 'tables', 'orders'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'menu' ? 'Menú' : tab === 'tables' ? 'Mesas' : 'Pedidos'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Connection Status Banner */}
        {hasConnectionIssues && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Problema de conexión con el backend
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    No se puede conectar al servidor backend. Para solucionar este problema:
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Asegúrate de que el backend esté ejecutándose</li>
                    <li>Verifica que esté corriendo en <code className="font-mono bg-red-100 px-1 rounded">http://localhost:4000/graphql</code></li>
                    <li>Ejecuta <code className="font-mono bg-red-100 px-1 rounded">npm start</code> en la carpeta del backend</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Menú</h2>
            </div>
            
            {canManageMenu && (
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Agregar Nuevo Plato
                  </h3>
                  <form onSubmit={handleCreateMenuItem} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
                        Nombre del plato
                      </label>
                      <input
                        id="itemName"
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="w-32">
                      <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-700">
                        Precio (COP)
                      </label>
                      <input
                        id="itemPrice"
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        required
                        min="0"
                        step="100"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Agregar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Filters and Sorting */}
            <MenuFilters />
            <MenuSorting />

            {menuLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Cargando menú...</div>
              </div>
            ) : menuError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-700">
                  <strong>Error cargando menú:</strong> {getErrorMessage(menuError)}
                </div>
                <button 
                  onClick={() => refetchMenu()} 
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {menuData?.items.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay items en el menú</p>
                  </div>
                ) : (
                  menuData?.items.map((item) => (
                    <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">{item.name}</h3>
                        <p className="text-gray-600 mb-2"><strong>Precio:</strong> {formatPrice(item.price)}</p>
                        <p className="text-gray-600 mb-2"><strong>SKU:</strong> {item.sku}</p>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Disponible' : 'No disponible'}
                          </span>
                          {canManageMenu && (
                            <button 
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                              aria-label={`Eliminar ${item.name}`}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            <Pagination 
              currentPage={menuPage} 
              setPage={setMenuPage} 
              hasMore={menuData?.items.length === itemsPerPage}
            />
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h2>
              
              {canManageTables && (
                <div className="flex space-x-3">
                  <button 
                    onClick={handleAddTable}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    disabled={addTableLoading}
                  >
                    {addTableLoading ? 'Agregando...' : 'Agregar Mesa'}
                  </button>
                  <button 
                    onClick={handleRemoveTable}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    disabled={removeTableLoading}
                  >
                    {removeTableLoading ? 'Eliminando...' : 'Eliminar Última Mesa'}
                  </button>
                </div>
              )}
            </div>

            {/* Filters and Sorting */}
            <TableFilters />
            <TableSorting />

            {tablesLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Cargando mesas...</div>
              </div>
            ) : tablesError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-700">
                  <strong>Error cargando mesas:</strong> {getErrorMessage(tablesError)}
                </div>
                <button 
                  onClick={() => refetchTables()} 
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tablesData?.tables.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay mesas disponibles</p>
                  </div>
                ) : (
                  tablesData?.tables.map((table) => (
                    <div key={table.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Mesa {table.number}</h3>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {table.orders?.filter(order => order.status !== 'PAID').length || 0} pedidos activos
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4"><strong>Capacidad:</strong> {table.capacity} personas</p>
                        
                        {/* QR Code Section */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Código QR de la Mesa</h4>
                          {table.qrCode ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                                  {table.qrCode}
                                </span>
                                <button
                                  onClick={() => handleGenerateQrCode(table.id)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-1 px-2 rounded text-xs"
                                  title="Regenerar código QR"
                                >
                                  🔄
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <a
                                  href={getQrCodeUrl(table.qrCode)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded text-xs flex-1 text-center"
                                >
                                  Ver Menú Público
                                </a>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(getQrCodeUrl(table.qrCode!));
                                    alert('URL copiada al portapapeles');
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs"
                                  title="Copiar URL"
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGenerateQrCode(table.id)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded text-sm"
                            >
                              Generar Código QR
                            </button>
                          )}
                        </div>

                        {/* Quick order form */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Crear Pedido Rápido:</h4>
                          <div className="flex flex-wrap gap-2">
                            {menuData?.items.slice(0, 3).map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleCreateOrder(table.id, item.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs"
                                aria-label={`Agregar ${item.name} a mesa ${table.number}`}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Orders in this table */}
                        {table.orders && table.orders.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Pedidos:</h4>
                            <div className="space-y-2">
                              {table.orders.map((order) => (
                                <div key={order.id} className="bg-gray-50 rounded p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-sm">Pedido #{order.id}</span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  {order.orderItems?.map((item) => (
                                    <p key={item.id} className="text-xs text-gray-600 mb-1">
                                      {item.quantity}x {item.menuItem?.name} - {formatPrice(item.price)}
                                    </p>
                                  ))}
                                  {order.status !== 'PAID' && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1 px-2 rounded text-xs"
                                      >
                                        Preparando
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs"
                                      >
                                        Listo
                                      </button>
                                      <button
                                        onClick={() => handlePayOrder(order.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded text-xs"
                                      >
                                        Pagar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            <Pagination 
              currentPage={tablePage} 
              setPage={setTablePage} 
              hasMore={tablesData?.tables.length === itemsPerPage}
            />
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Todos los Pedidos</h2>
            </div>
            
            {/* Filters and Sorting */}
            <OrderFilters />
            <OrderSorting />

            {ordersLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Cargando pedidos...</div>
              </div>
            ) : ordersError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-700">
                  <strong>Error cargando pedidos:</strong> {getErrorMessage(ordersError)}
                </div>
                <button 
                  onClick={() => refetchOrders()} 
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ordersData?.orders.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay pedidos registrados</p>
                  </div>
                ) : (
                  ordersData?.orders.map((order) => (
                    <div key={order.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Pedido #{order.id}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2"><strong>Mesa:</strong> {order.tableId}</p>
                        <p className="text-gray-600 mb-4"><strong>Fecha:</strong> {new Date(parseInt(order.createdAt)).toLocaleString()}</p>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                          {order.orderItems?.map((item) => (
                            <p key={item.id} className="text-sm text-gray-600 mb-1">
                              {item.quantity}x {item.menuItem?.name} - {formatPrice(item.price)}
                            </p>
                          ))}
                        </div>

                        {order.status !== 'PAID' && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1 px-3 rounded text-sm"
                            >
                              Preparando
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
                            >
                              Listo
                            </button>
                            <button
                              onClick={() => handlePayOrder(order.id)}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm"
                            >
                              Pagar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            <Pagination 
              currentPage={orderPage} 
              setPage={setOrderPage} 
              hasMore={ordersData?.orders.length === itemsPerPage}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;