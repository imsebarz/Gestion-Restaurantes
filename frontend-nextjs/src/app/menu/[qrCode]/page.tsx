'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GET_TABLE_BY_QR_CODE, GET_MENU_ITEMS, CREATE_ORDER_BY_QR_CODE, GET_ORDERS_BY_QR_CODE } from '@/lib/queries';
import type { Order, OrderItem } from '@/types';
import { Button, Card, CardHeader, CardContent, Badge, getStatusBadgeVariant } from '@/components/ui';
import { GRID_LAYOUTS, SPACING, CONTAINER, FLEX, TEXT, cn } from '@/lib/styles';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  sku: string;
  isAvailable: boolean;
}

interface CartItem {
  menuItemId: string;
  quantity: number;
  name: string;
  price: number;
}

export default function MenuQRPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Queries
  const { data: tableData, loading: tableLoading, error: tableError } = useQuery(GET_TABLE_BY_QR_CODE, {
    variables: { qrCode },
    skip: !qrCode,
  });

  const { data: menuData, loading: menuLoading } = useQuery(GET_MENU_ITEMS);
  
  const { data: ordersData, refetch: refetchOrders } = useQuery(GET_ORDERS_BY_QR_CODE, {
    variables: { qrCode },
    skip: !qrCode,
    pollInterval: 5000, // Poll every 5 seconds to get updates
  });

  // Mutation
  const [createOrderByQrCode, { loading: orderLoading }] = useMutation(CREATE_ORDER_BY_QR_CODE, {
    onCompleted: () => {
      setCart([]);
      setOrderPlaced(true);
      refetchOrders();
      setTimeout(() => setOrderPlaced(false), 3000);
    },
    onError: (error) => {
      console.error('Error creating order:', error);
    },
  });

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, {
        menuItemId: item.id,
        quantity: 1,
        name: item.name,
        price: item.price,
      }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === menuItemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem.menuItemId !== menuItemId);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    const items = cart.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));

    createOrderByQrCode({
      variables: {
        qrCode,
        items,
      },
    });
  };

  if (tableLoading || menuLoading) {
    return (
      <div className={cn(FLEX.center, 'min-h-screen bg-gray-50')}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className={cn(TEXT.body, 'mt-4')}>Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (tableError || !tableData?.getTableByQrCode) {
    return (
      <div className={cn(FLEX.center, 'min-h-screen bg-gray-50')}>
        <div className="text-center">
          <h1 className={cn(TEXT.heading2, 'text-red-600 mb-4')}>Mesa no encontrada</h1>
          <p className={TEXT.body}>El código QR escaneado no es válido.</p>
        </div>
      </div>
    );
  }

  const table = tableData.getTableByQrCode;
  const menuItems = menuData?.items || [];
  const orders = ordersData?.getOrdersByQrCode || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className={cn(CONTAINER.maxWidth, CONTAINER.padding, 'py-4')}>
          <div className={FLEX.between}>
            <div>
              <h1 className={TEXT.heading2}>Menú Restaurante</h1>
              <p className={TEXT.body}>Mesa {table.number} - Capacidad: {table.capacity} personas</p>
            </div>
            <Badge variant="info" size="lg">
              Mesa #{table.number}
            </Badge>
          </div>
        </div>
      </div>

      <div className={cn(CONTAINER.maxWidth, CONTAINER.padding, 'py-8')}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h2 className={cn(TEXT.heading3, SPACING.section)}>Nuestro Menú</h2>
            <div className={GRID_LAYOUTS.responsive}>
              {menuItems.map((item: MenuItem) => (
                <Card key={item.id}>
                  <CardContent>
                    <div className={cn(FLEX.between, SPACING.header)}>
                      <div>
                        <h3 className={TEXT.heading4}>{item.name}</h3>
                        <p className={TEXT.small}>SKU: {item.sku}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    
                    {item.isAvailable ? (
                      <Button
                        variant="primary"
                        onClick={() => addToCart(item)}
                        className="w-full"
                      >
                        Agregar al pedido
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled
                        className="w-full"
                      >
                        No disponible
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart and Orders */}
          <div className="space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <h3 className={TEXT.heading3}>Tu Pedido</h3>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className={cn(TEXT.body, 'text-center py-4')}>No hay items en tu pedido</p>
                ) : (
                  <>
                    {cart.map((item) => (
                      <div key={item.menuItemId} className={cn(FLEX.between, 'py-2 border-b')}>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className={TEXT.small}>{formatPrice(item.price)} c/u</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="danger"
                            size="xs"
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="w-8 h-8 rounded-full p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="success"
                            size="xs"
                            onClick={() => addToCart({ id: item.menuItemId, name: item.name, price: item.price, sku: '', isAvailable: true })}
                            className="w-8 h-8 rounded-full p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className={cn(FLEX.between, SPACING.header)}>
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(getTotalPrice())}
                        </span>
                      </div>
                      
                      <Button
                        variant="success"
                        onClick={handlePlaceOrder}
                        loading={orderLoading}
                        className="w-full"
                        size="lg"
                      >
                        Realizar Pedido
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Success Message */}
            {orderPlaced && (
              <Card className="border-green-400 bg-green-50">
                <CardContent>
                  <p className="font-medium text-green-700">¡Pedido realizado con éxito!</p>
                  <p className={cn(TEXT.small, 'text-green-600')}>Tu pedido ha sido enviado a la cocina.</p>
                </CardContent>
              </Card>
            )}

            {/* Current Orders */}
            {orders.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className={TEXT.heading3}>Pedidos de la Mesa</h3>
                </CardHeader>
                <CardContent>
                  {orders.map((order: Order) => (
                    <div key={order.id} className="border-b pb-4 mb-4 last:border-b-0">
                      <div className={cn(FLEX.between, SPACING.content)}>
                        <span className={TEXT.heading4}>
                          Pedido #{order.id}
                        </span>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      {order.orderItems?.map((item: OrderItem) => (
                        <div key={item.id} className={TEXT.small}>
                          {item.quantity}x {item.menuItem?.name} - {formatPrice(item.price)}
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}