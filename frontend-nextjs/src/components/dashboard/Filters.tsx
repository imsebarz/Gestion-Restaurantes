import React, { useState } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');
  const hasActiveSorting = sort.field !== 'name' || sort.order !== 'asc';
  
  return (
    <div className="space-y-3">
      {/* Compact Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filter.name || ''}
            onChange={(e) => setFilter({ ...filter, name: e.target.value || undefined })}
            placeholder="Buscar por nombre..."
            className="w-full pl-9 pr-4 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {filter.name && (
            <button
              onClick={() => setFilter({ ...filter, name: undefined })}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors",
            (hasActiveFilters || hasActiveSorting) 
              ? "border-blue-500 bg-blue-100 text-blue-800" 
              : "border-gray-400 bg-white text-gray-800 hover:bg-gray-100"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          <span>Filtros</span>
          {(hasActiveFilters || hasActiveSorting) && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filter).filter(Boolean).length + (hasActiveSorting ? 1 : 0)}
            </span>
          )}
          <svg className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Clear All Button */}
        {(hasActiveFilters || hasActiveSorting) && (
          <button
            onClick={() => {
              setFilter({});
              setSort({ field: 'name', order: 'asc' });
              setPage(0);
            }}
            className="px-3 py-2 text-sm text-gray-800 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          {/* Price Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={filter.priceMin || ''}
                onChange={(e) => setFilter({ ...filter, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Mínimo"
                className="px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                value={filter.priceMax || ''}
                onChange={(e) => setFilter({ ...filter, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Máximo"
                className="px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidad</label>
            <select
              value={filter.isAvailable === undefined ? '' : filter.isAvailable.toString()}
              onChange={(e) => setFilter({ ...filter, isAvailable: e.target.value === '' ? undefined : e.target.value === 'true' })}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>
          
          {/* Sorting */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={sort.field}
                onChange={(e) => setSort({ ...sort, field: e.target.value as MenuItemSort['field'] })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="createdAt">Fecha</option>
                <option value="isAvailable">Disponibilidad</option>
              </select>
              <select
                value={sort.order}
                onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="asc">A-Z / Menor a mayor</option>
                <option value="desc">Z-A / Mayor a menor</option>
              </select>
            </div>
          </div>
        </div>
      )}
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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');
  const hasActiveSorting = sort.field !== 'number' || sort.order !== 'asc';
  
  return (
    <div className="space-y-3">
      {/* Quick Filters */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <input
            type="number"
            value={filter.number || ''}
            onChange={(e) => setFilter({ ...filter, number: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Buscar mesa por número..."
            className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors",
            (hasActiveFilters || hasActiveSorting) 
              ? "border-blue-500 bg-blue-100 text-blue-800" 
              : "border-gray-400 bg-white text-gray-800 hover:bg-gray-100"
          )}
        >
          <span>Filtros</span>
          {(hasActiveFilters || hasActiveSorting) && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filter).filter(Boolean).length + (hasActiveSorting ? 1 : 0)}
            </span>
          )}
          <svg className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {(hasActiveFilters || hasActiveSorting) && (
          <button
            onClick={() => {
              setFilter({});
              setSort({ field: 'number', order: 'asc' });
              setPage(0);
            }}
            className="px-3 py-2 text-sm text-gray-800 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={filter.capacityMin || ''}
                onChange={(e) => setFilter({ ...filter, capacityMin: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Mínima"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                value={filter.capacityMax || ''}
                onChange={(e) => setFilter({ ...filter, capacityMax: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Máxima"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={sort.field}
                onChange={(e) => setSort({ ...sort, field: e.target.value as TableSort['field'] })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="number">Número</option>
                <option value="capacity">Capacidad</option>
                <option value="orderCount">Pedidos activos</option>
              </select>
              <select
                value={sort.order}
                onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="asc">Menor a mayor</option>
                <option value="desc">Mayor a menor</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface OrderFiltersProps {
  filter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  sort: OrderSort;
  setSort: (sort: OrderSort) => void;
  setPage: (page: number) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({ filter, setFilter, sort, setSort, setPage }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = Object.values(filter).some(value => value !== undefined && value !== '');
  const hasActiveSorting = sort.field !== 'createdAt' || sort.order !== 'desc';
  
  return (
    <div className="space-y-3">
      {/* Quick Status Filter */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los pedidos</option>
            <option value="PENDING">Pendientes</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Listos</option>
            <option value="PAID">Pagados</option>
          </select>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors",
            (hasActiveFilters || hasActiveSorting) 
              ? "border-blue-500 bg-blue-100 text-blue-800" 
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <span>Más filtros</span>
          {(hasActiveFilters || hasActiveSorting) && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filter).filter(Boolean).length + (hasActiveSorting ? 1 : 0)}
            </span>
          )}
          <svg className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {(hasActiveFilters || hasActiveSorting) && (
          <button
            onClick={() => {
              setFilter({});
              setSort({ field: 'createdAt', order: 'desc' });
              setPage(0);
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
              <input
                type="number"
                value={filter.tableId || ''}
                onChange={(e) => setFilter({ ...filter, tableId: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Número de mesa"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario ID</label>
              <input
                type="number"
                value={filter.userId || ''}
                onChange={(e) => setFilter({ ...filter, userId: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="ID del usuario"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={filter.createdAfter ? new Date(filter.createdAfter).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFilter({ ...filter, createdAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="datetime-local"
                value={filter.createdBefore ? new Date(filter.createdBefore).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFilter({ ...filter, createdBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={sort.field}
                onChange={(e) => setSort({ ...sort, field: e.target.value as OrderSort['field'] })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="createdAt">Fecha</option>
                <option value="status">Estado</option>
                <option value="tableId">Mesa</option>
                <option value="orderNumber">Número</option>
              </select>
              <select
                value={sort.order}
                onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="desc">Más recientes</option>
                <option value="asc">Más antiguos</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};