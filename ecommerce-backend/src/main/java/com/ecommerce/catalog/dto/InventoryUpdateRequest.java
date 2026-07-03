package com.ecommerce.catalog.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdateRequest {
    @Min(0)
    private int availableStock;
}