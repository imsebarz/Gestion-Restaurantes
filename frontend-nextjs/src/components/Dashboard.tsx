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

  // Tab configuration with icons and improved styling
  const tabs = [
    {
      id: 'menu',
      label: 'Menú',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      count: dashboardData.menuData?.items?.length || 0
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      count: dashboardData.tablesData?.tables?.length || 0
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      count: dashboardData.ordersData?.orders?.edges?.length || 0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header with improved design */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className={cn(CONTAINER.maxWidth, CONTAINER.padding)}>
          <div className={cn(FLEX.between, 'py-4')}>
            <div className="flex items-center space-x-4">
              {/* Logo/Brand area */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    RestaurantePro
                  </h1>
                  <p className="text-sm text-gray-500">Sistema de gestión</p>
                </div>
              </div>
            </div>
            
            {/* User info and actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                {dashboardData.userLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                    <span className="text-gray-500">Cargando...</span>
                  </div>
                ) : dashboardData.userError ? (
                  <div className="flex items-center space-x-2 text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>Error de conexión</span>
                  </div>
                ) : dashboardData.userData?.me ? (
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {dashboardData.userData.me.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {dashboardData.userData.me.role}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Usuario no encontrado</span>
                )}
              </div>
              
              <Button 
                variant="danger" 
                onClick={onLogout}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
                aria-label="Cerrar sesión"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation with icons and counters */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className={cn(CONTAINER.maxWidth, CONTAINER.padding)}>
          <div className="flex justify-center">
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative group',
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  )}
                >
                  <div className={cn(
                    'transition-colors duration-200',
                    activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                  )}>
                    {tab.icon}
                  </div>
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium transition-colors duration-200',
                      activeTab === tab.id 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Content with improved spacing and layout */}
      <main className={cn(CONTAINER.maxWidth, 'py-8 px-4 sm:px-6 lg:px-8')}>
        {/* Enhanced Connection Status Banner */}
        {hasConnectionIssues && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  🔌 Problema de conexión con el backend
                </h3>
                <p className="text-red-700 mb-3">
                  No se puede conectar al servidor backend. Esto puede afectar la funcionalidad del sistema.
                </p>
                <div className="bg-white/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-red-800">Pasos para solucionar:</p>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Asegúrate de que el backend esté ejecutándose</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Verifica que esté corriendo en <code className="font-mono bg-red-200 px-2 py-0.5 rounded text-red-800">http://localhost:4000/graphql</code></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Ejecuta <code className="font-mono bg-red-200 px-2 py-0.5 rounded text-red-800">npm start</code> en la carpeta del backend</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content with improved containers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
        </div>
      </main>
    </div>
  );
};


export default Dashboard;