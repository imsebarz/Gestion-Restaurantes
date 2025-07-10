import { CreateOrderByQrCode } from '../../../application/useCases/CreateOrderByQrCode';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { Table } from '../../../domain/entities/Table';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { User, RoleEnum } from '../../../domain/entities/User';
import { IOrderRepository } from '../../../application/interfaces/IOrderRepository';
import { ITableRepository } from '../../../application/interfaces/ITableRepository';
import { IMenuItemRepository } from '../../../application/interfaces/IMenuItemRepository';
import { IUserRepository } from '../../../application/interfaces/IUserRepository';

// Mock repositories
const mockOrderRepository: jest.Mocked<IOrderRepository> = {
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

const mockTableRepository: jest.Mocked<ITableRepository> = {
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

const mockMenuItemRepository: jest.Mocked<IMenuItemRepository> = {
  findById: jest.fn(),
  findBySku: jest.fn(),
  findMany: jest.fn(),
  findManyWithPagination: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreateOrderByQrCode - Corrected Unit Tests', () => {
  let createOrderByQrCode: CreateOrderByQrCode;
  
  beforeEach(() => {
    jest.clearAllMocks();
    createOrderByQrCode = new CreateOrderByQrCode(
      mockOrderRepository,
      mockTableRepository,
      mockMenuItemRepository,
      mockUserRepository
    );
  });

  describe('Core Functionality', () => {
    it('should create order successfully with valid QR code and items', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [
        { menuItemId: 1, quantity: 2 },
        { menuItemId: 2, quantity: 1 }
      ];
      
      // Mock responses
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockMenuItem1 = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', true, new Date());
      const mockMenuItem2 = new MenuItem(2, 'PIZZA-001', 'Pizza Margherita', 18000, 'https://example.com/pizza.jpg', true, new Date());
      const mockOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockMenuItemRepository.findById
        .mockResolvedValueOnce(mockMenuItem1)
        .mockResolvedValueOnce(mockMenuItem2);
      
      // Mock complete order with items for final return
      const completeOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), [
        { id: 1, orderId: 1, menuItemId: 1, quantity: 2, price: 15000, getTotal: () => 30000 },
        { id: 2, orderId: 1, menuItemId: 2, quantity: 1, price: 18000, getTotal: () => 18000 }
      ] as any);
      mockOrderRepository.findById.mockResolvedValue(completeOrder);
      
      // When
      const result = await createOrderByQrCode.execute({ qrCode, items });
      
      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(mockOrderRepository.addOrderItem).toHaveBeenCalledTimes(2);
      expect(mockOrderRepository.addOrderItem).toHaveBeenNthCalledWith(1, 1, {
        menuItemId: 1,
        quantity: 2,
        price: 15000,
      });
      expect(mockOrderRepository.addOrderItem).toHaveBeenNthCalledWith(2, 1, {
        menuItemId: 2,
        quantity: 1,
        price: 18000,
      });
    });

    it('should handle single item order correctly', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockMenuItem = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', true, new Date());
      const mockOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockMenuItemRepository.findById.mockResolvedValue(mockMenuItem);
      
      const completeOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), [
        { id: 1, orderId: 1, menuItemId: 1, quantity: 1, price: 15000, getTotal: () => 15000 }
      ] as any);
      mockOrderRepository.findById.mockResolvedValue(completeOrder);
      
      // When
      const result = await createOrderByQrCode.execute({ qrCode, items });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(mockOrderRepository.addOrderItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when QR code is invalid', async () => {
      // Given
      const qrCode = '';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      mockTableRepository.findByQrCode.mockResolvedValue(null);
      
      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Mesa no encontrada');
    });

    it('should throw error when table not found', async () => {
      // Given
      const qrCode = 'INVALID_QR';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      mockTableRepository.findByQrCode.mockResolvedValue(null);
      
      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Mesa no encontrada');
    });

    it('should throw error when menu item not found', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [{ menuItemId: 999, quantity: 1 }];
      
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockMenuItemRepository.findById.mockResolvedValue(null);
      
      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Menu item with ID 999 not found');
    });

    it('should throw error when menu item is not available', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      const mockMenuItem = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', false, new Date());
      
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockMenuItemRepository.findById.mockResolvedValue(mockMenuItem);
      
      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Menu item Hamburguesa Clásica is not available');
    });

    it('should handle database connection errors gracefully', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      mockTableRepository.findByQrCode.mockRejectedValue(new Error('Database connection failed'));
      
      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('Business Logic Validation', () => {
    it('should create guest user if not exists', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockMenuItem = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', true, new Date());
      const mockOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValueOnce(null); // Guest user doesn't exist
      mockUserRepository.create.mockResolvedValue(mockUser); // Create guest user
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockMenuItemRepository.findById.mockResolvedValue(mockMenuItem);
      
      const completeOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      mockOrderRepository.findById.mockResolvedValue(completeOrder);
      
      // When
      const result = await createOrderByQrCode.execute({ qrCode, items });
      
      // Then
      expect(result).toBeDefined();
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'guest@restaurant.local',
        password: expect.any(String),
        role: RoleEnum.STAFF,
      });
    });

    it('should handle concurrent order creation', async () => {
      // Given
      const qrCode = 'QR123';
      const items = [{ menuItemId: 1, quantity: 1 }];
      
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockMenuItem = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', true, new Date());
      const mockOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockOrder);
      mockMenuItemRepository.findById.mockResolvedValue(mockMenuItem);
      
      const completeOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);
      mockOrderRepository.findById.mockResolvedValue(completeOrder);
      
      // When - Create multiple orders concurrently
      const promises = [
        createOrderByQrCode.execute({ qrCode, items }),
        createOrderByQrCode.execute({ qrCode, items }),
        createOrderByQrCode.execute({ qrCode, items })
      ];
      
      const results = await Promise.all(promises);
      
      // Then
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.status).toBe(OrderStatus.PENDING);
      });
    });
  });
});
