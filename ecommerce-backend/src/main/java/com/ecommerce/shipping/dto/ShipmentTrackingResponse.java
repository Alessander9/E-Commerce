package com.ecommerce.shipping.dto;

import lombok.*;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTrackingResponse {
    private String status;
    private String location;
    private String description;
    private OffsetDateTime createdAt;
}