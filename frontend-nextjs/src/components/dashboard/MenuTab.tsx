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
  <div className={CONTAINER.section}>
    <div className={SPACING.section}>
      <h2 className={TEXT.heading2}>Gestión de Menú</h2>
    </div>
    
    {canManageMenu && (
      <Card className={SPACING.section}>
        <CardHeader>
          <h3 className={TEXT.heading3}>Agregar Nuevo Plato</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateMenuItem} className={FLEX.wrap}>
            <div className="flex-1 min-w-0">
              <Input
                type="text"
                label="Nombre del plato"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                required
              />
            </div>
            <div className="w-32">
              <Input
                type="number"
                label="Precio (COP)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                required
                min="0"
                step="100"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="success">
                Agregar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )}

    {/* Filters and Sorting */}
    <MenuFilters 
      filter={menuFilter}
      setFilter={setMenuFilter}
      sort={menuSort}
      setSort={setMenuSort}
      setPage={setMenuPage}
    />

    {menuLoading ? (
      <div className={cn(FLEX.center, 'h-64')}>
        <div className="text-lg text-gray-600">Cargando menú...</div>
      </div>
    ) : menuError ? (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className={TEXT.error}>
          <strong>Error cargando menú:</strong> {getErrorMessage(menuError)}
        </div>
        <Button 
          variant="info"
          size="sm"
          className="mt-2"
          onClick={() => refetchMenu()}
        >
          Reintentar
        </Button>
      </div>
    ) : (
      <div className={GRID_LAYOUTS.threeCol}>
        {menuData?.items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No hay items en el menú</p>
          </div>
        ) : (
          menuData?.items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <h3 className={TEXT.heading3}>{item.name}</h3>
              </CardHeader>
              <CardContent>
                <p className={cn(TEXT.body, SPACING.content)}><strong>Precio:</strong> {formatPrice(item.price)}</p>
                <p className={cn(TEXT.body, SPACING.content)}><strong>SKU:</strong> {item.sku}</p>
                <div className={FLEX.between}>
                  <Badge variant={getStatusBadgeVariant(item.isAvailable ? 'available' : 'unavailable')}>
                    {item.isAvailable ? 'Disponible' : 'No disponible'}
                  </Badge>
                  {canManageMenu && (
                    <Button 
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item.id)}
                      aria-label={`Eliminar ${item.name}`}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )}

    {/* Pagination */}
    <Pagination 
      currentPage={menuPage} 
      setPage={setMenuPage} 
      hasMore={menuData?.items.length === itemsPerPage}
    />
  </div>
);