import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth & Sessions')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) // 10 attempts per minute
  @UseGuards(TenantGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada con éxito y JWT retornado' })
  async login(@Body() loginDto: LoginDto, @CurrentTenant() tenant: any) {
    return this.authService.login(loginDto, tenant?.id);
  }

  @Post('register')
  @UseGuards(TenantGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo cliente en el tenant actual' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  async register(@Body() registerDto: RegisterDto, @CurrentTenant() tenant: any) {
    return this.authService.register(registerDto, tenant.id);
  }

  @Get('profile')
  @UseGuards(AuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener datos y membresías del usuario autenticado' })
  async getProfile(@CurrentUser() user: any, @CurrentTenant() tenant: any) {
    return this.authService.getProfile(user.id, tenant?.id);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 300_000 } }) // 5 attempts per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar enlace de recuperación de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Si el correo está registrado, se envía un enlace de recuperación',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 300_000 } }) // 5 attempts per 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token de recuperación' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
