package com.ecommerce.coupon.service;

import com.ecommerce.coupon.entity.Coupon;
import com.ecommerce.coupon.entity.CouponRedemption;
import com.ecommerce.coupon.repository.CouponRedemptionRepository;
import com.ecommerce.coupon.repository.CouponRepository;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.coupon.dto.CouponRequest;
import com.ecommerce.coupon.dto.CouponResponse;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository redemptionRepository;

    public BigDecimal validateAndCalculate(String code, Long userId, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new BusinessException("Cupón inválido o inactivo"));

        LocalDate today = LocalDate.now();
        if (today.isBefore(coupon.getStartDate())) {
            throw new BusinessException("El cupón aún no está vigente");
        }
        if (coupon.getEndDate() != null && today.isAfter(coupon.getEndDate())) {
            throw new BusinessException("El cupón ha expirado");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            throw new BusinessException("El cupón ha alcanzado el límite de usos");
        }
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BusinessException(
                "El pedido mínimo para este cupón es S/ " + coupon.getMinOrderAmount());
        }
        if (redemptionRepository.existsByCouponIdAndUserId(coupon.getId(), userId)) {
            throw new BusinessException("Ya usaste este cupón anteriormente");
        }

        return "PERCENTAGE".equals(coupon.getDiscountType())
            ? orderAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100))
            : coupon.getDiscountValue();
    }

    public void redeem(String code, Long userId, Long orderId) {
        Coupon coupon = couponRepository.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new BusinessException("Cupón inválido o inactivo"));

        redemptionRepository.save(CouponRedemption.builder()
            .coupon(coupon)
            .userId(userId)
            .orderId(orderId)
            .build());

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    public List<CouponResponse> listAll() {
        return couponRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public CouponResponse create(CouponRequest request) {
        if (couponRepository.findByCodeAndActiveTrue(request.getCode()).isPresent()) {
            throw new BusinessException("El código de cupón ya está en uso");
        }

        Coupon coupon = Coupon.builder()
            .code(request.getCode().toUpperCase())
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .minOrderAmount(request.getMinOrderAmount())
            .maxUses(request.getMaxUses())
            .usedCount(0)
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .active(request.isActive())
            .build();

        couponRepository.save(coupon);
        return toResponse(coupon);
    }

    public CouponResponse update(Integer id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cupón no encontrado"));

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxUses(request.getMaxUses());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setActive(request.isActive());

        couponRepository.save(coupon);
        return toResponse(coupon);
    }

    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
            .id(coupon.getId())
            .code(coupon.getCode())
            .discountType(coupon.getDiscountType())
            .discountValue(coupon.getDiscountValue())
            .minOrderAmount(coupon.getMinOrderAmount())
            .maxUses(coupon.getMaxUses())
            .usedCount(coupon.getUsedCount())
            .startDate(coupon.getStartDate())
            .endDate(coupon.getEndDate())
            .active(coupon.isActive())
            .build();
    }
}