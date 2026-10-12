package com.theholymatrimony.backend.admin.access;

import com.theholymatrimony.backend.admin.access.dto.AdminAccessResponse;
import com.theholymatrimony.backend.auth.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin/access")
@RequiredArgsConstructor
public class AdminAccessController {

    private final AdminAccessService adminAccessService;

    @GetMapping("/me")
    public ResponseEntity<AdminAccessResponse>
    getCurrentAdminAccess(
            Authentication authentication
    ) {
        if (
                authentication == null
                        || !authentication.isAuthenticated()
        ) {
            throw new IllegalStateException(
                    "Authenticated administrator not found."
            );
        }

        User user =
                adminAccessService.requireAdmin(
                        authentication.getName()
                );

        Set<AdminPermission> permissions =
                adminAccessService
                        .getEffectivePermissions(
                                user.getEmail()
                        );

        AdminAccessResponse response =
                new AdminAccessResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getAdminAccessLevel(),
                        permissions
                );

        return ResponseEntity.ok(
                response
        );
    }
}
