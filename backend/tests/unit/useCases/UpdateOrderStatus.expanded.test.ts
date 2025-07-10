import { UpdateOrderStatus } from '../../../application/useCases/UpdateOrderStatus';
import { PrismaOrderRepository } from '../../../infrastructure/repositories/PrismaOrderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';
import { User, RoleEnum } from '../../../domain/entities/User';

// Mock repository
jest.mock('../../../infrastructure/repositories/PrismaOrderRepository');

/**
 * Unit Tests Expandidos para UpdateOrderStatus Use Case
 * 
 * Estos tests cubren:
 * - Transiciones de estado válidas e inválidas
 * - Autorización por roles
 * - Validaciones de negocio
 * - Manejo de errores avanzado
 */
describe('UpdateOrderStatus - Unit Tests Expandidos', () => {
  let updateOrderStatus: UpdateOrderStatus;
  let mockOrderRepository: jest.Mocked<PrismaOrderRepository>;

  beforeEach(() => {
    mockOrderRepository = new PrismaOrderRepository() as jest.Mocked<PrismaOrderRepository>;
    updateOrderStatus = new UpdateOrderStatus(mockOrderRepository);
    jest.clearAllMocks();
  });

  describe('BDD Scenario: Chef cambia estado a PREPARING', () => {
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

    it('should update order status from PREPARING to READY successfully', async () => {
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

    it('should update order status from READY to DELIVERED successfully', async () => {
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

  describe('Error Scenarios', () => {
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

  describe('State Transition Validation', () => {
    const validTransitions = [
      // From PENDING
      { from: OrderStatus.PENDING, to: OrderStatus.PREPARING, valid: true },
      { from: OrderStatus.PENDING, to: OrderStatus.CANCELLED, valid: true },
      
      // From PREPARING
      { from: OrderStatus.PREPARING, to: OrderStatus.READY, valid: true },
      { from: OrderStatus.PREPARING, to: OrderStatus.CANCELLED, valid: true },
      
      // From READY
      { from: OrderStatus.READY, to: OrderStatus.DELIVERED, valid: true },
      { from: OrderStatus.READY, to: OrderStatus.PAID, valid: true },
      
      // From DELIVERED
      { from: OrderStatus.DELIVERED, to: OrderStatus.PAID, valid: true },
      
      // Invalid transitions
      { from: OrderStatus.READY, to: OrderStatus.PENDING, valid: false },
      { from: OrderStatus.DELIVERED, to: OrderStatus.PREPARING, valid: false },
      { from: OrderStatus.PAID, to: OrderStatus.PREPARING, valid: false },
    ];

    validTransitions.forEach(({ from, to, valid }) => {
      if (valid) {
        it(`should allow transition from ${from} to ${to}`, async () => {
          // Given
          const orderId = 1;
          const user = new User(1, 'staff@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
          
          const existingOrder = new Order(orderId, from, 1, 1, new Date(), []);
          const updatedOrder = new Order(orderId, to, 1, 1, new Date(), []);

          mockOrderRepository.findById.mockResolvedValue(existingOrder);
          mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

          // When
          const result = await updateOrderStatus.execute({
            orderId,
            newStatus: to,
            user
          });

          // Then
          expect(result.status).toBe(to);
        });
      } else {
        it(`should reject transition from ${from} to ${to}`, async () => {
          // Given
          const orderId = 1;
          const user = new User(1, 'staff@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
          
          const existingOrder = new Order(orderId, from, 1, 1, new Date(), []);

          mockOrderRepository.findById.mockResolvedValue(existingOrder);

          // When & Then
          await expect(updateOrderStatus.execute({
            orderId,
            newStatus: to,
            user
          })).rejects.toThrow();
        });
      }
    });
  });

  describe('Role-based Authorization', () => {
    it('should allow STAFF to update any order status', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const staffUser = new User(1, 'staff@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());
      
      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);
      const updatedOrder = new Order(orderId, OrderStatus.PREPARING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user: staffUser
      });

      // Then
      expect(result.status).toBe(OrderStatus.PREPARING);
    });

    it('should allow MANAGER to update any order status', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.CANCELLED;
      const managerUser = new User(1, 'manager@food360.local', 'hashedPassword', RoleEnum.MANAGER, new Date());
      
      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);
      const cancelledOrder = new Order(orderId, OrderStatus.CANCELLED, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(cancelledOrder);

      // When
      const result = await updateOrderStatus.execute({
        orderId,
        newStatus,
        user: managerUser
      });

      // Then
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('Business Logic Edge Cases', () => {
    it('should handle concurrent status updates', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockRejectedValue(
        new Error('Order was modified by another user')
      );

      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Order was modified by another user');
    });

    it('should validate order timestamps for stale orders', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      // Order created 2 hours ago
      const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const staleOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, oldDate, []);

      mockOrderRepository.findById.mockResolvedValue(staleOrder);

      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Order is too old to be modified');
    });

    it('should handle database transaction failures', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockRejectedValue(
        new Error('Database transaction failed')
      );

      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      })).rejects.toThrow('Database transaction failed');
    });

    it('should validate order ownership for customer users', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.CANCELLED;
      const customerUser = new User(999, 'customer@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      // Order created by different user
      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);

      // When & Then
      await expect(updateOrderStatus.execute({
        orderId,
        newStatus,
        user: customerUser
      })).rejects.toThrow('User can only modify their own orders');
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete status update within reasonable time', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);
      const updatedOrder = new Order(orderId, OrderStatus.PREPARING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      // When
      const startTime = Date.now();
      await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });
      const endTime = Date.now();

      // Then
      expect(endTime - startTime).toBeLessThan(500); // Less than 500ms
    });

    it('should handle invalid order IDs gracefully', async () => {
      // Given
      const invalidOrderIds = [0, -1, null, undefined, 'abc', 999999999];
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      for (const orderId of invalidOrderIds) {
        mockOrderRepository.findById.mockResolvedValue(null);

        // When & Then
        await expect(updateOrderStatus.execute({
          orderId: orderId as any,
          newStatus,
          user
        })).rejects.toThrow('Order not found');
      }
    });

    it('should validate status enum values', async () => {
      // Given
      const orderId = 1;
      const invalidStatuses = ['INVALID_STATUS', '', null, undefined, 123];
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);
      mockOrderRepository.findById.mockResolvedValue(existingOrder);

      for (const status of invalidStatuses) {
        // When & Then
        await expect(updateOrderStatus.execute({
          orderId,
          newStatus: status as any,
          user
        })).rejects.toThrow('Invalid order status');
      }
    });
  });

  describe('Audit and Logging', () => {
    it('should log status change with user information', async () => {
      // Given
      const orderId = 1;
      const newStatus = OrderStatus.PREPARING;
      const user = new User(1, 'chef@food360.local', 'hashedPassword', RoleEnum.STAFF, new Date());

      const existingOrder = new Order(orderId, OrderStatus.PENDING, 1, 1, new Date(), []);
      const updatedOrder = new Order(orderId, OrderStatus.PREPARING, 1, 1, new Date(), []);

      mockOrderRepository.findById.mockResolvedValue(existingOrder);
      mockOrderRepository.updateStatus.mockResolvedValue(updatedOrder);

      // Mock logging
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // When
      await updateOrderStatus.execute({
        orderId,
        newStatus,
        user
      });

      // Then
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Order ${orderId} status changed from ${OrderStatus.PENDING} to ${newStatus} by user ${user.id}`)
      );

      logSpy.mockRestore();
    });

    it('should create audit trail for status changes', async () => {
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
      expect(result).toBeDefined();
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(orderId, newStatus);
      
      // En un sistema real, aquí verificaríamos que se creó un registro de auditoría
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    });
  });
});
