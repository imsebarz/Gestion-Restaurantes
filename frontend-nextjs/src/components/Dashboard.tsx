'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui';
import { CONTAINER, FLEX, TEXT, cn } from '../lib/styles';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardUtils } from '../hooks/useDashboardUtils';
import { useDashboardActions } from '../hooks/useDashboardActions';
import { MenuTab } from './dashboard/MenuTab';
import { TablesTab } from './dashboard/TablesTab';
import { OrdersTab } from './dashboard/OrdersTab';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('menu');
  
  // Custom hooks
  const dashboardData = useDashboardData();
  const dashboardUtils = useDashboardUtils(dashboardData.userData);
  const dashboardActions = useDashboardActions({
    createMenuItem: dashboardData.createMenuItem,
    deleteMenuItem: dashboardData.deleteMenuItem,
    addTable: dashboardData.addTable,
    removeTable: dashboardData.removeTable,
    createOrder: dashboardData.createOrder,
    setOrderStatus: dashboardData.setOrderStatus,
    createPayment: dashboardData.createPayment,
    generateQrCode: dashboardData.generateQrCode,
    refetchMenu: dashboardData.refetchMenu,
    refetchTables: dashboardData.refetchTables,
    refetchOrders: dashboardData.refetchOrders,
    getErrorMessage: dashboardUtils.getErrorMessage
  });

  // Check if we have connection issues
  const hasConnectionIssues = dashboardUtils.hasConnectionIssues(
    dashboardData.menuError,
    dashboardData.tablesError,
    dashboardData.ordersError
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
                {dashboardData.userLoading ? (
                  'Cargando usuario...'
                ) : dashboardData.userError ? (
                  'Error cargando usuario'
                ) : dashboardData.userData?.me ? (
                  <>Bienvenido, <strong>{dashboardData.userData.me.email}</strong> ({dashboardData.userData.me.role})</>
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

        {/* Tab Content */}
        {activeTab === 'menu' && (
          <MenuTab
            menuData={dashboardData.menuData}
            menuLoading={dashboardData.menuLoading}
            menuError={dashboardData.menuError}
            refetchMenu={dashboardData.refetchMenu}
            itemsPerPage={dashboardData.itemsPerPage}
            menuFilter={dashboardData.menuFilter}
            setMenuFilter={dashboardData.setMenuFilter}
            menuSort={dashboardData.menuSort}
            setMenuSort={dashboardData.setMenuSort}
            menuPage={dashboardData.menuPage}
            setMenuPage={dashboardData.setMenuPage}
            newItemName={dashboardActions.newItemName}
            setNewItemName={dashboardActions.setNewItemName}
            newItemPrice={dashboardActions.newItemPrice}
            setNewItemPrice={dashboardActions.setNewItemPrice}
            handleCreateMenuItem={dashboardActions.handleCreateMenuItem}
            handleDeleteMenuItem={dashboardActions.handleDeleteMenuItem}
            formatPrice={dashboardUtils.formatPrice}
            getErrorMessage={dashboardUtils.getErrorMessage}
            canManageMenu={dashboardUtils.canManageMenu}
          />
        )}

        {activeTab === 'tables' && (
          <TablesTab
            tablesData={dashboardData.tablesData}
            tablesLoading={dashboardData.tablesLoading}
            tablesError={dashboardData.tablesError}
            refetchTables={dashboardData.refetchTables}
            menuData={dashboardData.menuData}
            itemsPerPage={dashboardData.itemsPerPage}
            tableFilter={dashboardData.tableFilter}
            setTableFilter={dashboardData.setTableFilter}
            tableSort={dashboardData.tableSort}
            setTableSort={dashboardData.setTableSort}
            tablePage={dashboardData.tablePage}
            setTablePage={dashboardData.setTablePage}
            handleAddTable={dashboardActions.handleAddTable}
            handleRemoveTable={dashboardActions.handleRemoveTable}
            handleCreateOrder={dashboardActions.handleCreateOrder}
            handleUpdateOrderStatus={dashboardActions.handleUpdateOrderStatus}
            handlePayOrder={dashboardActions.handlePayOrder}
            handleGenerateQrCode={dashboardActions.handleGenerateQrCode}
            addTableLoading={dashboardData.addTableLoading}
            removeTableLoading={dashboardData.removeTableLoading}
            formatPrice={dashboardUtils.formatPrice}
            getErrorMessage={dashboardUtils.getErrorMessage}
            getQrCodeUrl={dashboardUtils.getQrCodeUrl}
            canManageTables={dashboardUtils.canManageTables}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            ordersData={dashboardData.ordersData}
            ordersLoading={dashboardData.ordersLoading}
            ordersError={dashboardData.ordersError}
            refetchOrders={dashboardData.refetchOrders}
            orderFilter={dashboardData.orderFilter}
            setOrderFilter={dashboardData.setOrderFilter}
            orderSort={dashboardData.orderSort}
            setOrderSort={dashboardData.setOrderSort}
            orderCursor={dashboardData.orderCursor}
            setOrderCursor={dashboardData.setOrderCursor}
            handleUpdateOrderStatus={dashboardActions.handleUpdateOrderStatus}
            handlePayOrder={dashboardActions.handlePayOrder}
            formatPrice={dashboardUtils.formatPrice}
            getErrorMessage={dashboardUtils.getErrorMessage}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;