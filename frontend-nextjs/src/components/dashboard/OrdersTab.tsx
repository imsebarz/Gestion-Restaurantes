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
}) => (
  <div className={CONTAINER.section}>
    <div className={SPACING.section}>
      <h2 className={TEXT.heading2}>Todos los Pedidos</h2>
    </div>
    
    {/* Filters and Sorting */}
    <OrderFilters 
      filter={orderFilter}
      setFilter={setOrderFilter}
      sort={orderSort}
      setSort={setOrderSort}
      setCursor={setOrderCursor}
    />

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
);