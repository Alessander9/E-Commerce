package com.ecommerce.shipping.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingRateCalculateRequest {
    @NotNull
    private Long addressId;
}