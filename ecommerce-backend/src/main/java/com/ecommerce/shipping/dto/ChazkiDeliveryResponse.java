package com.ecommerce.shipping.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChazkiDeliveryResponse {
    private String serviceId;
    private String orderId;
    private String status;
    private String message;
}
