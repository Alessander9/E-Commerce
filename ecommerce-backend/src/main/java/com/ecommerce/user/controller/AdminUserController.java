package com.ecommerce.user.controller;

import com.ecommerce.shared.response.ApiResponse;
import com.ecommerce.user.dto.UserAdminResponse;
import com.ecommerce.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserAdminResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.listAllUsers()));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<Void>> toggleActive(
            @PathVariable Long id,
            @RequestParam boolean active) {
        userService.toggleUserActive(id, active);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
