import { AuthService } from './auth.service';

// ===================== MOCKS =====================

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockEmailService = {
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

const mockUser = {
  id: BigInt(1),
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
  firstName: 'Test',
  lastName: 'User',
  phone: '+51 999888777',
  active: true,
  userTenants: [
    {
      tenantId: BigInt(1),
      active: true,
      role: { name: 'TENANT_ADMIN', scope: 'TENANT' },
      tenant: { id: BigInt(1), name: 'Cleo', slug: 'cleo' },
    },
  ],
};

// ===================== TESTS =====================

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockPrisma as any, mockJwtService as any, mockEmailService as any);
  });

  // ===================== LOGIN =====================
  describe('login', () => {
    it('should return tokens and user data for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login(
        { email: 'test@example.com', password: 'password123' },
        BigInt(1),
      );

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.currentRole).toBe('TENANT_ADMIN');
      expect(result.user.currentTenant.slug).toBe('cleo');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@email.com', password: 'pass' }, BigInt(1)),
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }, BigInt(1)),
      ).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, active: false });

      await expect(
        service.login({ email: 'test@example.com', password: 'pass' }, BigInt(1)),
      ).rejects.toThrow('Credenciales inválidas o usuario inactivo');
    });

    it('should throw UnauthorizedException for user without password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, password: null });

      await expect(
        service.login({ email: 'test@example.com', password: 'pass' }, BigInt(1)),
      ).rejects.toThrow('Usuario sin contraseña registrada');
    });

    it('should select highest role when no tenant matches', async () => {
      const userWithMultipleRoles = {
        ...mockUser,
        userTenants: [
          {
            tenantId: BigInt(2),
            active: true,
            role: { name: 'CUSTOMER', scope: 'TENANT' },
            tenant: { id: BigInt(2), name: 'Other', slug: 'other' },
          },
          {
            tenantId: BigInt(3),
            active: true,
            role: { name: 'TENANT_ADMIN', scope: 'TENANT' },
            tenant: { id: BigInt(3), name: 'Admin', slug: 'admin' },
          },
        ],
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithMultipleRoles);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login(
        { email: 'test@example.com', password: 'pass' },
        BigInt(999), // Non-matching tenant
      );

      // Should select TENANT_ADMIN (higher priority)
      expect(result.user.currentRole).toBe('TENANT_ADMIN');
    });
  });

  // ===================== REGISTER =====================
  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue({ id: BigInt(4), name: 'CUSTOMER' });
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2a$10$hashed');
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        email: 'new@email.com',
        userTenants: [
          {
            tenantId: BigInt(1),
            role: { name: 'CUSTOMER', scope: 'TENANT' },
            tenant: { id: BigInt(1), name: 'Cleo', slug: 'cleo' },
          },
        ],
      });

      const result = await service.register(
        { email: 'new@email.com', password: 'pass123', firstName: 'New', lastName: 'User' },
        BigInt(1),
      );

      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException for existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register(
          { email: 'test@example.com', password: 'pass', firstName: 'A', lastName: 'B' },
          BigInt(1),
        ),
      ).rejects.toThrow('El correo electrónico ya está registrado');
    });

    it('should create CUSTOMER role if it does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(null);
      mockPrisma.role.create.mockResolvedValue({ id: BigInt(4), name: 'CUSTOMER' });
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2a$10$hashed');
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        userTenants: [{ tenantId: BigInt(1), role: { name: 'CUSTOMER' }, tenant: { slug: 'cleo' } }],
      });

      await service.register(
        { email: 'new@email.com', password: 'pass', firstName: 'N', lastName: 'U' },
        BigInt(1),
      );

      expect(mockPrisma.role.create).toHaveBeenCalled();
    });
  });

  // ===================== GET PROFILE =====================
  describe('getProfile', () => {
    it('should return user profile with memberships', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, addresses: [] });

      const result = await service.getProfile(BigInt(1), BigInt(1));

      expect(result.email).toBe('test@example.com');
      expect(result.memberships).toHaveLength(1);
      expect(result.currentRole).toBe('TENANT_ADMIN');
      expect(result.addresses).toEqual([]);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(BigInt(999), BigInt(1))).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('should determine correct role for tenant admin', async () => {
      const adminUser = {
        ...mockUser,
        userTenants: [
          {
            tenantId: BigInt(1),
            active: true,
            role: { name: 'TENANT_ADMIN', scope: 'TENANT' },
            tenant: { id: BigInt(1), name: 'Cleo', slug: 'cleo' },
          },
        ],
      };
      mockPrisma.user.findUnique.mockResolvedValue({ ...adminUser, addresses: [] });

      const result = await service.getProfile(BigInt(1), BigInt(1));

      expect(result.currentRole).toBe('TENANT_ADMIN');
    });
  });

  // ===================== FORGOT PASSWORD =====================
  describe('forgotPassword', () => {
    it('should always return success message for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('no@email.com');

      expect(result.message).toContain('Si el correo está registrado');
    });

    it('should generate reset token for existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await service.forgotPassword('test@example.com');

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: '1',
          email: 'test@example.com',
          purpose: 'password-reset',
        }),
        expect.objectContaining({ expiresIn: '1h' }),
      );
    });

    it('should not generate token for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await service.forgotPassword('inactive@email.com');

      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  // ===================== RESET PASSWORD =====================
  describe('resetPassword', () => {
    it('should update password with valid token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: '1',
        email: 'test@example.com',
        purpose: 'password-reset',
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('$2a$10$newhash');
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.resetPassword('valid-token', 'newPassword123');

      expect(result.message).toContain('actualizada exitosamente');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { password: '$2a$10$newhash' },
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt invalid');
      });

      await expect(service.resetPassword('bad-token', 'newPass')).rejects.toThrow(
        'Token inválido o expirado',
      );
    });

    it('should throw BadRequestException for non-reset token purpose', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: '1',
        purpose: 'different-purpose',
      });

      await expect(service.resetPassword('token', 'newPass')).rejects.toThrow(
        'Token inválido',
      );
    });

    it('should throw NotFoundException for inactive user', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: '999',
        purpose: 'password-reset',
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword('token', 'newPass')).rejects.toThrow(
        'Usuario no encontrado o inactivo',
      );
    });
  });
});
