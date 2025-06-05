import React from 'react';
import { Button, Card, CardContent, Badge, getStatusBadgeVariant } from '../ui';
import { GRID_LAYOUTS, SPACING, CONTAINER, FLEX, TEXT, cn } from '../../lib/styles';
import { TableFilters } from './Filters';
import { Pagination } from './Pagination';
import type { Table, MenuItem } from '../../types';
import type { TableFilter, TableSort } from '../../hooks/useDashboardData';

interface TablesTabProps {
  // Data
  tablesData?: { tables: Table[] };
  tablesLoading: boolean;
  tablesError: any;
  refetchTables: () => void;
  menuData?: { items: MenuItem[] };
  itemsPerPage: number;
  
  // Filters and sorting
  tableFilter: TableFilter;
  setTableFilter: (filter: TableFilter) => void;
  tableSort: TableSort;
  setTableSort: (sort: TableSort) => void;
  tablePage: number;
  setTablePage: (page: number) => void;
  
  // Actions
  handleAddTable: () => void;
  handleRemoveTable: () => void;
  handleCreateOrder: (tableId: string, itemId: string) => void;
  handleUpdateOrderStatus: (orderId: string, status: string) => void;
  handlePayOrder: (orderId: string) => void;
  handleGenerateQrCode: (tableId: string) => void;
  addTableLoading: boolean;
  removeTableLoading: boolean;
  
  // Utils
  formatPrice: (price: number) => string;
  getErrorMessage: (error: any) => string;
  getQrCodeUrl: (qrCode: string) => string;
  canManageTables: boolean;
}

export const TablesTab: React.FC<TablesTabProps> = ({
  tablesData,
  tablesLoading,
  tablesError,
  refetchTables,
  menuData,
  itemsPerPage,
  tableFilter,
  setTableFilter,
  tableSort,
  setTableSort,
  tablePage,
  setTablePage,
  handleAddTable,
  handleRemoveTable,
  handleCreateOrder,
  handleUpdateOrderStatus,
  handlePayOrder,
  handleGenerateQrCode,
  addTableLoading,
  removeTableLoading,
  formatPrice,
  getErrorMessage,
  getQrCodeUrl,
  canManageTables
}) => (
  <div className="p-6 space-y-8">
    {/* Enhanced Header with Analytics */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h2>
          <p className="text-gray-600 mt-1">Administra las mesas y su capacidad</p>
        </div>
      </div>
      
      {/* Quick Analytics Cards */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Total Mesas</p>
            <p className="text-lg font-bold text-blue-700">
              {tablesData?.tables?.length || 0}
            </p>
          </div>
        </div>
        
        {tablesData?.tables && tablesData.tables.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Con QR</p>
                <p className="text-lg font-bold text-green-700">
                  {tablesData.tables.filter(table => table.qrCode).length}
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Capacidad Total</p>
                <p className="text-lg font-bold text-purple-700">
                  {tablesData.tables.reduce((sum, table) => sum + table.capacity, 0)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Management Actions */}
    {canManageTables && (
      <Card className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border-indigo-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gestionar Mesas</h3>
                <p className="text-sm text-gray-600">Agregar o eliminar mesas del restaurante</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="success"
                onClick={handleAddTable}
                loading={addTableLoading}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Agregar Mesa</span>
              </Button>
              <Button 
                variant="danger"
                onClick={handleRemoveTable}
                loading={removeTableLoading}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Eliminar Última</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Enhanced Filters */}
    <TableFilters 
      filter={tableFilter}
      setFilter={setTableFilter}
      sort={tableSort}
      setSort={setTableSort}
      setPage={setTablePage}
    />

    {/* Enhanced Content Area */}
    {tablesLoading ? (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-medium text-gray-600">Cargando mesas...</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo información de las mesas</p>
        </div>
      </div>
    ) : tablesError ? (
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
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error cargando mesas</h3>
            <p className="text-red-700 mb-4">{getErrorMessage(tablesError)}</p>
            <Button 
              variant="info"
              onClick={() => refetchTables()}
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
        {/* Enhanced Tables Grid */}
        {tablesData?.tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay mesas disponibles</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primera mesa</p>
              {canManageTables && (
                <p className="text-sm text-gray-400">Usa el botón "Agregar Mesa" de arriba</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tablesData?.tables.map((table) => (
              <Card key={table.id} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
                <CardContent className="p-6">
                  {/* Table Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">#{table.number}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Mesa {table.number}</h3>
                        <p className="text-sm text-gray-500">Capacidad: {table.capacity} personas</p>
                      </div>
                    </div>
                    <Badge variant="info" className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>{table.orders?.filter(order => order.status !== 'PAID').length || 0} activos</span>
                    </Badge>
                  </div>
                
                  {/* QR Code Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-6V4l6 12zM6 4v7h6V4H6z" />
                      </svg>
                      <h4 className="font-medium text-gray-900">Código QR</h4>
                    </div>
                    {table.qrCode ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                          <span className="text-xs text-gray-600 font-mono truncate">
                            {table.qrCode}
                          </span>
                          <Button
                            variant="warning"
                            size="xs"
                            onClick={() => handleGenerateQrCode(table.id)}
                            title="Regenerar código QR"
                            className="ml-2"
                          >
                            🔄
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={getQrCodeUrl(table.qrCode)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-xs text-center transition-colors"
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
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <h4 className="font-medium text-gray-900">Pedido Rápido</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {menuData?.items.slice(0, 3).map((item) => (
                        <Button
                          key={item.id}
                          variant="info"
                          size="xs"
                          onClick={() => handleCreateOrder(table.id, item.id)}
                          className="text-xs"
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
                      <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h4 className="font-medium text-gray-900">Pedidos Actuales</h4>
                      </div>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {table.orders.map((order) => (
                          <div key={order.id} className="bg-white rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">Pedido #{order.id}</span>
                              <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                                {order.status}
                              </Badge>
                            </div>
                            {order.orderItems?.map((item) => (
                              <p key={item.id} className="text-xs text-gray-600 mb-1">
                                {item.quantity}x {item.menuItem?.name} - {formatPrice(item.price)}
                              </p>
                            ))}
                            {order.status !== 'PAID' && (
                              <div className="flex flex-wrap gap-1 mt-2">
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
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {tablesData?.tables && tablesData.tables.length > 0 && (
          <div className="mt-8">
            <Pagination 
              currentPage={tablePage} 
              setPage={setTablePage} 
              hasMore={tablesData?.tables.length === itemsPerPage}
            />
          </div>
        )}
      </>
    )}
  </div>
);