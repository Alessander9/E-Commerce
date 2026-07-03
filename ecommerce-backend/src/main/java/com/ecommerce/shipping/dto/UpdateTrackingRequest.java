package com.ecommerce.shipping.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrackingRequest {
    private String status;
    private String trackingCode;
    private String location;
    private String description;
}