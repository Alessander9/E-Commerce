import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        process.env.JWT_SECRET ||
        'cleo-platform-super-secure-jwt-secret-key-2026';

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(payload.sub) },
        include: {
          userTenants: {
            where: { active: true },
            include: {
              role: true,
              tenant: true,
            },
          },
        },
      });

      if (!user || !user.active || user.deletedAt !== null) {
        throw new UnauthorizedException('User account is inactive or deleted');
      }

      request.user = user;
      request.jwtPayload = payload;
      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }
}
