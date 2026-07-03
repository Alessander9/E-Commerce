package com.ecommerce.notification.messaging;

import com.ecommerce.config.RabbitMQConfig;
import com.ecommerce.notification.dto.NotificationEvent;
import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.repository.NotificationRepository;
import com.ecommerce.notification.service.EmailService;
import com.ecommerce.security.entity.User;
import com.ecommerce.security.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void consume(NotificationEvent event) {
        Notification notification = Notification.builder()
            .userId(event.getUserId())
            .type(event.getType())
            .payload(objectMapper.valueToTree(event.getPayload()))
            .status("PENDING")
            .channel(event.getChannel())
            .build();

        notificationRepository.save(notification);

        try {
            if ("EMAIL".equals(event.getChannel())) {
                User user = userRepository.findById(event.getUserId()).orElseThrow();
                emailService.send(user.getEmail(), event.getType(), event.getPayload());
            }

            notification.setStatus("SENT");
            notification.setSentAt(OffsetDateTime.now());

        } catch (Exception ex) {
            log.error("Error enviando notificación tipo {}: {}", event.getType(), ex.getMessage());
            notification.setStatus("FAILED");
        }

        notificationRepository.save(notification);
    }
}