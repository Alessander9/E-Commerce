package com.ecommerce.order.controller;

import com.ecommerce.order.dto.*;
import com.ecommerce.order.service.OrderService;
import com.ecommerce.shipping.dto.ShipmentTrackingResponse;
import com.ecommerce.shipping.service.ShippingService;
import com.ecommerce.security.entity.User;
import com.ecommerce.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ShippingService shippingService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success(orderService.createFromCart(user.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderSummaryResponse>>> list(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(orderService.listUserOrders(user.getId())));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getDetails(
            @AuthenticationPrincipal User user,
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderDetails(orderNumber, user.getId())));
    }

    @GetMapping("/{orderNumber}/tracking")
    public ResponseEntity<ApiResponse<List<ShipmentTrackingResponse>>> getTracking(
            @AuthenticationPrincipal User user,
            @PathVariable String orderNumber) {
        OrderResponse details = orderService.getOrderDetails(orderNumber, user.getId());
        return ResponseEntity.ok(ApiResponse.success(shippingService.getTracking(details.getId())));
    }
}