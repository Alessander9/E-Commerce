package com.ecommerce.shipping.controller;

import com.ecommerce.shared.response.ApiResponse;
import com.ecommerce.shipping.dto.UpdateTrackingRequest;
import com.ecommerce.shipping.entity.Shipment;
import com.ecommerce.shipping.repository.ShipmentRepository;
import com.ecommerce.shipping.service.ShippingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/shipping/webhooks/chazki")
@RequiredArgsConstructor
public class ChazkiWebhookController {

    private final ShippingService shippingService;
    private final ShipmentRepository shipmentRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> handleWebhook(@RequestBody ChazkiWebhookPayload payload) {
        Shipment shipment = shipmentRepository.findByTrackingCode(payload.getServiceId())
            .orElseThrow(() -> new com.ecommerce.shared.exception.ResourceNotFoundException("Envío no encontrado para serviceId: " + payload.getServiceId()));

        String mappedStatus = mapChazkiStatus(payload.getStatus());

        UpdateTrackingRequest request = new UpdateTrackingRequest(
            mappedStatus,
            payload.getServiceId(),
            payload.getLocation(),
            payload.getReason() != null ? payload.getReason() : "Actualización de estado de Chazki: " + payload.getStatus()
        );

        shippingService.addTrackingEvent(shipment.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private String mapChazkiStatus(String chazkiStatus) {
        if (chazkiStatus == null) return "PENDING";
        return switch (chazkiStatus.toUpperCase()) {
            case "NEW", "PRE_OFFERED", "OFFERED", "REPROGRAMMED" -> "PENDING";
            case "WAITING", "ARRIVED" -> "HANDED_TO_COURIER";
            case "IN_PROGRESS" -> "IN_TRANSIT";
            case "COMPLETED" -> "DELIVERED";
            case "FAILED", "FAILED_PICK" -> "FAILED";
            default -> "PENDING";
        };
    }

    @Data
    public static class ChazkiWebhookPayload {
        private String serviceId;
        private String orderId;
        private String status;
        private String location;
        private String reason;
    }
}
