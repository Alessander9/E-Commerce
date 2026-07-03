package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.CulqiChargeRequest;
import com.ecommerce.payment.dto.CulqiChargeResponse;
import com.ecommerce.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class CulqiService {

    @Value("${app.culqi.secret-key}")
    private String secretKey;

    @Value("${app.culqi.base-url}")
    private String baseUrl;

    private final WebClient.Builder webClientBuilder;

    public CulqiChargeResponse createCharge(CulqiChargeRequest request) {
        return webClientBuilder.build()
            .post()
            .uri(baseUrl + "/charges")
            .header("Authorization", "Bearer " + secretKey)
            .header("Content-Type", "application/json")
            .bodyValue(request)
            .retrieve()
            .onStatus(HttpStatusCode::isError, response ->
                response.bodyToMono(String.class)
                    .map(body -> new BusinessException("Error Culqi: " + body))
            )
            .bodyToMono(CulqiChargeResponse.class)
            .block();
    }
}