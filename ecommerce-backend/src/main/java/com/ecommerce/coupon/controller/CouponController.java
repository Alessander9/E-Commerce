package com.ecommerce.coupon.controller;

import com.ecommerce.coupon.dto.ValidateCouponRequest;
import com.ecommerce.coupon.service.CouponService;
import com.ecommerce.security.entity.User;
import com.ecommerce.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<BigDecimal>> validate(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ValidateCouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
            couponService.validateAndCalculate(request.getCode(), user.getId(), request.getOrderAmount())
        ));
    }
}