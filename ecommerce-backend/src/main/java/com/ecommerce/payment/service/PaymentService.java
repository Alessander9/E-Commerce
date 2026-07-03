package com.ecommerce.payment.service;

import com.ecommerce.audit.service.AuditLogService;
import com.ecommerce.notification.dto.NotificationEvent;
import com.ecommerce.notification.messaging.NotificationProducer;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.order.dto.UpdateOrderStatusRequest;
import com.ecommerce.payment.dto.*;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import com.ecommerce.security.entity.User;
import com.ecommerce.security.repository.UserRepository;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.shared.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CulqiService culqiService;
    private final OrderService orderService;
    private final NotificationProducer notificationProducer;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public PaymentResponse processPayment(Long userId, CreatePaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!order.getUserId().equals(userId)) {
            throw new UnauthorizedException("No autorizado para pagar este pedido");
        }

        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("El pedido no está en estado pendiente");
        }

        CulqiChargeRequest culqiRequest = CulqiChargeRequest.builder()
            .amount(order.getTotal().multiply(BigDecimal.valueOf(100)).intValue())
            .currencyCode("PEN")
            .email(userRepository.findById(userId).map(User::getEmail).orElse(""))
            .sourceId(request.getCulqiToken())
            .build();

        Payment payment = Payment.builder()
            .order(order)
            .provider("CULQI")
            .amount(order.getTotal())
            .currency("PEN")
            .status("PENDING")
            .transactionId("PENDING-" + order.getOrderNumber())
            .build();

        try {
            CulqiChargeResponse culqiResponse = culqiService.createCharge(culqiRequest);

            payment.setTransactionId(culqiResponse.getId());
            payment.setStatus("PAID");
            payment.setPaidAt(OffsetDateTime.now());
            payment.setMetadata(objectMapper.valueToTree(culqiResponse));

            paymentRepository.save(payment);

            orderService.updateStatus(order.getId(), null,
                new UpdateOrderStatusRequest("PAID", "Pago confirmado por Culqi"));

            notificationProducer.sendNotification(NotificationEvent.builder()
                .userId(userId)
                .type("PAYMENT_CONFIRMED")
                .channel("EMAIL")
                .payload(Map.of(
                    "orderNumber", order.getOrderNumber(),
                    "amount", order.getTotal()))
                .build());

            auditLogService.log(userId, "PAYMENT_CONFIRMED", "payments", payment.getId(),
                null, Map.of("transactionId", payment.getTransactionId()));

        } catch (BusinessException ex) {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            auditLogService.log(userId, "PAYMENT_FAILED", "payments", order.getId(),
                null, Map.of("error", ex.getMessage()));
            throw ex;
        }

        return PaymentResponse.builder()
            .id(payment.getId())
            .orderId(order.getId())
            .transactionId(payment.getTransactionId())
            .amount(payment.getAmount())
            .status(payment.getStatus())
            .paidAt(payment.getPaidAt())
            .build();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByOrderId(Long userId, Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        if (!payment.getOrder().getUserId().equals(userId)) {
            throw new UnauthorizedException("No autorizado para consultar este pago");
        }

        return PaymentResponse.builder()
            .id(payment.getId())
            .orderId(payment.getOrder().getId())
            .transactionId(payment.getTransactionId())
            .amount(payment.getAmount())
            .status(payment.getStatus())
            .paidAt(payment.getPaidAt())
            .build();
    }
}
