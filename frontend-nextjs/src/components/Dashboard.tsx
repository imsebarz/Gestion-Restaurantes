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
import { Button, Input, Card, CardHeader, CardContent, Badge, getStatusBadgeVariant } from './ui';
import { GRID_LAYOUTS, SPACING, CONTAINER, FLEX, TEXT, cn } from '../lib/styles';

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
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);
  const [addTable, { loading: addTableLoading }] = useMutation(ADD_TABLE);
  const [removeTable, { loading: removeTableLoading }] = useMutation(REMOVE_TABLE);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [setOrderStatus] = useMutation(SET_ORDER_STATUS);
  const [createPayment] = useMutation(CREATE_PAYMENT_FOR_ORDER);
  const [generateQrCode] = useMutation(GENERATE_QR_CODE_FOR_TABLE);

  // Subscriptions with improved error handling and reconnection
  const { data: orderCreatedData, error: orderCreatedError } = useSubscription(ORDER_CREATED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.orderCreated) {
        console.log('🔔 New order created:', subscriptionData.data.orderCreated);
        // Refetch both orders and tables to update counts
        refetchOrders();
        refetchTables();
      }
    },
    onError: (error) => {
      console.error('Order created subscription error:', error);
    }
  });

  const { data: orderUpdatedData, error: orderUpdatedError } = useSubscription(ORDER_UPDATED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.orderUpdated) {
        console.log('🔄 Order updated:', subscriptionData.data.orderUpdated);
        // Refetch both orders and tables to update counts
        refetchOrders();
        refetchTables();
      }
    },
    onError: (error) => {
      console.error('Order updated subscription error:', error);
    }
  });

  const { data: orderStatusChangedData, error: orderStatusChangedError } = useSubscription(ORDER_STATUS_CHANGED_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.orderStatusChanged) {
        console.log('📝 Order status changed:', subscriptionData.data.orderStatusChanged);
        // Refetch both orders and tables to update counts
        refetchOrders();
        refetchTables();
      }
    },
    onError: (error) => {
      console.error('Order status changed subscription error:', error);
    }
  });

  // Show subscription status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const hasSubscriptionErrors = orderCreatedError || orderUpdatedError || orderStatusChangedError;
      if (hasSubscriptionErrors) {
        console.warn('⚠️ Some subscriptions have errors:', {
          orderCreatedError,
          orderUpdatedError,
          orderStatusChangedError
        });
      } else {
        console.log('✅ All subscriptions are active');
      }
    }
  }, [orderCreatedError, orderUpdatedError, orderStatusChangedError]);

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
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Filtros</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsiveFilters}>
          <Input
            type="text"
            label="Buscar por nombre"
            value={menuFilter.name || ''}
            onChange={(e) => setMenuFilter({ ...menuFilter, name: e.target.value || undefined })}
            placeholder="Nombre del plato..."
          />
          
          <Input
            type="number"
            label="Precio mínimo"
            value={menuFilter.priceMin || ''}
            onChange={(e) => setMenuFilter({ ...menuFilter, priceMin: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
          
          <Input
            type="number"
            label="Precio máximo"
            value={menuFilter.priceMax || ''}
            onChange={(e) => setMenuFilter({ ...menuFilter, priceMax: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="999999"
          />
          
          <Input
            type="select"
            label="Disponibilidad"
            value={menuFilter.isAvailable === undefined ? '' : menuFilter.isAvailable.toString()}
            onChange={(e) => setMenuFilter({ ...menuFilter, isAvailable: e.target.value === '' ? undefined : e.target.value === 'true' })}
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Disponible' },
              { value: 'false', label: 'No disponible' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="secondary"
            onClick={() => {
              setMenuFilter({});
              setMenuPage(0);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MenuSorting = () => (
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Ordenamiento</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsive}>
          <Input
            type="select"
            label="Ordenar por"
            value={menuSort.field}
            onChange={(e) => setMenuSort({ ...menuSort, field: e.target.value as MenuItemSort['field'] })}
            options={[
              { value: 'name', label: 'Nombre (A-Z)' },
              { value: 'price', label: 'Precio' },
              { value: 'createdAt', label: 'Fecha de creación' },
              { value: 'isAvailable', label: 'Disponibilidad' },
              { value: 'id', label: 'ID' }
            ]}
          />
          
          <Input
            type="select"
            label="Orden"
            value={menuSort.order}
            onChange={(e) => setMenuSort({ ...menuSort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="primary"
            onClick={() => setMenuSort({ field: 'name', order: 'asc' })}
          >
            Restablecer orden
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TableFilters = () => (
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Filtros</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsiveFilters}>
          <Input
            type="number"
            label="Número de mesa"
            value={tableFilter.number || ''}
            onChange={(e) => setTableFilter({ ...tableFilter, number: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Número..."
          />
          
          <Input
            type="number"
            label="Capacidad mínima"
            value={tableFilter.capacityMin || ''}
            onChange={(e) => setTableFilter({ ...tableFilter, capacityMin: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
          
          <Input
            type="number"
            label="Capacidad máxima"
            value={tableFilter.capacityMax || ''}
            onChange={(e) => setTableFilter({ ...tableFilter, capacityMax: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="999"
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="secondary"
            onClick={() => {
              setTableFilter({});
              setTablePage(0);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TableSorting = () => (
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Ordenamiento</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsive}>
          <Input
            type="select"
            label="Ordenar por"
            value={tableSort.field}
            onChange={(e) => setTableSort({ ...tableSort, field: e.target.value as TableSort['field'] })}
            options={[
              { value: 'number', label: 'Número de mesa' },
              { value: 'capacity', label: 'Capacidad' },
              { value: 'orderCount', label: 'Cantidad de pedidos activos' },
              { value: 'id', label: 'ID de mesa' }
            ]}
          />
          
          <Input
            type="select"
            label="Orden"
            value={tableSort.order}
            onChange={(e) => setTableSort({ ...tableSort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="primary"
            onClick={() => setTableSort({ field: 'number', order: 'asc' })}
          >
            Restablecer orden
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const OrderFilters = () => (
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Filtros</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsiveOrderFilters}>
          <Input
            type="select"
            label="Estado"
            value={orderFilter.status || ''}
            onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value || undefined })}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'PREPARING', label: 'Preparando' },
              { value: 'READY', label: 'Listo' },
              { value: 'DELIVERED', label: 'Entregado' },
              { value: 'PAID', label: 'Pagado' },
              { value: 'CANCELLED', label: 'Cancelado' }
            ]}
          />
          
          <Input
            type="number"
            label="Mesa"
            value={orderFilter.tableId || ''}
            onChange={(e) => setOrderFilter({ ...orderFilter, tableId: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Número de mesa..."
          />
          
          <Input
            type="number"
            label="Usuario ID"
            value={orderFilter.userId || ''}
            onChange={(e) => setOrderFilter({ ...orderFilter, userId: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="ID del usuario..."
          />
          
          <Input
            type="datetime-local"
            label="Desde"
            value={orderFilter.createdAfter ? new Date(orderFilter.createdAfter).toISOString().slice(0, 16) : ''}
            onChange={(e) => setOrderFilter({ ...orderFilter, createdAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
          
          <Input
            type="datetime-local"
            label="Hasta"
            value={orderFilter.createdBefore ? new Date(orderFilter.createdBefore).toISOString().slice(0, 16) : ''}
            onChange={(e) => setOrderFilter({ ...orderFilter, createdBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="secondary"
            onClick={() => {
              setOrderFilter({});
              setOrderCursor(undefined);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const OrderSorting = () => (
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Ordenamiento</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsive}>
          <Input
            type="select"
            label="Ordenar por"
            value={orderSort.field}
            onChange={(e) => setOrderSort({ ...orderSort, field: e.target.value as OrderSort['field'] })}
            options={[
              { value: 'createdAt', label: 'Fecha de creación' },
              { value: 'status', label: 'Estado' },
              { value: 'tableId', label: 'Número de mesa' },
              { value: 'orderNumber', label: 'Número de pedido' },
              { value: 'id', label: 'ID del pedido' }
            ]}
          />
          
          <Input
            type="select"
            label="Orden"
            value={orderSort.order}
            onChange={(e) => setOrderSort({ ...orderSort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="primary"
            onClick={() => setOrderSort({ field: 'createdAt', order: 'desc' })}
          >
            Restablecer orden
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Pagination component
  const Pagination = ({ currentPage, setPage, hasMore }: { currentPage: number; setPage: (page: number) => void; hasMore: boolean }) => (
    <div className={cn(FLEX.between, SPACING.form)}>
      <Button
        variant="secondary"
        onClick={() => setPage(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
      >
        Anterior
      </Button>
      
      <span className={TEXT.body}>
        Página {currentPage + 1}
      </span>
      
      <Button
        variant="secondary"
        onClick={() => setPage(currentPage + 1)}
        disabled={!hasMore}
      >
        Siguiente
      </Button>
    </div>
  );

  // Cursor-based pagination component for orders
  const CursorPagination = ({ 
    pageInfo, 
    onNext, 
    onPrevious 
  }: { 
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
      endCursor?: string;
    };
    onNext: () => void;
    onPrevious: () => void;
  }) => (
    <div className={cn(FLEX.between, SPACING.form)}>
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={!pageInfo.hasPreviousPage}
      >
        Anterior
      </Button>
      
      <span className={TEXT.body}>
        Navegación basada en cursor
      </span>
      
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={!pageInfo.hasNextPage}
      >
        Siguiente
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className={cn(CONTAINER.maxWidth, CONTAINER.padding)}>
          <div className={cn(FLEX.between, 'py-6')}>
            <h1 className={TEXT.heading1}>Sistema de Restaurante</h1>
            <div className="flex items-center space-x-4">
              <span className={TEXT.body}>
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
              <Button 
                variant="danger" 
                onClick={onLogout}
                aria-label="Cerrar sesión"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className={cn(CONTAINER.maxWidth, CONTAINER.padding)}>
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
      <main className={cn(CONTAINER.maxWidth, 'py-6 sm:px-6 lg:px-8')}>
        {/* Connection Status Banner */}
        {hasConnectionIssues && (
          <div className={cn(SPACING.section, 'bg-red-50 border border-red-200 rounded-md p-4')}>
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
                  <p>No se puede conectar al servidor backend. Para solucionar este problema:</p>
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
          <div className={CONTAINER.section}>
            <div className={SPACING.section}>
              <h2 className={TEXT.heading2}>Gestión de Menú</h2>
            </div>
            
            {canManageMenu && (
              <Card className={SPACING.section}>
                <CardHeader>
                  <h3 className={TEXT.heading3}>Agregar Nuevo Plato</h3>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateMenuItem} className={FLEX.wrap}>
                    <div className="flex-1 min-w-0">
                      <Input
                        type="text"
                        label="Nombre del plato"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        label="Precio (COP)"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        required
                        min="0"
                        step="100"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" variant="success">
                        Agregar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Filters and Sorting */}
            <MenuFilters />
            <MenuSorting />

            {menuLoading ? (
              <div className={cn(FLEX.center, 'h-64')}>
                <div className="text-lg text-gray-600">Cargando menú...</div>
              </div>
            ) : menuError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className={TEXT.error}>
                  <strong>Error cargando menú:</strong> {getErrorMessage(menuError)}
                </div>
                <Button 
                  variant="info"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetchMenu()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className={GRID_LAYOUTS.threeCol}>
                {menuData?.items.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay items en el menú</p>
                  </div>
                ) : (
                  menuData?.items.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <h3 className={TEXT.heading3}>{item.name}</h3>
                      </CardHeader>
                      <CardContent>
                        <p className={cn(TEXT.body, SPACING.content)}><strong>Precio:</strong> {formatPrice(item.price)}</p>
                        <p className={cn(TEXT.body, SPACING.content)}><strong>SKU:</strong> {item.sku}</p>
                        <div className={FLEX.between}>
                          <Badge variant={getStatusBadgeVariant(item.isAvailable ? 'available' : 'unavailable')}>
                            {item.isAvailable ? 'Disponible' : 'No disponible'}
                          </Badge>
                          {canManageMenu && (
                            <Button 
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteMenuItem(item.id)}
                              aria-label={`Eliminar ${item.name}`}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
          <div className={CONTAINER.section}>
            <div className={cn(FLEX.between, SPACING.section)}>
              <h2 className={TEXT.heading2}>Gestión de Mesas</h2>
              
              {canManageTables && (
                <div className="flex space-x-3">
                  <Button 
                    variant="success"
                    onClick={handleAddTable}
                    loading={addTableLoading}
                  >
                    Agregar Mesa
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={handleRemoveTable}
                    loading={removeTableLoading}
                  >
                    Eliminar Última Mesa
                  </Button>
                </div>
              )}
            </div>

            {/* Filters and Sorting */}
            <TableFilters />
            <TableSorting />

            {tablesLoading ? (
              <div className={cn(FLEX.center, 'h-64')}>
                <div className="text-lg text-gray-600">Cargando mesas...</div>
              </div>
            ) : tablesError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className={TEXT.error}>
                  <strong>Error cargando mesas:</strong> {getErrorMessage(tablesError)}
                </div>
                <Button 
                  variant="info"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetchTables()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className={GRID_LAYOUTS.threeCol}>
                {tablesData?.tables.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay mesas disponibles</p>
                  </div>
                ) : (
                  tablesData?.tables.map((table) => (
                    <Card key={table.id}>
                      <CardContent>
                        <div className={cn(FLEX.between, SPACING.header)}>
                          <h3 className={TEXT.heading3}>Mesa {table.number}</h3>
                          <Badge variant="info">
                            {table.orders?.filter(order => order.status !== 'PAID').length || 0} pedidos activos
                          </Badge>
                        </div>
                        
                        <p className={cn(TEXT.body, SPACING.header)}><strong>Capacidad:</strong> {table.capacity} personas</p>
                        
                        {/* QR Code Section */}
                        <div className={cn(SPACING.header, 'p-3 bg-gray-50 rounded-lg')}>
                          <h4 className={cn(TEXT.heading4, SPACING.content)}>Código QR de la Mesa</h4>
                          {table.qrCode ? (
                            <div className="space-y-2">
                              <div className={FLEX.between}>
                                <span className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                                  {table.qrCode}
                                </span>
                                <Button
                                  variant="warning"
                                  size="xs"
                                  onClick={() => handleGenerateQrCode(table.id)}
                                  title="Regenerar código QR"
                                >
                                  🔄
                                </Button>
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
                                <Button
                                  variant="info"
                                  size="xs"
                                  onClick={() => {
                                    navigator.clipboard.writeText(getQrCodeUrl(table.qrCode!));
                                    alert('URL copiada al portapapeles');
                                  }}
                                  title="Copiar URL"
                                >
                                  📋
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full"
                              onClick={() => handleGenerateQrCode(table.id)}
                            >
                              Generar Código QR
                            </Button>
                          )}
                        </div>

                        {/* Quick order form */}
                        <div className={SPACING.header}>
                          <h4 className={cn(TEXT.heading4, SPACING.content)}>Crear Pedido Rápido:</h4>
                          <div className={FLEX.wrap}>
                            {menuData?.items.slice(0, 3).map((item) => (
                              <Button
                                key={item.id}
                                variant="info"
                                size="xs"
                                onClick={() => handleCreateOrder(table.id, item.id)}
                                aria-label={`Agregar ${item.name} a mesa ${table.number}`}
                              >
                                {item.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Orders in this table */}
                        {table.orders && table.orders.length > 0 && (
                          <div>
                            <h4 className={cn(TEXT.heading4, SPACING.content)}>Pedidos:</h4>
                            <div className="space-y-2">
                              {table.orders.map((order) => (
                                <div key={order.id} className="bg-gray-50 rounded p-3">
                                  <div className={cn(FLEX.between, SPACING.content)}>
                                    <span className="font-medium text-sm">Pedido #{order.id}</span>
                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  {order.orderItems?.map((item) => (
                                    <p key={item.id} className={cn(TEXT.small, 'mb-1')}>
                                      {item.quantity}x {item.menuItem?.name} - {formatPrice(item.price)}
                                    </p>
                                  ))}
                                  {order.status !== 'PAID' && (
                                    <div className={cn(FLEX.wrap, 'mt-2')}>
                                      <Button
                                        variant="warning"
                                        size="xs"
                                        onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                                      >
                                        Preparando
                                      </Button>
                                      <Button
                                        variant="info"
                                        size="xs"
                                        onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                                      >
                                        Listo
                                      </Button>
                                      <Button
                                        variant="success"
                                        size="xs"
                                        onClick={() => handlePayOrder(order.id)}
                                      >
                                        Pagar
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
          <div className={CONTAINER.section}>
            <div className={SPACING.section}>
              <h2 className={TEXT.heading2}>Todos los Pedidos</h2>
            </div>
            
            {/* Filters and Sorting */}
            <OrderFilters />
            <OrderSorting />

            {ordersLoading ? (
              <div className={cn(FLEX.center, 'h-64')}>
                <div className="text-lg text-gray-600">Cargando pedidos...</div>
              </div>
            ) : ordersError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className={TEXT.error}>
                  <strong>Error cargando pedidos:</strong> {getErrorMessage(ordersError)}
                </div>
                <Button 
                  variant="info"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetchOrders()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className={GRID_LAYOUTS.threeCol}>
                {ordersData?.orders.edges.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No hay pedidos registrados</p>
                  </div>
                ) : (
                  ordersData?.orders.edges.map(({ node: order }) => (
                    <Card key={order.id}>
                      <CardContent>
                        <div className={cn(FLEX.between, SPACING.header)}>
                          <h3 className={TEXT.heading3}>Pedido #{order.id}</h3>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <p className={cn(TEXT.body, SPACING.content)}><strong>Mesa:</strong> {order.tableId}</p>
                        <p className={cn(TEXT.body, SPACING.header)}><strong>Fecha:</strong> {new Date(parseInt(order.createdAt)).toLocaleString()}</p>
                        
                        <div className={SPACING.header}>
                          <h4 className={cn(TEXT.heading4, SPACING.content)}>Items:</h4>
                          {order.orderItems?.map((item) => (
                            <p key={item.id} className={cn(TEXT.small, 'mb-1')}>
                              {item.quantity}x {item.menuItem?.name} - {formatPrice(item.price)}
                            </p>
                          ))}
                        </div>

                        {order.status !== 'PAID' && (
                          <div className={FLEX.wrap}>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                            >
                              Preparando
                            </Button>
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                            >
                              Listo
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handlePayOrder(order.id)}
                            >
                              Pagar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {ordersData?.orders.pageInfo && (
              <CursorPagination 
                pageInfo={ordersData.orders.pageInfo} 
                onNext={() => ordersData?.orders.pageInfo.endCursor && setOrderCursor(ordersData.orders.pageInfo.endCursor)} 
                onPrevious={() => ordersData?.orders.pageInfo.startCursor && setOrderCursor(ordersData.orders.pageInfo.startCursor)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;