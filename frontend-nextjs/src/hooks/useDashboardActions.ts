import { useState } from 'react';
import { useDashboardUtils } from './useDashboardUtils';

interface UseDashboardActionsProps {
  createMenuItem: any;
  editMenuItem: any;
  deleteMenuItem: any;
  addTable: any;
  removeTable: any;
  createOrder: any;
  setOrderStatus: any;
  createPayment: any;
  generateQrCode: any;
  refetchMenu: () => void;
  refetchTables: () => void;
  refetchOrders: () => void;
  getErrorMessage: (error: any) => string;
}

export const useDashboardActions = ({
  createMenuItem,
  editMenuItem,
  deleteMenuItem,
  addTable,
  removeTable,
  createOrder,
  setOrderStatus,
  createPayment,
  generateQrCode,
  refetchMenu,
  refetchTables,
  refetchOrders,
  getErrorMessage
}: UseDashboardActionsProps) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; price: string } | null>(null);

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

  const handleEditMenuItem = async (id: string, name: string, price: string) => {
    try {
      await editMenuItem({
        variables: { 
          id, 
          title: name, 
          price: parseFloat(price) 
        }
      });
      setEditingItem(null);
      refetchMenu();
    } catch (error) {
      console.error('Error editing menu item:', error);
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
      const errorMessage = getErrorMessage(error as any);
      alert('Error al agregar mesa: ' + errorMessage);
    }
  };

  const handleRemoveTable = async () => {
    try {
      await removeTable();
      refetchTables();
    } catch (error: unknown) {
      console.error('Error removing table:', error);
      const errorMessage = getErrorMessage(error as any);
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

  const startEditing = (item: { id: string; name: string; price: number }) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      price: item.price.toString()
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  return {
    // Form state
    newItemName,
    setNewItemName,
    newItemPrice,
    setNewItemPrice,
    editingItem,
    setEditingItem,

    // Handlers
    handleCreateMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem,
    handleAddTable,
    handleRemoveTable,
    handleCreateOrder,
    handleUpdateOrderStatus,
    handlePayOrder,
    handleGenerateQrCode,
    startEditing,
    cancelEditing
  };
};