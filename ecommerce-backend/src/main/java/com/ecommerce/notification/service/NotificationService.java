package com.ecommerce.notification.service;

import com.ecommerce.notification.dto.NotificationEvent;
import com.ecommerce.notification.messaging.NotificationProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationProducer notificationProducer;

    public void sendWelcome(Long userId, String firstName) {
        send(userId, "WELCOME", "EMAIL", Map.of("firstName", firstName));
    }

    public void sendPasswordReset(Long userId, String firstName, String token, String expiresAt) {
        send(userId, "PASSWORD_RESET", "EMAIL", Map.of(
            "firstName", firstName,
            "token", token,
            "expiresAt", expiresAt
        ));
    }

    public void sendPaymentConfirmed(Long userId, String orderNumber, Object amount) {
        send(userId, "PAYMENT_CONFIRMED", "EMAIL", Map.of(
            "orderNumber", orderNumber,
            "amount", amount
        ));
    }

    public void sendOrderCreated(Long userId, String orderNumber, Object total) {
        send(userId, "ORDER_CREATED", "EMAIL", Map.of(
            "orderNumber", orderNumber,
            "total", total
        ));
    }

    public void send(Long userId, String type, String channel, Map<String, Object> payload) {
        notificationProducer.sendNotification(NotificationEvent.builder()
            .userId(userId)
            .type(type)
            .channel(channel)
            .payload(payload)
            .build());
    }
}
