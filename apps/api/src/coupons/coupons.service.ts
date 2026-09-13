import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCoupon(tenantId: bigint, code: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: code.toUpperCase().trim(),
        },
      },
    });

    if (!coupon || !coupon.active) {
      throw new BadRequestException('El cupón no es válido o ha expirado');
    }

    if (new Date() > coupon.endDate) {
      throw new BadRequestException('El cupón ha caducado');
    }

    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`El monto mínimo de compra para este cupón es S/ ${coupon.minOrderAmount}`);
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('El cupón ha alcanzado el límite máximo de canjes');
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount && discount > Number(coupon.maxDiscountAmount)) {
        discount = Number(coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discount = Number(coupon.discountValue);
    }

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      calculatedDiscount: discount,
      message: '¡Cupón aplicado correctamente!',
    };
  }

  async getAdminCoupons(tenantId: bigint) {
    return this.prisma.coupon.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    });
  }

  async createCoupon(tenantId: bigint, data: {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    maxUses?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.coupon.create({
      data: {
        tenantId,
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        maxUses: data.maxUses,
        startDate: data.startDate || new Date(),
        endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        active: true,
      },
    });
  }
}
