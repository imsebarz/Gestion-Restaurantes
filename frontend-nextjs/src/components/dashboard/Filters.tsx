import React from 'react';
import { Button, Input, Card, CardHeader, CardContent } from '../ui';
import { GRID_LAYOUTS, SPACING, TEXT, cn } from '../../lib/styles';
import type { MenuItemFilter, TableFilter, OrderFilter, MenuItemSort, TableSort, OrderSort } from '../../hooks/useDashboardData';

interface MenuFiltersProps {
  filter: MenuItemFilter;
  setFilter: (filter: MenuItemFilter) => void;
  sort: MenuItemSort;
  setSort: (sort: MenuItemSort) => void;
  setPage: (page: number) => void;
}

export const MenuFilters: React.FC<MenuFiltersProps> = ({ filter, setFilter, sort, setSort, setPage }) => {
  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');
  
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Enhanced Filters Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              Filtros activos
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilter({});
              setPage(0);
            }}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpiar todo</span>
          </Button>
        )}
      </div>

      {/* Enhanced Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            type="text"
            label="Buscar por nombre"
            value={filter.name || ''}
            onChange={(e) => setFilter({ ...filter, name: e.target.value || undefined })}
            placeholder="Ej: bandeja, sancocho..."
            className="bg-white"
          />
          {filter.name && (
            <button
              onClick={() => setFilter({ ...filter, name: undefined })}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <Input
          type="number"
          label="Precio mínimo"
          value={filter.priceMin || ''}
          onChange={(e) => setFilter({ ...filter, priceMin: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="$ 0"
          className="bg-white"
        />
        
        <Input
          type="number"
          label="Precio máximo"
          value={filter.priceMax || ''}
          onChange={(e) => setFilter({ ...filter, priceMax: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="$ 999,999"
          className="bg-white"
        />
        
        <Input
          type="select"
          label="Disponibilidad"
          value={filter.isAvailable === undefined ? '' : filter.isAvailable.toString()}
          onChange={(e) => setFilter({ ...filter, isAvailable: e.target.value === '' ? undefined : e.target.value === 'true' })}
          options={[
            { value: '', label: 'Todos' },
            { value: 'true', label: '✅ Disponible' },
            { value: 'false', label: '❌ No disponible' }
          ]}
          className="bg-white"
        />
      </div>

      {/* Enhanced Sorting Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h4 className="text-base font-medium text-gray-900">Ordenamiento</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="select"
            label="Ordenar por"
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as MenuItemSort['field'] })}
            options={[
              { value: 'name', label: '🔤 Nombre (A-Z)' },
              { value: 'price', label: '💰 Precio' },
              { value: 'createdAt', label: '📅 Fecha de creación' },
              { value: 'isAvailable', label: '✅ Disponibilidad' },
              { value: 'id', label: '🔢 ID' }
            ]}
            className="bg-white"
          />
          
          <Input
            type="select"
            label="Orden"
            value={sort.order}
            onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: '⬆️ Ascendente' },
              { value: 'desc', label: '⬇️ Descendente' }
            ]}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};

interface TableFiltersProps {
  filter: TableFilter;
  setFilter: (filter: TableFilter) => void;
  sort: TableSort;
  setSort: (sort: TableSort) => void;
  setPage: (page: number) => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({ filter, setFilter, sort, setSort, setPage }) => {
  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');
  
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Enhanced Filters Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Mesas</h3>
          {hasActiveFilters && (
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
              Filtros activos
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilter({});
              setPage(0);
            }}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpiar todo</span>
          </Button>
        )}
      </div>

      {/* Enhanced Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="number"
          label="Número de mesa"
          value={filter.number || ''}
          onChange={(e) => setFilter({ ...filter, number: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Ej: 5, 12..."
          className="bg-white"
        />
        
        <Input
          type="number"
          label="Capacidad mínima"
          value={filter.capacityMin || ''}
          onChange={(e) => setFilter({ ...filter, capacityMin: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Ej: 2"
          className="bg-white"
        />
        
        <Input
          type="number"
          label="Capacidad máxima"
          value={filter.capacityMax || ''}
          onChange={(e) => setFilter({ ...filter, capacityMax: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Ej: 8"
          className="bg-white"
        />
      </div>

      {/* Enhanced Sorting Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h4 className="text-base font-medium text-gray-900">Ordenamiento</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="select"
            label="Ordenar por"
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as TableSort['field'] })}
            options={[
              { value: 'number', label: '🔢 Número de mesa' },
              { value: 'capacity', label: '👥 Capacidad' },
              { value: 'orderCount', label: '📋 Pedidos activos' },
              { value: 'id', label: '🆔 ID de mesa' }
            ]}
            className="bg-white"
          />
          
          <Input
            type="select"
            label="Orden"
            value={sort.order}
            onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: '⬆️ Ascendente' },
              { value: 'desc', label: '⬇️ Descendente' }
            ]}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};

interface OrderFiltersProps {
  filter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  sort: OrderSort;
  setSort: (sort: OrderSort) => void;
  setCursor: (cursor: string | undefined) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({ filter, setFilter, sort, setSort, setCursor }) => {
  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');
  
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Enhanced Filters Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Pedidos</h3>
          {hasActiveFilters && (
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
              Filtros activos
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilter({});
              setCursor(undefined);
            }}
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpiar todo</span>
          </Button>
        )}
      </div>

      {/* Enhanced Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          type="select"
          label="Estado del pedido"
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'PENDING', label: '⏳ Pendiente' },
            { value: 'PREPARING', label: '👨‍🍳 Preparando' },
            { value: 'READY', label: '✅ Listo' },
            { value: 'DELIVERED', label: '🚚 Entregado' },
            { value: 'PAID', label: '💳 Pagado' },
            { value: 'CANCELLED', label: '❌ Cancelado' }
          ]}
          className="bg-white"
        />
        
        <Input
          type="number"
          label="Mesa"
          value={filter.tableId || ''}
          onChange={(e) => setFilter({ ...filter, tableId: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Número de mesa..."
          className="bg-white"
        />
        
        <Input
          type="number"
          label="Usuario ID"
          value={filter.userId || ''}
          onChange={(e) => setFilter({ ...filter, userId: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="ID del usuario..."
          className="bg-white"
        />
      </div>

      {/* Date Range Filters */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-base font-medium text-gray-900">Rango de fechas</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="datetime-local"
            label="Desde"
            value={filter.createdAfter ? new Date(filter.createdAfter).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFilter({ ...filter, createdAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            className="bg-white"
          />
          
          <Input
            type="datetime-local"
            label="Hasta"
            value={filter.createdBefore ? new Date(filter.createdBefore).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFilter({ ...filter, createdBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            className="bg-white"
          />
        </div>
      </div>

      {/* Enhanced Sorting Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h4 className="text-base font-medium text-gray-900">Ordenamiento</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="select"
            label="Ordenar por"
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as OrderSort['field'] })}
            options={[
              { value: 'createdAt', label: '📅 Fecha de creación' },
              { value: 'status', label: '📊 Estado' },
              { value: 'tableId', label: '🪑 Número de mesa' },
              { value: 'orderNumber', label: '🔢 Número de pedido' },
              { value: 'id', label: '🆔 ID del pedido' }
            ]}
            className="bg-white"
          />
          
          <Input
            type="select"
            label="Orden"
            value={sort.order}
            onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: '⬆️ Ascendente' },
              { value: 'desc', label: '⬇️ Descendente' }
            ]}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};