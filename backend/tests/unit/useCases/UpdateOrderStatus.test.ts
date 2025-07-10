import { UpdateOrderStatus } from '../../../application/useCases/UpdateOrderStatus';
import { PrismaOrderRepository } from '../../../infrastructure/repositories/PrismaOrderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { User, RoleEnum } from '../../../domain/entities/User';

// Mock repository
jest.mock('../../../infrastructure/repositories/PrismaOrderRepository');

describe('UpdateOrderStatus Use Case', () => {
  let updateOrderStatus: UpdateOrderStatus;
  let mockOrderRepository: jest.Mocked<PrismaOrderRepository>;

  beforeEach(() => {
    mockOrderRepository = new PrismaOrderRepository() as jest.Mocked<PrismaOrderRepository>;
    updateOrderStatus = new UpdateOrderStatus(mockOrderRepository);
  });

  describe('Scenario: Chef cambia estado a PREPARING', () => {
    it('should update order status from PENDING to PREPARING successfully', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);
      const updatedOrder = new Order(orderId, OrderStatus.PREPARING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });

      // Then
      expect(result.status).toBe(OrderStatus.PREPARING);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(orderId, newStatus);
    });

    it('should update order status from PREPARING to READY', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.READY;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const existingOrder = new Order(orderId, OrderStatus.PREPARING, 1, 1, new Date(), []);
      const updatedOrder = new Order(orderId, OrderStatus.READY, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });

      // Then
      expect(result.status).toBe(OrderStatus.READY);
    });

    it('should update order status from READY to DELIVERED', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.DELIVERED;
      const user = new User(1, 'waiter@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const existingOrder = new Order(orderId, OrderStatus.READY, 1, 1, new Date(), []);
      const updatedOrder = new Order(orderId, OrderStatus.DELIVERED, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });

      // Then
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe('Error scenarios', () => {
    it('should throw error when order not found', async () => {
      // Given
      const orderId = 999;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      mockOrderRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Order not found');

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to modify completed order', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const completedOrder = new Order(orderId, OrderStatus.DELIVERED, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(completedOrder);

      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Cannot modify a completed or cancelled order');

      expect(mockOrderRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to modify cancelled order', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const cancelledOrder = new Order(orderId, OrderStatus.CANCELLED, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(cancelledOrder);

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
      const user = new User(1, 'cashier@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const cancelledOrder = new Order(orderId, OrderStatus.CANCELLED, 1, 1, new Date(), []);
      const paidOrder = new Order(orderId, OrderStatus.PAID, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(cancelledOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(paidOrder);

      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });

      // Then
      expect(result.status).toBe(OrderStatus.PAID);
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(orderId, newStatus);
    });
  });

  describe('Business logic validation', () => {
    it('should validate status transition workflow', async () => {
      // Given - PENDING order
      const orderId = 1;
      const user = new User(1, 'staff@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      const pendingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(pendingOrder);

      // Test valid transitions from PENDING
      const validTransitions = [OrderStatus.PREPARING, OrderStatus.CANCELLED];
      
      for (const newStatus of validTransitions) {
        const updatedOrder = new Order(orderId, newStatus, 1, 1, new Date(), []);
        mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

        const result = await updateOrderStatus.execute({
          orderId,
          newStatus,
          user
        });

        expect(result.status).toBe(newStatus);
      }
    });
  });
});
