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
    <TableFilters 
      filter={tableFilter}
      setFilter={setTableFilter}
      sort={tableSort}
      setSort={setTableSort}
      setPage={setTablePage}
    />

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
);