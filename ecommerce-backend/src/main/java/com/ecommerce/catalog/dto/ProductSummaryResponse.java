package com.ecommerce.catalog.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private BigDecimal price;
    private String primaryImageUrl;
}