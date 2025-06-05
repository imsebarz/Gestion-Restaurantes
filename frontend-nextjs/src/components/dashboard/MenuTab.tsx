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
  handleDeleteMenuItem: (id: string) => void;
  
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
  handleDeleteMenuItem,
  formatPrice,
  getErrorMessage,
  canManageMenu
}) => (
  <div className="p-6 space-y-8">
    {/* Enhanced Header with Analytics */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Menú</h2>
          <p className="text-gray-600 mt-1">Administra los platos y bebidas del restaurante</p>
        </div>
      </div>
      
      {/* Quick Analytics Cards */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">Disponibles</p>
            <p className="text-lg font-bold text-green-700">
              {menuData?.items?.filter(item => item.isAvailable).length || 0}
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Total</p>
            <p className="text-lg font-bold text-blue-700">
              {menuData?.items?.length || 0}
            </p>
          </div>
        </div>
        
        {menuData?.items && menuData.items.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl px-4 py-3 min-w-0 flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Precio Promedio</p>
              <p className="text-lg font-bold text-purple-700">
                {formatPrice(
                  menuData.items.reduce((sum, item) => sum + item.price, 0) / menuData.items.length
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Enhanced Add New Item Form */}
    {canManageMenu && (
      <Card className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 border-indigo-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Agregar Nuevo Plato</h3>
              <p className="text-sm text-gray-600">Crea un nuevo elemento para el menú</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMenuItem} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                type="text"
                label="Nombre del plato"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
                placeholder="Ej: Bandeja paisa, Sancocho de gallina..."
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div>
              <Input
                type="number"
                label="Precio (COP)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
                min="0"
                step="100"
                placeholder="25000"
                className="bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                variant="success"
                className="w-full h-12 flex items-center justify-center space-x-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Agregar Plato</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )}

    {/* Enhanced Filters */}
    <MenuFilters 
      filter={menuFilter}
      setFilter={setMenuFilter}
      sort={menuSort}
      setSort={setMenuSort}
      setPage={setMenuPage}
    />

    {/* Enhanced Content Area */}
    {menuLoading ? (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-medium text-gray-600">Cargando menú...</p>
          <p className="text-sm text-gray-500 mt-1">Obteniendo la lista de platos</p>
        </div>
      </div>
    ) : menuError ? (
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
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error cargando menú</h3>
            <p className="text-red-700 mb-4">{getErrorMessage(menuError)}</p>
            <Button 
              variant="info"
              onClick={() => refetchMenu()}
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
        {/* Enhanced Menu Items Grid */}
        {menuData?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay platos en el menú</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primer plato al menú</p>
              {canManageMenu && (
                <p className="text-sm text-gray-400">Usa el formulario de arriba para agregar un nuevo plato</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuData?.items.map((item) => (
              <div key={item.id} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 shadow-md bg-white overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors duration-200">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">SKU: {item.sku}</p>
                      </div>
                      <Badge 
                        variant={item.isAvailable ? 'success' : 'danger'}
                        className="ml-3 flex-shrink-0"
                      >
                        <div className="flex items-center space-x-1">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            item.isAvailable ? "bg-green-400" : "bg-red-400"
                          )}></div>
                          <span>{item.isAvailable ? 'Disponible' : 'Agotado'}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(item.price)}</span>
                      </div>
                      
                      {canManageMenu && (
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center space-x-1 hover:scale-105"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Eliminar</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {menuData?.items && menuData.items.length > 0 && (
          <div className="mt-8">
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