'use client';

import { useQuery, useMutation } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GET_TABLE_BY_QR_CODE, GET_MENU_ITEMS, CREATE_ORDER_BY_QR_CODE, GET_ORDERS_BY_QR_CODE } from '@/lib/queries';
import type { Order, OrderItem } from '@/types';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (tableError || !tableData?.getTableByQrCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Mesa no encontrada</h1>
          <p className="text-gray-600">El código QR escaneado no es válido.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menú Restaurante</h1>
              <p className="text-gray-600">Mesa {table.number} - Capacidad: {table.capacity} personas</p>
            </div>
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-800">Mesa #{table.number}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nuestro Menú</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item: MenuItem) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      ${item.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {item.isAvailable ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Agregar al pedido
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed"
                    >
                      No disponible
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cart and Orders */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Pedido</h3>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay items en tu pedido</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toLocaleString()} c/u</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart({ id: item.menuItemId, name: item.name, price: item.price, sku: '', isAvailable: true })}
                          className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${getTotalPrice().toLocaleString()}
                      </span>
                    </div>
                    
                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderLoading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {orderLoading ? 'Procesando...' : 'Realizar Pedido'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Order Success Message */}
            {orderPlaced && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">¡Pedido realizado con éxito!</p>
                <p className="text-sm">Tu pedido ha sido enviado a la cocina.</p>
              </div>
            )}

            {/* Current Orders */}
            {orders.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos de la Mesa</h3>
                {orders.map((order: Order) => (
                  <div key={order.id} className="border-b pb-4 mb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Pedido #{order.id}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'READY' ? 'bg-green-100 text-green-800' :
                        order.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    {order.orderItems?.map((item: OrderItem) => (
                      <div key={item.id} className="text-sm text-gray-600">
                        {item.quantity}x {item.menuItem?.name} - ${item.price.toLocaleString()}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}