package com.ecommerce.shipping.controller;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.shared.response.ApiResponse;
import com.ecommerce.shipping.dto.ShippingRateCalculateRequest;
import com.ecommerce.shipping.entity.ShippingZone;
import com.ecommerce.shipping.service.ShippingService;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.repository.AddressRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;
    private final AddressRepository addressRepository;
    private final CartRepository cartRepository;

    @PostMapping("/rates/calculate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculate(
            @Valid @RequestBody ShippingRateCalculateRequest request) {
        Address address = addressRepository.findById(request.getAddressId())
            .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));
        Cart cart = cartRepository.findByUserIdOrThrow(address.getUser().getId());
        BigDecimal cost = shippingService.calculateCost(request.getAddressId(), cart.getItems());
        return ResponseEntity.ok(ApiResponse.success(cost));
    }

    @GetMapping("/zones")
    public ResponseEntity<ApiResponse<List<ShippingZone>>> getZones() {
        return ResponseEntity.ok(ApiResponse.success(shippingService.listZones()));
    }
}
