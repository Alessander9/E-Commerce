package com.ecommerce.shipping.service;

import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.security.entity.User;
import com.ecommerce.security.repository.UserRepository;
import com.ecommerce.shared.exception.BusinessException;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.shipping.dto.*;
import com.ecommerce.shipping.entity.*;
import com.ecommerce.shipping.repository.*;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.repository.AddressRepository;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderShippingAddress;
import com.ecommerce.order.repository.OrderRepository;
import com.ecommerce.order.repository.OrderShippingAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingZoneRepository zoneRepository;
    private final ShippingRateRepository rateRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository trackingRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderShippingAddressRepository orderShippingAddressRepository;
    private final UserRepository userRepository;
    private final ChazkiService chazkiService;

    @Value("${app.chazki.pickup-address:Av. Principal 123, Surquillo, Lima}")
    private String pickupAddress;

    @Value("${app.chazki.pickup-landmark:Frente al parque principal}")
    private String pickupLandmark;

    @Value("${app.chazki.pickup-contact:Valle Natural Almacén}")
    private String pickupContact;

    @Value("${app.chazki.pickup-phone:999888777}")
    private String pickupPhone;

    public BigDecimal calculateCost(Long addressId, List<CartItem> items) {
        Address address = addressRepository.findById(addressId)
            .orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));

        // Intentar buscar zona por distrito, provincia o departamento
        ShippingZone zone = zoneRepository.findByDistrict(address.getDistrict())
            .orElseGet(() -> zoneRepository.findByDistrict(address.getProvince())
                .orElseGet(() -> zoneRepository.findByDistrict(address.getDepartment())
                    .orElse(null)));

        if (zone == null) {
            // Tarifa plana por defecto si no se encuentra zona preconfigurada
            return BigDecimal.valueOf(15.0);
        }

        BigDecimal totalWeight = items.stream()
            .map(item -> item.getProduct().getWeight() != null ? item.getProduct().getWeight()
                .multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return rateRepository
            .findByZoneIdAndWeightRange(zone.getId(), totalWeight)
            .map(ShippingRate::getPrice)
            .orElse(BigDecimal.valueOf(15.0)); // Tarifa plana por defecto si no hay rango para el peso
    }

    @Transactional
    public void addTrackingEvent(Long shipmentId, UpdateTrackingRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado"));

        shipment.setStatus(request.getStatus());
        if (request.getTrackingCode() != null) {
            shipment.setTrackingCode(request.getTrackingCode());
        }
        shipmentRepository.save(shipment);

        trackingRepository.save(ShipmentTracking.builder()
            .shipment(shipment)
            .status(request.getStatus())
            .location(request.getLocation())
            .description(request.getDescription())
            .build());
    }

    public List<ShipmentTrackingResponse> getTracking(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado"));

        return trackingRepository.findByShipmentIdOrderByCreatedAtAsc(shipment.getId())
            .stream()
            .map(t -> ShipmentTrackingResponse.builder()
                .status(t.getStatus())
                .location(t.getLocation())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }

    public ShipmentResponse getByOrderId(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Envío no encontrado para el pedido " + orderId));
        return toShipmentResponse(shipment);
    }

    public List<ShippingZone> listZones() {
        return zoneRepository.findAll();
    }

    @Transactional
    public ShipmentResponse createShipment(Long orderId, String courier, String trackingCode) {
        return createShipment(orderId, courier, "REGULAR", trackingCode);
    }

    @Transactional
    public ShipmentResponse createShipment(Long orderId, String courier, String deliveryService, String trackingCode) {
        if (shipmentRepository.findByOrderId(orderId).isPresent()) {
            throw new BusinessException("Ya existe un envío para este pedido");
        }

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        OrderShippingAddress shippingAddress = orderShippingAddressRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Dirección de envío no encontrada"));

        String resolvedCourier = courier != null && !courier.trim().isEmpty() ? courier.toUpperCase() : "CHAZKI";
        String resolvedService = deliveryService != null && !deliveryService.trim().isEmpty() ? deliveryService.toUpperCase() : "REGULAR";
        String finalTrackingCode = trackingCode;

        ShippingZone zone = zoneRepository.findByDistrict(shippingAddress.getDistrict())
            .orElseGet(() -> zoneRepository.findByDistrict(shippingAddress.getProvince())
                .orElseGet(() -> zoneRepository.findByDistrict(shippingAddress.getDepartment())
                    .orElse(null)));

        if ("CHAZKI".equals(resolvedCourier)) {
            User user = userRepository.findById(order.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

            BigDecimal totalWeight = order.getItems().stream()
                .map(item -> item.getProduct() != null && item.getProduct().getWeight() != null ?
                    item.getProduct().getWeight().multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            String packageDescription = order.getItems().stream()
                .map(item -> item.getQuantity() + "x " + item.getProductName())
                .collect(Collectors.joining(", "));

            ChazkiDeliveryRequest.Pickup pickup = ChazkiDeliveryRequest.Pickup.builder()
                .address(pickupAddress)
                .landmark(pickupLandmark)
                .contactName(pickupContact)
                .phone(pickupPhone)
                .build();

            ChazkiDeliveryRequest.Destination destination = ChazkiDeliveryRequest.Destination.builder()
                .address(shippingAddress.getAddressLine() + ", " + shippingAddress.getDistrict() + ", " + shippingAddress.getProvince() + ", " + shippingAddress.getDepartment())
                .landmark(shippingAddress.getReference())
                .contactName(user.getFirstName() + " " + user.getLastName())
                .phone(user.getPhone() != null ? user.getPhone() : "999999999")
                .build();

            ChazkiDeliveryRequest.Package pkg = ChazkiDeliveryRequest.Package.builder()
                .weight(totalWeight.doubleValue())
                .description(packageDescription)
                .build();

            ChazkiDeliveryRequest chazkiReq = ChazkiDeliveryRequest.builder()
                .orderId(order.getOrderNumber())
                .deliveryType(resolvedService)
                .pickup(pickup)
                .destination(destination)
                .pkg(pkg)
                .build();

            List<ChazkiDeliveryResponse> responses = chazkiService.createDelivery(List.of(chazkiReq));
            if (responses != null && !responses.isEmpty()) {
                finalTrackingCode = responses.get(0).getServiceId();
            } else {
                throw new BusinessException("La API de Chazki no devolvió una respuesta válida.");
            }
        }

        Shipment shipment = Shipment.builder()
            .orderId(orderId)
            .courier(resolvedCourier)
            .deliveryService(resolvedService)
            .trackingCode(finalTrackingCode)
            .zoneId(zone != null ? zone.getId() : null)
            .shippingCost(order.getShippingCost())
            .status("PENDING")
            .build();

        shipmentRepository.save(shipment);

        trackingRepository.save(ShipmentTracking.builder()
            .shipment(shipment)
            .status("PENDING")
            .location(shippingAddress.getDistrict())
            .description("Envío registrado y enviado a Chazki (" + resolvedService + ")")
            .build());

        return toShipmentResponse(shipment);
    }

    private ShipmentResponse toShipmentResponse(Shipment s) {
        return ShipmentResponse.builder()
            .id(s.getId())
            .orderId(s.getOrderId())
            .zoneId(s.getZoneId())
            .courier(s.getCourier())
            .deliveryService(s.getDeliveryService())
            .trackingCode(s.getTrackingCode())
            .shippingCost(s.getShippingCost())
            .status(s.getStatus())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}