package com.ecommerce.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
    @NotBlank
    private String code;
    @NotNull
    private BigDecimal orderAmount;
}