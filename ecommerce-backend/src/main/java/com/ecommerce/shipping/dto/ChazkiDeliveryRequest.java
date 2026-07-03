package com.ecommerce.shipping.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChazkiDeliveryRequest {
    private String orderId;
    private String deliveryType;
    private Pickup pickup;
    private Destination destination;
    
    @JsonProperty("package")
    private Package pkg;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pickup {
        private String address;
        private String landmark;
        private String contactName;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Destination {
        private String address;
        private String landmark;
        private String contactName;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Package {
        private Double weight;
        private String description;
    }
}
