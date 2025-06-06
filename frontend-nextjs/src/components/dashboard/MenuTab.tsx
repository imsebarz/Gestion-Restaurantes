import React from 'react';
import { Button, Input, Card, CardHeader, CardContent, Badge, getStatusBadgeVariant } from '../ui';
import { GRID_LAYOUTS, SPACING, CONTAINER, FLEX, TEXT, cn } from '../../lib/styles';
import { MenuFilters } from './Filters';
import { Pagination } from './Pagination';
import type { MenuItem } from '../../types';
import type { MenuItemFilter, MenuItemSort } from '../../hooks/useDashboardData';

interface MenuTabProps {
  // Data
  menuData?: { items: MenuItem[] };
  menuLoading: boolean;
  menuError: any;
  refetchMenu: () => void;
  itemsPerPage: number;
  
  // Filters and sorting
  menuFilter: MenuItemFilter;
  setMenuFilter: (filter: MenuItemFilter) => void;
  menuSort: MenuItemSort;
  setMenuSort: (sort: MenuItemSort) => void;
  menuPage: number;
  setMenuPage: (page: number) => void;
  
  // Actions
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemPrice: string;
  setNewItemPrice: (price: string) => void;
  handleCreateMenuItem: (e: React.FormEvent) => void;
  handleEditMenuItem: (id: string, name: string, price: string) => void;
  handleDeleteMenuItem: (id: string) => void;
  editingItem: { id: string; name: string; price: string } | null;
  setEditingItem: (item: { id: string; name: string; price: string } | null) => void;
  startEditing: (item: { id: string; name: string; price: number }) => void;
  cancelEditing: () => void;
  
  // Utils
  formatPrice: (price: number) => string;
  getErrorMessage: (error: any) => string;
  canManageMenu: boolean;
}

export const MenuTab: React.FC<MenuTabProps> = ({
  menuData,
  menuLoading,
  menuError,
  refetchMenu,
  itemsPerPage,
  menuFilter,
  setMenuFilter,
  menuSort,
  setMenuSort,
  menuPage,
  setMenuPage,
  newItemName,
  setNewItemName,
  newItemPrice,
  setNewItemPrice,
  handleCreateMenuItem,
  handleEditMenuItem,
  handleDeleteMenuItem,
  editingItem,
  setEditingItem,
  startEditing,
  cancelEditing,
  formatPrice,
  getErrorMessage,
  canManageMenu
}) => (
  <div className="p-6 space-y-6">
    {/* Simple Header */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Menú</h2>
        <p className="text-gray-600 text-sm mt-1">
          {menuData?.items?.length || 0} platos · {menuData?.items?.filter(item => item.isAvailable).length || 0} disponibles
        </p>
      </div>
    </div>
    
    {/* Add New Item Form */}
    {canManageMenu && (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Agregar nuevo plato</h3>
        <form onSubmit={handleCreateMenuItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nombre del plato</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                placeholder="Ej: Bandeja paisa"
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Precio (COP)</label>
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
                min="0"
                step="100"
                placeholder="25000"
                className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Compact Filters */}
    <MenuFilters 
      filter={menuFilter}
      setFilter={setMenuFilter}
      sort={menuSort}
      setSort={setMenuSort}
      setPage={setMenuPage}
    />

    {/* Content */}
    {menuLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Cargando...</span>
      </div>
    ) : menuError ? (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error al cargar el menú</p>
        <p className="text-red-600 text-sm mt-1">{getErrorMessage(menuError)}</p>
        <button 
          onClick={() => refetchMenu()}
          className="mt-3 px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
        >
          Reintentar
        </button>
      </div>
    ) : (
      <>
        {menuData?.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay platos en el menú</p>
            {canManageMenu && (
              <p className="text-gray-400 text-sm mt-1">Agrega el primer plato usando el formulario de arriba</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {menuData?.items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isAvailable ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">SKU: {item.sku}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                    {canManageMenu && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditing({ id: item.id, name: item.name, price: item.price })}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Item Form - Shown only when editing */}
                {editingItem?.id === item.id && (
                  <div className="mt-4">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditMenuItem(item.id, editingItem.name, editingItem.price);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Nombre del plato</label>
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Precio (COP)</label>
                        <input
                          type="number"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                          required
                          min="0"
                          step="100"
                          className="w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {menuData?.items && menuData.items.length > 0 && (
          <div className="flex justify-center pt-4">
            <Pagination 
              currentPage={menuPage} 
              setPage={setMenuPage} 
              hasMore={menuData?.items.length === itemsPerPage}
            />
          </div>
        )}
      </>
    )}
  </div>
);