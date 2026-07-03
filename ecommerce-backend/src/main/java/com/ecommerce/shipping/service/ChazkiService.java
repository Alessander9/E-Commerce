package com.ecommerce.shipping.service;

import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shipping.dto.ChazkiDeliveryRequest;
import com.ecommerce.shipping.dto.ChazkiDeliveryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChazkiService {

    @Value("${app.chazki.base-url}")
    private String baseUrl;

    @Value("${app.chazki.enterprise-key}")
    private String enterpriseKey;

    private final WebClient.Builder webClientBuilder;

    public List<ChazkiDeliveryResponse> createDelivery(List<ChazkiDeliveryRequest> requests) {
        try {
            return webClientBuilder.build()
                .post()
                .uri(baseUrl + "/create/delivery-service")
                .header("Enterprise-Key", enterpriseKey)
                .header("Content-Type", "application/json")
                .bodyValue(requests)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                    response.bodyToMono(String.class)
                        .flatMap(body -> Mono.error(new BusinessException("Error Chazki API: " + body)))
                )
                .bodyToFlux(ChazkiDeliveryResponse.class)
                .collectList()
                .block();
        } catch (Exception e) {
            throw new BusinessException("Error de comunicación con Chazki: " + e.getMessage());
        }
    }

    public ChazkiDeliveryResponse getDeliveryStatus(String serviceId) {
        try {
            return webClientBuilder.build()
                .get()
                .uri(baseUrl + "/status/record?id=" + serviceId)
                .header("Enterprise-Key", enterpriseKey)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                    response.bodyToMono(String.class)
                        .flatMap(body -> Mono.error(new BusinessException("Error consultando Chazki API: " + body)))
                )
                .bodyToMono(ChazkiDeliveryResponse.class)
                .block();
        } catch (Exception e) {
            throw new BusinessException("Error de comunicación al consultar Chazki: " + e.getMessage());
        }
    }
}
