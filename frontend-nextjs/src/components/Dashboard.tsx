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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Custom hooks
  const dashboardData = useDashboardData();
  const dashboardUtils = useDashboardUtils(dashboardData.userData);
  const dashboardActions = useDashboardActions({
    createMenuItem: dashboardData.createMenuItem,
    editMenuItem: dashboardData.editMenuItem,
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
      icon: '🍽️',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      count: dashboardData.menuData?.items?.length || 0,
      color: 'from-orange-500 to-red-500',
      description: 'Gestiona platos y bebidas'
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: '🪑',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      count: dashboardData.tablesData?.tables?.length || 0,
      color: 'from-blue-500 to-indigo-500',
      description: 'Administra mesas y capacidad'
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: '📋',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      count: dashboardData.ordersData?.orders?.length || 0,
      color: 'from-green-500 to-teal-500',
      description: 'Maneja pedidos y pagos'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2 shadow-lg">
                    <svg className="h-full w-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    RestaurantePro
                  </h1>
                  <p className="text-xs text-gray-500">Sistema de gestión</p>
                </div>
              </div>
            </div>
            
            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                  <span className="text-orange-600">🍽️</span>
                  <span className="font-medium text-orange-700">{dashboardData.menuData?.items?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-600">🪑</span>
                  <span className="font-medium text-blue-700">{dashboardData.tablesData?.tables?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">📋</span>
                  <span className="font-medium text-green-700">{dashboardData.ordersData?.orders?.length || 0}</span>
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                {dashboardData.userLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : dashboardData.userData?.me ? (
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {dashboardData.userData.me.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                        {dashboardData.userData.me.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {dashboardData.userData.me.role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 text-sm">Error de usuario</div>
                )}
                
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={onLogout}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "bg-white/80 backdrop-blur-sm border-r border-gray-200/50 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          <div className="p-4">
            {/* Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              <svg className={cn("w-5 h-5 transition-transform", sidebarCollapsed && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Navigation Items */}
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 text-xl",
                    !sidebarCollapsed && "mr-1"
                  )}>
                    {tab.icon}
                  </div>
                  
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{tab.label}</div>
                        <div className={cn(
                          "text-xs",
                          activeTab === tab.id ? "text-white/80" : "text-gray-500"
                        )}>
                          {tab.description}
                        </div>
                      </div>
                      
                      {tab.count > 0 && (
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          activeTab === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </>
                  )}
                  
                  {sidebarCollapsed && tab.count > 0 && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {tab.count}
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Connection Status Banner */}
          {hasConnectionIssues && (
            <div className="m-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800">Problema de conexión</h3>
                  <p className="text-sm text-red-700 mt-1">
                    No se puede conectar al servidor backend. Asegúrate de que esté ejecutándose en 
                    <code className="mx-1 px-2 py-0.5 bg-red-200 rounded text-xs">http://localhost:4000/graphql</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-4 h-full overflow-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-full">
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
                  newItemImageUrl={dashboardActions.newItemImageUrl}
                  setNewItemImageUrl={dashboardActions.setNewItemImageUrl}
                  handleCreateMenuItem={dashboardActions.handleCreateMenuItem}
                  handleEditMenuItem={dashboardActions.handleEditMenuItem}
                  handleDeleteMenuItem={dashboardActions.handleDeleteMenuItem}
                  editingItem={dashboardActions.editingItem}
                  setEditingItem={dashboardActions.setEditingItem}
                  startEditing={dashboardActions.startEditing}
                  cancelEditing={dashboardActions.cancelEditing}
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
                  currentPage={dashboardData.orderPage}
                  setPage={dashboardData.setOrderPage}
                  hasMore={(() => {
                    const totalCount = dashboardData.ordersData?.orders?.totalCount || 0;
                    const currentPage = dashboardData.orderPage;
                    const itemsPerPage = dashboardData.itemsPerPage;
                    return (currentPage + 1) * itemsPerPage < totalCount;
                  })()}
                  orderFilter={dashboardData.orderFilter}
                  setOrderFilter={dashboardData.setOrderFilter}
                  orderSort={dashboardData.orderSort}
                  setOrderSort={dashboardData.setOrderSort}
                  handleUpdateOrderStatus={dashboardActions.handleUpdateOrderStatus}
                  handlePayOrder={dashboardActions.handlePayOrder}
                  formatPrice={dashboardUtils.formatPrice}
                  getErrorMessage={dashboardUtils.getErrorMessage}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;