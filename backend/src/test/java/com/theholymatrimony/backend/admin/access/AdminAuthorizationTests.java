package com.theholymatrimony.backend.admin.access;

import com.theholymatrimony.backend.auth.entity.User;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminAuthorizationTests {

    private AdminAccessService adminAccessService;
    private AdminAuthorization authorization;

    @BeforeEach
    void setUp() {
        adminAccessService =
                mock(AdminAccessService.class);

        authorization =
                new AdminAuthorization(
                        adminAccessService
                );
    }

    @Test
    void hasPermissionDelegatesValidPermissionToAccessService() {
        Authentication authentication =
                authenticated(
                        "subadmin@example.com"
                );

        when(
                adminAccessService.hasPermission(
                        "subadmin@example.com",
                        AdminPermission.USERS_MANAGE
                )
        ).thenReturn(true);

        assertTrue(
                authorization.hasPermission(
                        authentication,
                        "USERS_MANAGE"
                )
        );

        verify(
                adminAccessService
        ).hasPermission(
                "subadmin@example.com",
                AdminPermission.USERS_MANAGE
        );
    }

    @Test
    void hasPermissionReturnsFalseWhenPermissionIsDenied() {
        Authentication authentication =
                authenticated(
                        "subadmin@example.com"
                );

        when(
                adminAccessService.hasPermission(
                        "subadmin@example.com",
                        AdminPermission.PAYMENTS_VIEW
                )
        ).thenReturn(false);

        assertFalse(
                authorization.hasPermission(
                        authentication,
                        "PAYMENTS_VIEW"
                )
        );
    }

    @Test
    void hasPermissionReturnsFalseForUnknownPermissionName() {
        Authentication authentication =
                authenticated(
                        "subadmin@example.com"
                );

        assertFalse(
                authorization.hasPermission(
                        authentication,
                        "NOT_A_REAL_PERMISSION"
                )
        );
    }

    @Test
    void hasPermissionReturnsFalseForUnauthenticatedRequest() {
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "subadmin@example.com",
                        "ignored"
                );

        assertFalse(
                authorization.hasPermission(
                        authentication,
                        "USERS_MANAGE"
                )
        );
    }

    @Test
    void hasPermissionReturnsFalseForNullAuthentication() {
        assertFalse(
                authorization.hasPermission(
                        null,
                        "USERS_MANAGE"
                )
        );
    }

    @Test
    void superAdminCheckReturnsTrueWhenServiceAcceptsUser() {
        Authentication authentication =
                authenticated(
                        "primary@example.com"
                );

        when(
                adminAccessService.requireSuperAdmin(
                        "primary@example.com"
                )
        ).thenReturn(
                mock(User.class)
        );

        assertTrue(
                authorization.isSuperAdmin(
                        authentication
                )
        );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                "primary@example.com"
        );
    }

    @Test
    void superAdminCheckReturnsFalseWhenServiceRejectsUser() {
        Authentication authentication =
                authenticated(
                        "subadmin@example.com"
                );

        when(
                adminAccessService.requireSuperAdmin(
                        "subadmin@example.com"
                )
        ).thenThrow(
                new AccessDeniedException(
                        "Super administrator access is required."
                )
        );

        assertFalse(
                authorization.isSuperAdmin(
                        authentication
                )
        );
    }

    @Test
    void superAdminCheckReturnsFalseForNullAuthentication() {
        assertFalse(
                authorization.isSuperAdmin(
                        null
                )
        );
    }

    private Authentication authenticated(
            String email
    ) {
        return new UsernamePasswordAuthenticationToken(
                email,
                "ignored",
                java.util.List.of()
        );
    }
}
