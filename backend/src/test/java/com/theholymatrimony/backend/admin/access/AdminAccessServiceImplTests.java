package com.theholymatrimony.backend.admin.access;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.security.ActiveAccountValidator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminAccessServiceImplTests {

    private UserRepository userRepository;
    private AdminUserPermissionRepository permissionRepository;

    private AdminAccessServiceImpl service;

    @BeforeEach
    void setUp() {
        userRepository =
                mock(UserRepository.class);

        permissionRepository =
                mock(
                        AdminUserPermissionRepository.class
                );

        ActiveAccountValidator activeAccountValidator =
                new ActiveAccountValidator(
                        userRepository
                );

        service =
                new AdminAccessServiceImpl(
                        activeAccountValidator,
                        permissionRepository
                );
    }

    @Test
    void superAdminImplicitlyHasEveryPermission() {
        User superAdmin =
                adminUser(
                        AdminAccessLevel.SUPER_ADMIN
                );

        when(
                userRepository.findByEmail(
                        superAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(superAdmin)
        );

        User result =
                service.requirePermission(
                        superAdmin.getEmail(),
                        AdminPermission.REPORTS_MANAGE
                );

        assertSame(
                superAdmin,
                result
        );

        verify(
                permissionRepository,
                never()
        ).existsByUserIdAndPermission(
                superAdmin.getId(),
                AdminPermission.REPORTS_MANAGE
        );
    }

    @Test
    void subAdminWithAssignedPermissionIsAllowed() {
        User subAdmin =
                adminUser(
                        AdminAccessLevel.SUB_ADMIN
                );

        when(
                userRepository.findByEmail(
                        subAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        when(
                permissionRepository
                        .existsByUserIdAndPermission(
                                subAdmin.getId(),
                                AdminPermission.USERS_MANAGE
                        )
        ).thenReturn(true);

        User result =
                service.requirePermission(
                        subAdmin.getEmail(),
                        AdminPermission.USERS_MANAGE
                );

        assertSame(
                subAdmin,
                result
        );
    }

    @Test
    void subAdminWithoutAssignedPermissionIsDenied() {
        User subAdmin =
                adminUser(
                        AdminAccessLevel.SUB_ADMIN
                );

        when(
                userRepository.findByEmail(
                        subAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        when(
                permissionRepository
                        .existsByUserIdAndPermission(
                                subAdmin.getId(),
                                AdminPermission.PAYMENTS_VIEW
                        )
        ).thenReturn(false);

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requirePermission(
                                        subAdmin.getEmail(),
                                        AdminPermission.PAYMENTS_VIEW
                                )
                );

        assertEquals(
                "You do not have permission to access this admin area.",
                exception.getMessage()
        );
    }

    @Test
    void normalUserCannotUseAdminAccessService() {
        User member =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Normal Member")
                        .email("member@example.com")
                        .password("encoded-password")
                        .enabled(true)
                        .status(UserStatus.ACTIVE)
                        .role(Role.ROLE_USER)
                        .build();

        when(
                userRepository.findByEmail(
                        member.getEmail()
                )
        ).thenReturn(
                Optional.of(member)
        );

        assertThrows(
                AccessDeniedException.class,
                () ->
                        service.requireAdmin(
                                member.getEmail()
                        )
        );
    }

    @Test
    void disabledSubAdminIsRejectedBeforePermissionLookup() {
        User subAdmin =
                adminUser(
                        AdminAccessLevel.SUB_ADMIN
                );

        subAdmin.changeStatus(
                UserStatus.DEACTIVATED,
                "Disabled for test",
                UUID.randomUUID()
        );

        when(
                userRepository.findByEmail(
                        subAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        assertThrows(
                DisabledException.class,
                () ->
                        service.requirePermission(
                                subAdmin.getEmail(),
                                AdminPermission.DASHBOARD_VIEW
                        )
        );

        verify(
                permissionRepository,
                never()
        ).existsByUserIdAndPermission(
                subAdmin.getId(),
                AdminPermission.DASHBOARD_VIEW
        );
    }

    @Test
    void superAdminEffectivePermissionsContainEveryPermission() {
        User superAdmin =
                adminUser(
                        AdminAccessLevel.SUPER_ADMIN
                );

        when(
                userRepository.findByEmail(
                        superAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(superAdmin)
        );

        Set<AdminPermission> permissions =
                service.getEffectivePermissions(
                        superAdmin.getEmail()
                );

        assertEquals(
                Set.of(
                        AdminPermission.values()
                ),
                permissions
        );

        verify(
                permissionRepository,
                never()
        ).findAllByUserId(
                superAdmin.getId()
        );
    }

    @Test
    void subAdminEffectivePermissionsComeFromDatabase() {
        User subAdmin =
                adminUser(
                        AdminAccessLevel.SUB_ADMIN
                );

        when(
                userRepository.findByEmail(
                        subAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        when(
                permissionRepository.findAllByUserId(
                        subAdmin.getId()
                )
        ).thenReturn(
                List.of(
                        AdminUserPermission.builder()
                                .userId(
                                        subAdmin.getId()
                                )
                                .permission(
                                        AdminPermission.DASHBOARD_VIEW
                                )
                                .build(),
                        AdminUserPermission.builder()
                                .userId(
                                        subAdmin.getId()
                                )
                                .permission(
                                        AdminPermission.REPORTS_MANAGE
                                )
                                .build()
                )
        );

        Set<AdminPermission> permissions =
                service.getEffectivePermissions(
                        subAdmin.getEmail()
                );

        assertEquals(
                Set.of(
                        AdminPermission.DASHBOARD_VIEW,
                        AdminPermission.REPORTS_MANAGE
                ),
                permissions
        );

        assertTrue(
                permissions.contains(
                        AdminPermission.DASHBOARD_VIEW
                )
        );
    }

    @Test
    void permissionRevocationTakesEffectOnNextAuthorizationCheck() {
        User subAdmin =
                adminUser(
                        AdminAccessLevel.SUB_ADMIN
                );

        when(
                userRepository.findByEmail(
                        subAdmin.getEmail()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        when(
                permissionRepository.existsByUserIdAndPermission(
                        subAdmin.getId(),
                        AdminPermission.USERS_MANAGE
                )
        ).thenReturn(
                true,
                false
        );

        assertTrue(
                service.hasPermission(
                        subAdmin.getEmail(),
                        AdminPermission.USERS_MANAGE
                )
        );

        assertFalse(
                service.hasPermission(
                        subAdmin.getEmail(),
                        AdminPermission.USERS_MANAGE
                )
        );

        verify(
                permissionRepository,
                org.mockito.Mockito.times(2)
        ).existsByUserIdAndPermission(
                subAdmin.getId(),
                AdminPermission.USERS_MANAGE
        );
    }

    private User adminUser(
            AdminAccessLevel accessLevel
    ) {
        return User.builder()
                .id(UUID.randomUUID())
                .fullName("Admin User")
                .email(
                        accessLevel.name()
                                .toLowerCase()
                                + "@example.com"
                )
                .password("encoded-password")
                .emailVerified(true)
                .enabled(true)
                .status(UserStatus.ACTIVE)
                .role(Role.ROLE_ADMIN)
                .adminAccessLevel(accessLevel)
                .build();
    }
}
