import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { EmailService } from '../notifications/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto, tenantId?: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase() },
      include: {
        userTenants: {
          include: {
            role: true,
            tenant: true,
          },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    if (!user.password) {
      throw new UnauthorizedException('Usuario sin contraseña registrada');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Determine current tenant role
    const activeMemberships = user.userTenants.filter((ut) => ut.active);

    let currentMembership = activeMemberships.find(
      (ut) => tenantId && ut.tenantId === tenantId,
    );

    if (!currentMembership && activeMemberships.length > 0) {
      const rolePriority: Record<string, number> = {
        TENANT_ADMIN: 3,
        TENANT_MANAGER: 2,
        CUSTOMER: 1,
      };
      currentMembership = [...activeMemberships].sort(
        (a, b) => (rolePriority[b.role.name] || 0) - (rolePriority[a.role.name] || 0),
      )[0];
    }

    const currentRole = currentMembership
      ? currentMembership.role.name
      : 'CUSTOMER';

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userTenants.map((ut) => ({
        tenantId: ut.tenantId.toString(),
        tenantSlug: ut.tenant.slug,
        role: ut.role.name,
        scope: ut.role.scope,
      })),
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        currentRole,
        currentTenant: currentMembership
          ? {
              id: currentMembership.tenant.id.toString(),
              name: currentMembership.tenant.name,
              slug: currentMembership.tenant.slug,
            }
          : null,
        memberships: user.userTenants.map((ut) => ({
          tenantId: ut.tenantId.toString(),
          tenantName: ut.tenant.name,
          tenantSlug: ut.tenant.slug,
          role: ut.role.name,
        })),
      },
    };
  }

  async register(registerDto: RegisterDto, tenantId: bigint) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Find default CUSTOMER role
    let customerRole = await this.prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    if (!customerRole) {
      customerRole = await this.prisma.role.create({
        data: {
          name: 'CUSTOMER',
          scope: 'TENANT',
          description: 'Cliente final',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email.toLowerCase(),
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        active: true,
        userTenants: {
          create: {
            tenantId,
            roleId: customerRole.id,
          },
        },
      },
      include: {
        userTenants: {
          include: {
            role: true,
            tenant: true,
          },
        },
      },
    });

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userTenants.map((ut) => ({
        tenantId: ut.tenantId.toString(),
        tenantSlug: ut.tenant.slug,
        role: ut.role.name,
        scope: ut.role.scope,
      })),
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        currentRole: customerRole.name,
        currentTenant: {
          id: tenantId.toString(),
        },
      },
    };
  }

  async getProfile(userId: bigint, tenantId?: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        userTenants: {
          include: {
            role: true,
            tenant: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const activeMemberships = user.userTenants.filter((ut) => ut.active);

    let currentMembership = activeMemberships.find(
      (ut) => tenantId && ut.tenantId === tenantId,
    );

    if (!currentMembership && activeMemberships.length > 0) {
      const rolePriority: Record<string, number> = {
        TENANT_ADMIN: 3,
        TENANT_MANAGER: 2,
        CUSTOMER: 1,
      };
      currentMembership = [...activeMemberships].sort(
        (a, b) => (rolePriority[b.role.name] || 0) - (rolePriority[a.role.name] || 0),
      )[0];
    }

    const currentRole = currentMembership
      ? currentMembership.role.name
      : 'CUSTOMER';

    return {
      id: user.id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      currentRole,
      currentTenant: currentMembership
        ? {
            id: currentMembership.tenant.id.toString(),
            name: currentMembership.tenant.name,
            slug: currentMembership.tenant.slug,
          }
        : null,
      addresses: user.addresses,
      memberships: user.userTenants.map((ut) => ({
        tenantId: ut.tenantId.toString(),
        tenantName: ut.tenant.name,
        tenantSlug: ut.tenant.slug,
        role: ut.role.name,
      })),
    };
  }

  /**
   * Generate a password reset token and "send" it via email.
   *
   * Uses a short-lived JWT (expires in 1 hour) signed with a dedicated
   * reset secret so it cannot be used as an access token.
   *
   * In production, this would send the token via an email service.
   * For now, the token is logged to the console for development.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.active) {
      return {
        message:
          'Si el correo está registrado, recibirás un enlace de recuperación.',
      };
    }

    // Generate a reset token (short-lived JWT)
    const resetToken = this.jwtService.sign(
      {
        sub: user.id.toString(),
        email: user.email,
        purpose: 'password-reset',
      },
      {
        expiresIn: '1h',
        secret:
          process.env.JWT_RESET_SECRET ||
          'cleo-platform-password-reset-secret-2026',
      },
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordReset(user.email, {
        firstName: user.firstName,
        resetToken,
      });
    } catch (emailError) {
      // Log but don't fail — token is still valid
      console.error('Failed to send reset email:', emailError.message);
    }

    return {
      message:
        'Si el correo está registrado, recibirás un enlace de recuperación.',
    };
  }

  /**
   * Reset the user's password using a valid reset token.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    let payload: any;

    try {
      payload = this.jwtService.verify(token, {
        secret:
          process.env.JWT_RESET_SECRET ||
          'cleo-platform-password-reset-secret-2026',
      });
    } catch {
      throw new BadRequestException(
        'Token inválido o expirado. Solicita un nuevo enlace de recuperación.',
      );
    }

    // Verify the token is for password reset
    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException('Token inválido');
    }

    const userId = BigInt(payload.sub);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.active) {
      throw new NotFoundException('Usuario no encontrado o inactivo');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Contraseña actualizada exitosamente.',
    };
  }
}
