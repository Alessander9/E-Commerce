package com.ecommerce.coupon.repository;

import com.ecommerce.coupon.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {
    boolean existsByCouponIdAndUserId(Integer couponId, Long userId);
}