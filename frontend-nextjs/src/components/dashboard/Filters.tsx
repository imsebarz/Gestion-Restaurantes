import React from 'react';
import { Button, Input, Card, CardHeader, CardContent } from '../ui';
import { GRID_LAYOUTS, SPACING, TEXT } from '../../lib/styles';
import type { MenuItemFilter, TableFilter, OrderFilter, MenuItemSort, TableSort, OrderSort } from '../../hooks/useDashboardData';

interface MenuFiltersProps {
  filter: MenuItemFilter;
  setFilter: (filter: MenuItemFilter) => void;
  sort: MenuItemSort;
  setSort: (sort: MenuItemSort) => void;
  setPage: (page: number) => void;
}

export const MenuFilters: React.FC<MenuFiltersProps> = ({ filter, setFilter, sort, setSort, setPage }) => (
  <>
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Filtros</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsiveFilters}>
          <Input
            type="text"
            label="Buscar por nombre"
            value={filter.name || ''}
            onChange={(e) => setFilter({ ...filter, name: e.target.value || undefined })}
            placeholder="Nombre del plato..."
          />
          
          <Input
            type="number"
            label="Precio mínimo"
            value={filter.priceMin || ''}
            onChange={(e) => setFilter({ ...filter, priceMin: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
          
          <Input
            type="number"
            label="Precio máximo"
            value={filter.priceMax || ''}
            onChange={(e) => setFilter({ ...filter, priceMax: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="999999"
          />
          
          <Input
            type="select"
            label="Disponibilidad"
            value={filter.isAvailable === undefined ? '' : filter.isAvailable.toString()}
            onChange={(e) => setFilter({ ...filter, isAvailable: e.target.value === '' ? undefined : e.target.value === 'true' })}
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Disponible' },
              { value: 'false', label: 'No disponible' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="secondary"
            onClick={() => {
              setFilter({});
              setPage(0);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Ordenamiento</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsive}>
          <Input
            type="select"
            label="Ordenar por"
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as MenuItemSort['field'] })}
            options={[
              { value: 'name', label: 'Nombre (A-Z)' },
              { value: 'price', label: 'Precio' },
              { value: 'createdAt', label: 'Fecha de creación' },
              { value: 'isAvailable', label: 'Disponibilidad' },
              { value: 'id', label: 'ID' }
            ]}
          />
          
          <Input
            type="select"
            label="Orden"
            value={sort.order}
            onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="primary"
            onClick={() => setSort({ field: 'name', order: 'asc' })}
          >
            Restablecer orden
          </Button>
        </div>
      </CardContent>
    </Card>
  </>
);

interface TableFiltersProps {
  filter: TableFilter;
  setFilter: (filter: TableFilter) => void;
  sort: TableSort;
  setSort: (sort: TableSort) => void;
  setPage: (page: number) => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({ filter, setFilter, sort, setSort, setPage }) => (
  <>
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Filtros</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsiveFilters}>
          <Input
            type="number"
            label="Número de mesa"
            value={filter.number || ''}
            onChange={(e) => setFilter({ ...filter, number: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Número..."
          />
          
          <Input
            type="number"
            label="Capacidad mínima"
            value={filter.capacityMin || ''}
            onChange={(e) => setFilter({ ...filter, capacityMin: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="0"
          />
          
          <Input
            type="number"
            label="Capacidad máxima"
            value={filter.capacityMax || ''}
            onChange={(e) => setFilter({ ...filter, capacityMax: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="999"
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="secondary"
            onClick={() => {
              setFilter({});
              setPage(0);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Ordenamiento</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsive}>
          <Input
            type="select"
            label="Ordenar por"
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as TableSort['field'] })}
            options={[
              { value: 'number', label: 'Número de mesa' },
              { value: 'capacity', label: 'Capacidad' },
              { value: 'orderCount', label: 'Cantidad de pedidos activos' },
              { value: 'id', label: 'ID de mesa' }
            ]}
          />
          
          <Input
            type="select"
            label="Orden"
            value={sort.order}
            onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="primary"
            onClick={() => setSort({ field: 'number', order: 'asc' })}
          >
            Restablecer orden
          </Button>
        </div>
      </CardContent>
    </Card>
  </>
);

interface OrderFiltersProps {
  filter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  sort: OrderSort;
  setSort: (sort: OrderSort) => void;
  setCursor: (cursor: string | undefined) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({ filter, setFilter, sort, setSort, setCursor }) => (
  <>
    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Filtros</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsiveOrderFilters}>
          <Input
            type="select"
            label="Estado"
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'PREPARING', label: 'Preparando' },
              { value: 'READY', label: 'Listo' },
              { value: 'DELIVERED', label: 'Entregado' },
              { value: 'PAID', label: 'Pagado' },
              { value: 'CANCELLED', label: 'Cancelado' }
            ]}
          />
          
          <Input
            type="number"
            label="Mesa"
            value={filter.tableId || ''}
            onChange={(e) => setFilter({ ...filter, tableId: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Número de mesa..."
          />
          
          <Input
            type="number"
            label="Usuario ID"
            value={filter.userId || ''}
            onChange={(e) => setFilter({ ...filter, userId: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="ID del usuario..."
          />
          
          <Input
            type="datetime-local"
            label="Desde"
            value={filter.createdAfter ? new Date(filter.createdAfter).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFilter({ ...filter, createdAfter: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
          
          <Input
            type="datetime-local"
            label="Hasta"
            value={filter.createdBefore ? new Date(filter.createdBefore).toISOString().slice(0, 16) : ''}
            onChange={(e) => setFilter({ ...filter, createdBefore: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="secondary"
            onClick={() => {
              setFilter({});
              setCursor(undefined);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card className={SPACING.section}>
      <CardHeader>
        <h3 className={TEXT.heading3}>Ordenamiento</h3>
      </CardHeader>
      <CardContent>
        <div className={GRID_LAYOUTS.responsive}>
          <Input
            type="select"
            label="Ordenar por"
            value={sort.field}
            onChange={(e) => setSort({ ...sort, field: e.target.value as OrderSort['field'] })}
            options={[
              { value: 'createdAt', label: 'Fecha de creación' },
              { value: 'status', label: 'Estado' },
              { value: 'tableId', label: 'Número de mesa' },
              { value: 'orderNumber', label: 'Número de pedido' },
              { value: 'id', label: 'ID del pedido' }
            ]}
          />
          
          <Input
            type="select"
            label="Orden"
            value={sort.order}
            onChange={(e) => setSort({ ...sort, order: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascendente' },
              { value: 'desc', label: 'Descendente' }
            ]}
          />
        </div>

        <div className={SPACING.button}>
          <Button
            variant="primary"
            onClick={() => setSort({ field: 'createdAt', order: 'desc' })}
          >
            Restablecer orden
          </Button>
        </div>
      </CardContent>
    </Card>
  </>
);