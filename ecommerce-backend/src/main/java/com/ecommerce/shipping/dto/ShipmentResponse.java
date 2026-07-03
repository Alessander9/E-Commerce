package com.ecommerce.shipping.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private Integer zoneId;
    private String courier;
    private String deliveryService;
    private String trackingCode;
    private BigDecimal shippingCost;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
