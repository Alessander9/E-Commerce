package com.ecommerce.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CulqiChargeResponse {
    private String id;
    private String object;
    private String status;

    @JsonProperty("creation_date")
    private Long creationDate;
}