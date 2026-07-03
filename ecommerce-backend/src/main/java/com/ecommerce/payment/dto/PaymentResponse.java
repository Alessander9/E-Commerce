package com.ecommerce.payment.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String transactionId;
    private BigDecimal amount;
    private String status;
    private OffsetDateTime paidAt;
}