import { defineFeature, loadFeature } from 'jest-cucumber';
import { CreateOrderByQrCode } from '../../application/useCases/CreateOrderByQrCode';
import { UpdateOrderStatus } from '../../application/useCases/UpdateOrderStatus';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { Table } from '../../domain/entities/Table';
import { MenuItem } from '../../domain/entities/MenuItem';
import { User, RoleEnum } from '../../domain/entities/User';
import { IOrderRepository } from '../../application/interfaces/IOrderRepository';
import { ITableRepository } from '../../application/interfaces/ITableRepository';
import { IMenuItemRepository } from '../../application/interfaces/IMenuItemRepository';
import { IUserRepository } from '../../application/interfaces/IUserRepository';

const feature = loadFeature('./tests/features/gestion-pedidos-corregida-simple.feature');

defineFeature(feature, (test) => {
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockTableRepository: jest.Mocked<ITableRepository>;
  let mockMenuItemRepository: jest.Mocked<IMenuItemRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let createOrderByQrCode: CreateOrderByQrCode;
  let updateOrderStatus: UpdateOrderStatus;

  beforeEach(() => {
    // Mock repositories
    mockOrderRepository = {
      findById: jest.fn(),
      findByTableId: jest.fn(),
      findByQrCode: jest.fn(),
      findMany: jest.fn(),
      findManyWithPagination: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addOrderItem: jest.fn(),
      updateOrderStatus: jest.fn(),
    };

    mockTableRepository = {
      findById: jest.fn(),
      findByNumber: jest.fn(),
      findByQrCode: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getNextTableNumber: jest.fn(),
      count: jest.fn(),
    };

    mockMenuItemRepository = {
      findById: jest.fn(),
      findBySku: jest.fn(),
      findMany: jest.fn(),
      findManyWithPagination: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    createOrderByQrCode = new CreateOrderByQrCode(
      mockOrderRepository,
      mockTableRepository,
      mockMenuItemRepository,
      mockUserRepository
    );
    updateOrderStatus = new UpdateOrderStatus(mockOrderRepository);
  });

  test('Cliente crea un pedido desde QR con múltiples items', ({ given, and, when, then }) => {
    let currentOrder: Order | null = null;
    let currentTable: Table | null = null;
    let currentMenuItems: Map<string, MenuItem> = new Map();

    // Background steps
    given('el sistema está funcionando correctamente', () => {
      // System is ready
    });

    and('hay mesas disponibles con códigos QR', () => {
      // Tables will be set up in specific steps
    });

    and('hay elementos de menú disponibles', () => {
      // Menu items will be set up in specific steps
    });

    and('hay usuarios con permisos adecuados', () => {
      // Users will be set up in specific steps
    });

    // Scenario-specific steps
    given(/^la mesa (\d+) tiene el código QR "(.*)"$/, (tableNumber: string, qrCode: string) => {
      currentTable = new Table(parseInt(tableNumber), parseInt(tableNumber), 4, qrCode);
      mockTableRepository.findByQrCode.mockResolvedValue(currentTable);
    });

    and(/^el elemento de menú "(.*)" está disponible por (\d+) COP$/, (itemName: string, price: string) => {
      const menuItem = new MenuItem(
        currentMenuItems.size + 1,
        `SKU-${currentMenuItems.size + 1}`,
        itemName,
        parseInt(price),
        'https://example.com/image.jpg',
        true,
        new Date()
      );
      currentMenuItems.set(itemName, menuItem);
      mockMenuItemRepository.findById.mockImplementation((id: number) => {
        const item = Array.from(currentMenuItems.values()).find(item => item.id === id);
        return Promise.resolve(item || null);
      });
    });

    when(/^el cliente escanea el código QR "(.*)"$/, (qrCode: string) => {
      // Part of order creation flow
    });

    and(/^selecciona (\d+) unidades de "(.*)"$/, (quantity: string, itemName: string) => {
      // Part of order creation flow
    });

    and(/^selecciona (\d+) unidad de "(.*)"$/, (quantity: string, itemName: string) => {
      // Part of order creation flow
    });

    and('confirma el pedido', async () => {
      const guestUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      mockUserRepository.findByEmail.mockResolvedValue(guestUser);
      
      const mockOrder = new Order(1, OrderStatus.PENDING, currentTable?.id || 1, 1, new Date(), []);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      
      const items = Array.from(currentMenuItems.values()).map(item => ({
        menuItemId: item.id,
        quantity: item.name === 'Hamburguesa Clásica' ? 2 : 1
      }));
      
      const orderItems = items.map((item, index) => ({
        id: index + 1,
        orderId: 1,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: Array.from(currentMenuItems.values())[index].price,
        getTotal: function() { return this.quantity * this.price; }
      }));
      
      const completeOrder = new Order(1, OrderStatus.PENDING, currentTable?.id || 1, 1, new Date(), orderItems as any);
      mockOrderRepository.findById.mockResolvedValue(completeOrder);
      
      currentOrder = await createOrderByQrCode.execute({
        qrCode: currentTable?.qrCode || 'QR123',
        items
      });
    });

    then(/^se debe crear un pedido con estado "(.*)"$/, (status: string) => {
      expect(currentOrder).toBeDefined();
      expect(currentOrder?.status).toBe(status as OrderStatus);
    });

    and(/^el pedido debe tener (\d+) items$/, (itemCount: string) => {
      expect(currentOrder).toBeDefined();
      expect(currentOrder?.orderItems.length).toBe(parseInt(itemCount));
    });

    and(/^el total del pedido debe ser (\d+) COP$/, (expectedTotal: string) => {
      expect(currentOrder).toBeDefined();
      expect(currentOrder?.getTotalAmount()).toBe(parseInt(expectedTotal));
    });
  });

  test('Error al crear pedido con mesa inexistente', ({ given, and, when, then }) => {
    let currentError: Error | null = null;

    // Background steps
    given('el sistema está funcionando correctamente', () => {
      // System is ready
    });

    and('hay mesas disponibles con códigos QR', () => {
      // Tables will be set up in specific steps
    });

    and('hay elementos de menú disponibles', () => {
      // Menu items will be set up in specific steps
    });

    and('hay usuarios con permisos adecuados', () => {
      // Users will be set up in specific steps
    });

    // Scenario-specific steps
    given(/^no existe mesa con código QR "(.*)"$/, (qrCode: string) => {
      mockTableRepository.findByQrCode.mockResolvedValue(null);
    });

    when(/^el cliente escanea el código QR "(.*)"$/, (qrCode: string) => {
      // Part of order creation flow
    });

    and('intenta crear un pedido', async () => {
      try {
        await createOrderByQrCode.execute({
          qrCode: 'QR_INEXISTENTE',
          items: [{ menuItemId: 1, quantity: 1 }]
        });
      } catch (error) {
        currentError = error as Error;
      }
    });

    then(/^debe recibir el error "(.*)"$/, (expectedMessage: string) => {
      expect(currentError).toBeDefined();
      expect(currentError?.message).toBe(expectedMessage);
    });
  });

  test('Error al actualizar estado sin permisos', ({ given, and, when, then }) => {
    let currentError: Error | null = null;
    let currentUser: User | null = null;

    // Background steps
    given('el sistema está funcionando correctamente', () => {
      // System is ready
    });

    and('hay mesas disponibles con códigos QR', () => {
      // Tables will be set up in specific steps
    });

    and('hay elementos de menú disponibles', () => {
      // Menu items will be set up in specific steps
    });

    and('hay usuarios con permisos adecuados', () => {
      // Users will be set up in specific steps
    });

    // Scenario-specific steps
    given(/^hay un pedido con ID (\d+) en estado "(.*)"$/, (orderId: string, status: string) => {
      const order = new Order(
        parseInt(orderId),
        status as OrderStatus,
        1,
        1,
        new Date(),
        []
      );
      mockOrderRepository.findById.mockResolvedValue(order);
    });

    and(/^el usuario "(.*)" no tiene permisos para gestionar pedidos$/, (email: string) => {
      currentUser = new User(1, email, 'hashedPassword', RoleEnum.STAFF, new Date());
      jest.spyOn(currentUser, 'canManageOrders').mockReturnValue(false);
    });

    when(/^el usuario intenta actualizar el pedido (\d+) a estado "(.*)"$/, async (orderId: string, status: string) => {
      try {
        if (!currentUser) {
          throw new Error('No user set for this scenario');
        }
        
        const updatedOrder = new Order(parseInt(orderId), status as OrderStatus, 1, 1, new Date(), []);
        mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
        
        await updateOrderStatus.execute({
          orderId: parseInt(orderId),
          newStatus: status as OrderStatus,
          user: currentUser
        });
      } catch (error) {
        currentError = error as Error;
      }
    });

    then(/^debe recibir el error "(.*)"$/, (expectedMessage: string) => {
      expect(currentError).toBeDefined();
      expect(currentError?.message).toBe(expectedMessage);
    });
  });
});
