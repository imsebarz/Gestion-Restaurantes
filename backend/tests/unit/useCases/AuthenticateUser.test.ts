import { AuthenticateUser } from '../../../application/useCases/UserAuthentication';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { User, RoleEnum } from '../../../domain/entities/User';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

// Mock repository
jest.mock('../../../infrastructure/repositories/PrismaUserRepository');

describe('AuthenticateUser Use Case', () => {
  let authenticateUser: AuthenticateUser;
  let mockUserRepository: jest.Mocked<PrismaUserRepository>;
  let mockBcrypt: jest.Mocked<typeof import('bcryptjs')>;

  beforeEach(() => {
    mockUserRepository = new PrismaUserRepository() as jest.Mocked<PrismaUserRepository>;
    authenticateUser = new AuthenticateUser(mockUserRepository);
    mockBcrypt = require('bcryptjs');
  });

  describe('Scenario: Login con credenciales válidas', () => {
    it('should authenticate user successfully with valid credentials', async () => {
      // Given
      const email = 'manager@food360.local';
      const password = 'manager';
      const hashedPassword = '$2a$10$hashedPassword';
      const mockUser = new User(1, email, hashedPassword, RoleEnum.MANAGER, new Date());

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // When
      const result = await authenticateUser.execute({ email, password });

      // Then
      expect(result).toBe(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return manager user with correct role', async () => {
      // Given
      const email = 'manager@food360.local';
      const password = 'manager';
      const mockUser = new User(1, email, 'hashedPassword', RoleEnum.MANAGER, new Date());

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // When
      const result = await authenticateUser.execute({ email, password });

      // Then
      expect(result.role).toBe(RoleEnum.MANAGER);
      expect(result.email).toBe(email);
    });

    it('should return staff user with correct role', async () => {
      // Given
      const email = 'staff@food360.local';
      const password = 'staff';
      const mockUser = new User(2, email, 'hashedPassword', RoleEnum.STAFF, new Date());

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // When
      const result = await authenticateUser.execute({ email, password });

      // Then
      expect(result.role).toBe(RoleEnum.STAFF);
      expect(result.email).toBe(email);
    });
  });

  describe('Scenario: Login con credenciales inválidas', () => {
    it('should throw error when user does not exist', async () => {
      // Given
      const email = 'nonexistent@food360.local';
      const password = 'password';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // When & Then
      await expect(authenticateUser.execute({ email, password }))
        .rejects.toThrow('Usuario no existe');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      // Given
      const email = 'manager@food360.local';
      const password = 'wrong-password';
      const mockUser = new User(1, email, 'hashedPassword', RoleEnum.MANAGER, new Date());

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // When & Then
      await expect(authenticateUser.execute({ email, password }))
        .rejects.toThrow('Contraseña inválida');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, 'hashedPassword');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty email', async () => {
      // Given
      const email = '';
      const password = 'password';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // When & Then
      await expect(authenticateUser.execute({ email, password }))
        .rejects.toThrow('Usuario no existe');
    });

    it('should handle empty password', async () => {
      // Given
      const email = 'manager@food360.local';
      const password = '';
      const mockUser = new User(1, email, 'hashedPassword', RoleEnum.MANAGER, new Date());

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // When & Then
      await expect(authenticateUser.execute({ email, password }))
        .rejects.toThrow('Contraseña inválida');
    });
  });
});
