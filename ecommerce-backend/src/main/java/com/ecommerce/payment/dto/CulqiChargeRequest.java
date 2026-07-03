package com.ecommerce.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulqiChargeRequest {
    private int amount;

    @JsonProperty("currency_code")
    private String currencyCode;

    private String email;

    @JsonProperty("source_id")
    private String sourceId;
}