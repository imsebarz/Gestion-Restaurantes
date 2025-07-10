import { CreateOrderByQrCode } from '../../../application/useCases/CreateOrderByQrCode';
import { PrismaOrderRepository } from '../../../infrastructure/repositories/PrismaOrderRepository';
import { PrismaTableRepository } from '../../../infrastructure/repositories/PrismaTableRepository';
import { PrismaMenuItemRepository } from '../../../infrastructure/repositories/PrismaMenuItemRepository';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { Table } from '../../../domain/entities/Table';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { User, RoleEnum } from '../../../domain/entities/User';

// Mock repositories
jest.mock('../../../infrastructure/repositories/PrismaOrderRepository');
jest.mock('../../../infrastructure/repositories/PrismaTableRepository');
jest.mock('../../../infrastructure/repositories/PrismaMenuItemRepository');
jest.mock('../../../infrastructure/repositories/PrismaUserRepository');

describe('CreateOrderByQrCode Use Case', () => {
  let createOrderByQrCode: CreateOrderByQrCode;
  let mockOrderRepository: jest.Mocked<PrismaOrderRepository>;
  let mockTableRepository: jest.Mocked<PrismaTableRepository>;
  let mockMenuItemRepository: jest.Mocked<PrismaMenuItemRepository>;
  let mockUserRepository: jest.Mocked<PrismaUserRepository>;

  beforeEach(() => {
    mockOrderRepository = new PrismaOrderRepository() as jest.Mocked<PrismaOrderRepository>;
    mockTableRepository = new PrismaTableRepository() as jest.Mocked<PrismaTableRepository>;
    mockMenuItemRepository = new PrismaMenuItemRepository() as jest.Mocked<PrismaMenuItemRepository>;
    mockUserRepository = new PrismaUserRepository() as jest.Mocked<PrismaUserRepository>;

    createOrderByQrCode = new CreateOrderByQrCode(
      mockOrderRepository,
      mockTableRepository,
      mockMenuItemRepository,
      mockUserRepository
    );
  });

  describe('Scenario: Cliente crea un pedido desde QR', () => {
    it('should create order successfully with valid QR code and items', async () => {
      // Given - Setup test data
      const qrCode = 'table-7-123456789';
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockMenuItem1 = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', true, new Date());
      const mockMenuItem2 = new MenuItem(2, 'PIZZA-001', 'Pizza Margherita', 18000, 'https://example.com/pizza.jpg', true, new Date());

      const items = [
        { menuItemId: 1, quantity: 2 },
        { menuItemId: 2, quantity: 1 }
      ];

      const mockCreatedOrder = new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []);

      // Mock repository responses
      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(mockCreatedOrder);
      mockMenuItemRepository.findById
        .mockResolvedValueOnce(mockMenuItem1)
        .mockResolvedValueOnce(mockMenuItem2);
      mockOrderRepository.addOrderItem.mockResolvedValue({} as any);
      mockOrderRepository.findById.mockResolvedValue(mockCreatedOrder);

      // When - Execute the use case
      const result = await createOrderByQrCode.execute({
        qrCode,
        items
      });

      // Then - Verify results
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(mockTableRepository.findByQrCode).toHaveBeenCalledWith(qrCode);
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        status: OrderStatus.PENDING,
        tableId: mockTable.id,
        userId: mockUser.id,
      });
      expect(mockMenuItemRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockOrderRepository.addOrderItem).toHaveBeenCalledTimes(2);
    });

    it('should throw error when table not found', async () => {
      // Given
      const qrCode = 'invalid-qr-code';
      const items = [{ menuItemId: 1, quantity: 1 }];

      mockTableRepository.findByQrCode.mockResolvedValue(null);

      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Mesa no encontrada');
    });

    it('should throw error when menu item not found', async () => {
      // Given
      const qrCode = 'table-7-123456789';
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const items = [{ menuItemId: 999, quantity: 1 }];

      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []));
      mockMenuItemRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Menu item with ID 999 not found');
    });

    it('should throw error when menu item is not available', async () => {
      // Given
      const qrCode = 'table-7-123456789';
      const mockTable = new Table(7, 7, 4, qrCode);
      const mockUser = new User(1, 'guest@restaurant.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const unavailableMenuItem = new MenuItem(1, 'BURGER-001', 'Hamburguesa Clásica', 15000, 'https://example.com/burger.jpg', false, new Date());
      const items = [{ menuItemId: 1, quantity: 1 }];

      mockTableRepository.findByQrCode.mockResolvedValue(mockTable);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockOrderRepository.create.mockResolvedValue(new Order(1, OrderStatus.PENDING, 7, 1, new Date(), []));
      mockMenuItemRepository.findById.mockResolvedValue(unavailableMenuItem);

      // When & Then
      await expect(createOrderByQrCode.execute({ qrCode, items }))
        .rejects.toThrow('Menu item Hamburguesa Clásica is not available');
    });
  });
});
