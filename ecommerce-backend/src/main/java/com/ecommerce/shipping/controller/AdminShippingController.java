package com.ecommerce.shipping.controller;

import com.ecommerce.shared.response.ApiResponse;
import com.ecommerce.shipping.dto.ShipmentResponse;
import com.ecommerce.shipping.dto.UpdateTrackingRequest;
import com.ecommerce.shipping.service.ShippingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/shipments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminShippingController {

    private final ShippingService shippingService;

    @PostMapping("/{orderId}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> create(
            @PathVariable Long orderId,
            @RequestParam(required = false) String courier,
            @RequestParam(required = false) String deliveryService,
            @RequestParam(required = false) String trackingCode) {
        return ResponseEntity.ok(ApiResponse.success(shippingService.createShipment(orderId, courier, deliveryService, trackingCode)));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(shippingService.getByOrderId(orderId)));
    }

    @PatchMapping("/{id}/tracking")
    public ResponseEntity<ApiResponse<Void>> addTrackingEvent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTrackingRequest request) {
        shippingService.addTrackingEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
