package com.ecommerce.coupon.repository;

import com.ecommerce.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    Optional<Coupon> findByCodeAndActiveTrue(String code);
}