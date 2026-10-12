package com.theholymatrimony.backend.admin.access;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Spring Method Security bridge for database-authoritative
 * administrative permission checks.
 *
 * Intended for use from @PreAuthorize expressions.
 */
@Component("adminAuthorization")
@RequiredArgsConstructor
public class AdminAuthorization {

    private final AdminAccessService adminAccessService;

    public boolean hasPermission(
            Authentication authentication,
            String permissionName
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || permissionName == null
                || permissionName.isBlank()) {

            return false;
        }

        final AdminPermission permission;

        try {
            permission =
                    AdminPermission.valueOf(
                            permissionName.trim()
                    );
        } catch (IllegalArgumentException exception) {
            return false;
        }

        return adminAccessService.hasPermission(
                authentication.getName(),
                permission
        );
    }

    public boolean isSuperAdmin(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            return false;
        }

        try {
            adminAccessService.requireSuperAdmin(
                    authentication.getName()
            );

            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }
}
