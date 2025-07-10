import { UpdateOrderStatus } from '../../../application/useCases/UpdateOrderStatus';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { User, RoleEnum } from '../../../domain/entities/User';
import { IOrderRepository } from '../../../application/interfaces/IOrderRepository';

// Mock repository
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

describe('UpdateOrderStatus - Corrected Unit Tests', () => {
  let updateOrderStatus: UpdateOrderStatus;
  
  beforeEach(() => {
    jest.clearAllMocks();
    updateOrderStatus = new UpdateOrderStatus(mockOrderRepository);
  });

  describe('Core Functionality', () => {
    it('should update order status from PENDING to PREPARING successfully', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PENDING, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.PREPARING);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
    });

    it('should update order status from PREPARING to READY successfully', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.READY;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PREPARING, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.READY);
    });

    it('should update order status from READY to DELIVERED successfully', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.DELIVERED;
      const user = new User(1, 'waiter@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.READY, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when order not found', async () => {
      // Given
      const orderId = 999;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      mockOrderRepository.findById.mockResolvedValue(null);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Pedido no encontrado');
      
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateOrderStatus).not.toHaveBeenCalled();
    });

    it('should throw error when user has no permission', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'customer@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      // Mock canManageOrders to return false for this test
      jest.spyOn(user, 'canManageOrders').mockReturnValue(false);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('No tienes permisos para actualizar pedidos');
      
      expect(mockOrderRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when trying to modify completed order', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PAID, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Cannot modify a completed or cancelled order');
    });

    it('should throw error when trying to modify cancelled order', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.CANCELLED, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Cannot modify a completed or cancelled order');
    });

    it('should allow marking cancelled order as PAID', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PAID;
      const user = new User(1, 'cashier@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.CANCELLED, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.PAID);
      expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith(orderId, newStatus);
    });
  });

  describe('State Transitions', () => {
    const validTransitions = [
      { from: OrderStatus.PENDING, to: OrderStatus.PREPARING },
      { from: OrderStatus.PENDING, to: OrderStatus.CANCELLED },
      { from: OrderStatus.PREPARING, to: OrderStatus.READY },
      { from: OrderStatus.PREPARING, to: OrderStatus.CANCELLED },
      { from: OrderStatus.READY, to: OrderStatus.DELIVERED },
      { from: OrderStatus.READY, to: OrderStatus.PAID },
      { from: OrderStatus.DELIVERED, to: OrderStatus.PAID },
    ];

    validTransitions.forEach(({ from, to }) => {
      it(`should allow transition from ${from} to ${to}`, async () => {
        // Given
        const orderId = 1;
        const user = new User(1, 'staff@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
        const mockOrder = new Order(orderId, from, 7, 1, new Date(), []);
        const updatedOrder = new Order(orderId, to, 7, 1, new Date(), []);
        
        mockOrderRepository.findById.mockResolvedValue(mockOrder);
        mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
        
        // When
        const result = await updateOrderStatus.execute({
          orderId,
          newStatus: to,
          user
        });
        
        // Then
        expect(result).toBeDefined();
        expect(result.status).toBe(to);
      });
    });

    it('should reject invalid transition from DELIVERED to PREPARING', async () => {
      // Given
      const orderId = 1;
      const user = new User(1, 'staff@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.DELIVERED, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus: OrderStatus.PREPARING,
        user
      })).rejects.toThrow('Cannot modify a completed or cancelled order');
    });

    it('should reject invalid transition from PAID to PREPARING', async () => {
      // Given
      const orderId = 1;
      const user = new User(1, 'staff@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PAID, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus: OrderStatus.PREPARING,
        user
      })).rejects.toThrow('Cannot modify a completed or cancelled order');
    });
  });

  describe('Role-based Authorization', () => {
    it('should allow STAFF to update order status', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'staff@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PENDING, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.PREPARING);
    });

    it('should allow MANAGER to update order status', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.CANCELLED;
      const user = new User(1, 'manager@restaurant.com', 'hashedPassword', RoleEnum.MANAGER, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PENDING, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      
      // Then
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should reject CUSTOMER trying to update order status', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'customer@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      // Mock canManageOrders to return false for this test
      jest.spyOn(user, 'canManageOrders').mockReturnValue(false);
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('No tienes permisos para actualizar pedidos');
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete status update within reasonable time', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      const mockOrder = new Order(orderId, OrderStatus.PENDING, 7, 1, new Date(), []);
      const updatedOrder = new Order(orderId, newStatus, 7, 1, new Date(), []);
      
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateOrderStatus.mockResolvedValue(updatedOrder);
      
      // When
      const startTime = Date.now();
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      const endTime = Date.now();
      
      // Then
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle database connection errors gracefully', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@restaurant.com', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      mockOrderRepository.findById.mockRejectedValue(new Error('Database connection failed'));
      
      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Database connection failed');
    });
  });
});
