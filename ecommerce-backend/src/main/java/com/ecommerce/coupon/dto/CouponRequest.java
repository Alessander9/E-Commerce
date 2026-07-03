package com.ecommerce.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String discountType;

    @NotNull
    private BigDecimal discountValue;

    @NotNull
    private BigDecimal minOrderAmount;

    private Integer maxUses;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private boolean active = true;
}
