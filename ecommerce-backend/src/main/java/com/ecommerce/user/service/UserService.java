package com.ecommerce.user.service;

import com.ecommerce.security.entity.User;
import com.ecommerce.security.entity.Role;
import com.ecommerce.security.repository.UserRepository;
import com.ecommerce.shared.exception.ResourceNotFoundException;
import com.ecommerce.user.dto.*;
import java.util.Set;
import com.ecommerce.user.entity.Address;
import com.ecommerce.user.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return UserProfileResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
            .build();
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        userRepository.save(user);
        return getProfile(userId);
    }

    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
            .map(this::toAddressResponse)
            .collect(Collectors.toList());
    }

    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (request.isDefault()) {
            resetDefaultAddresses(userId);
        }

        Address address = Address.builder()
            .user(user)
            .department(request.getDepartment())
            .province(request.getProvince())
            .district(request.getDistrict())
            .addressLine(request.getAddressLine())
            .reference(request.getReference())
            .isDefault(request.isDefault())
            .build();

        addressRepository.save(address);
        return toAddressResponse(address);
    }

    private void resetDefaultAddresses(Long userId) {
        List<Address> addresses = addressRepository.findByUserId(userId);
        for (Address addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }
    }
    private AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
            .id(address.getId())
            .department(address.getDepartment())
            .province(address.getProvince())
            .district(address.getDistrict())
            .addressLine(address.getAddressLine())
            .reference(address.getReference())
            .isDefault(address.isDefault())
            .build();
    }

    public List<UserAdminResponse> listAllUsers() {
        return userRepository.findAll().stream()
            .map(this::toAdminResponse)
            .collect(Collectors.toList());
    }

    public void toggleUserActive(Long userId, boolean active) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        user.setActive(active);
        userRepository.save(user);
    }

    private UserAdminResponse toAdminResponse(User user) {
        Set<String> roles = user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toSet());

        return UserAdminResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phone(user.getPhone())
            .active(user.isActive())
            .roles(roles)
            .build();
    }
}