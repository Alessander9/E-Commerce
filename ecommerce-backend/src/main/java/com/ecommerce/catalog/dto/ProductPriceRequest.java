package com.ecommerce.catalog.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceRequest {
    @NotNull
    private BigDecimal price;
    @NotNull
    private LocalDate startDate;
    private LocalDate endDate;
}