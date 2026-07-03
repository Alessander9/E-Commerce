package com.ecommerce.notification.dto;

import lombok.*;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class NotificationEvent {
    private Long userId;
    private String type;        // ORDER_CREATED, PAYMENT_CONFIRMED, ORDER_SHIPPED...
    private String channel;     // EMAIL, SMS, PUSH
    private Map<String, Object> payload;
}