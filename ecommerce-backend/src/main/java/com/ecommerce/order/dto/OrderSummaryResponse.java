package com.ecommerce.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSummaryResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal total;
    private OffsetDateTime createdAt;
}