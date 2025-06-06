import React from 'react';
import { Button, Card, CardContent, Badge, getStatusBadgeVariant } from '../ui';
import { GRID_LAYOUTS, SPACING, CONTAINER, FLEX, TEXT, cn } from '../../lib/styles';
import { OrderFilters } from './Filters';
import { CursorPagination } from './Pagination';
import type { Order } from '../../types';
import type { OrderFilter, OrderSort } from '../../hooks/useDashboardData';

interface OrdersTabProps {
  // Data
  ordersData?: {
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
  };
  ordersLoading: boolean;
  ordersError: any;
  refetchOrders: () => void;
  
  // Filters and sorting
  orderFilter: OrderFilter;
  setOrderFilter: (filter: OrderFilter) => void;
  orderSort: OrderSort;
  setOrderSort: (sort: OrderSort) => void;
  orderCursor: string | undefined;
  setOrderCursor: (cursor: string | undefined) => void;
  
  // Actions
  handleUpdateOrderStatus: (orderId: string, status: string) => void;
  handlePayOrder: (orderId: string) => void;
  
  // Utils
  formatPrice: (price: number) => string;
  getErrorMessage: (error: any) => string;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
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
  handleUpdateOrderStatus,
  handlePayOrder,
  formatPrice,
  getErrorMessage
}) => {
  const orders = ordersData?.orders?.edges?.map(edge => edge.node) || [];
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = orders
    .filter(order => order.status === 'PAID')
    .reduce((sum, order) => {
      return sum + (order.orderItems?.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0) || 0);
    }, 0);

  return (
    <div className="p-6 space-y-8">
      {/* Enhanced Header with Analytics */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
            <p className="text-gray-600 mt-1">Monitorea y administra todos los pedidos</p>
          </div>
        </div>
        
        {/* Quick Analytics Cards */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total</p>
              <p className="text-lg font-bold text-blue-700">{orders.length}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Pendientes</p>
              <p className="text-lg font-bold text-yellow-700">
                {(statusCounts['PENDING'] || 0) + (statusCounts['PREPARING'] || 0) + (statusCounts['READY'] || 0)}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Ingresos</p>
              <p className="text-lg font-bold text-green-700">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { status: 'PENDING', label: 'Pendientes', color: 'from-gray-600 to-slate-700', bgColor: 'from-gray-100 to-slate-100', borderColor: 'border-gray-300' },
          { status: 'PREPARING', label: 'Preparando', color: 'from-yellow-600 to-orange-600', bgColor: 'from-yellow-100 to-orange-100', borderColor: 'border-yellow-300' },
          { status: 'READY', label: 'Listos', color: 'from-blue-600 to-indigo-600', bgColor: 'from-blue-100 to-indigo-100', borderColor: 'border-blue-300' },
          { status: 'PAID', label: 'Pagados', color: 'from-green-600 to-emerald-600', bgColor: 'from-green-100 to-emerald-100', borderColor: 'border-green-300' }
        ].map(({ status, label, color, bgColor, borderColor }) => (
          <Card key={status} className={cn("bg-gradient-to-r", bgColor, "border", borderColor)}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-r", color, "flex items-center justify-center")}>
                  <span className="text-white font-bold text-sm">{statusCounts[status] || 0}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-700">{status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Enhanced Filters */}
      <OrderFilters 
        filter={orderFilter}
        setFilter={setOrderFilter}
        sort={orderSort}
        setSort={setOrderSort}
        setCursor={setOrderCursor}
      />

      {/* Enhanced Content Area */}
      {ordersLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium text-gray-600">Cargando pedidos...</p>
            <p className="text-sm text-gray-500 mt-1">Obteniendo la lista de pedidos</p>
          </div>
        </div>
      ) : ordersError ? (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error cargando pedidos</h3>
              <p className="text-red-700 mb-4">{getErrorMessage(ordersError)}</p>
              <Button 
                variant="info"
                onClick={() => refetchOrders()}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reintentar</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Enhanced Orders Grid */}
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No hay pedidos</h3>
                <p className="text-gray-500 mb-4">Los pedidos aparecerán aquí cuando los clientes hagan pedidos</p>
                <p className="text-sm text-gray-400">Los clientes pueden hacer pedidos escaneando el código QR de las mesas</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.map((order) => {
                const orderTotal = order.orderItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                const statusColor = {
                  'PENDING': 'border-l-gray-400 bg-gray-50',
                  'PREPARING': 'border-l-yellow-400 bg-yellow-50',
                  'READY': 'border-l-blue-400 bg-blue-50',
                  'PAID': 'border-l-green-400 bg-green-50'
                }[order.status] || 'border-l-gray-400 bg-gray-50';

                return (
                  <Card key={order.id} className={cn("border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1", statusColor)}>
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">Pedido #{order.id}</h3>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>Mesa {order.table?.number}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{new Date(order.createdAt).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(orderTotal)}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-white rounded-lg border p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Artículos del pedido</span>
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {order.orderItems?.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <span className="text-gray-900">{item.menuItem?.name}</span>
                              </div>
                              <span className="font-medium text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {order.status !== 'PAID' && (
                        <div className="flex flex-wrap gap-2">
                          {order.status === 'PENDING' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                              className="flex items-center space-x-1 flex-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Preparar</span>
                            </Button>
                          )}
                          {(order.status === 'PREPARING' || order.status === 'PENDING') && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                              className="flex items-center space-x-1 flex-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Listo</span>
                            </Button>
                          )}
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handlePayOrder(order.id)}
                            className="flex items-center space-x-1 flex-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>Cobrar</span>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Enhanced Pagination */}
          {ordersData?.orders.pageInfo && (
            <div className="mt-8">
              <CursorPagination 
                pageInfo={ordersData.orders.pageInfo} 
                onNext={() => ordersData?.orders.pageInfo.endCursor && setOrderCursor(ordersData.orders.pageInfo.endCursor)} 
                onPrevious={() => ordersData?.orders.pageInfo.startCursor && setOrderCursor(ordersData.orders.pageInfo.startCursor)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};