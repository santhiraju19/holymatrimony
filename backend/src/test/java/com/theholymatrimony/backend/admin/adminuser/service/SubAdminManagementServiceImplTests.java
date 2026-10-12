package com.theholymatrimony.backend.admin.adminuser.service;

import com.theholymatrimony.backend.admin.access.AdminAccessLevel;
import com.theholymatrimony.backend.admin.access.AdminAccessService;
import com.theholymatrimony.backend.admin.access.AdminPermission;
import com.theholymatrimony.backend.admin.access.AdminUserPermission;
import com.theholymatrimony.backend.admin.access.AdminUserPermissionRepository;
import com.theholymatrimony.backend.admin.adminuser.dto.CreateSubAdminRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminResponse;
import com.theholymatrimony.backend.admin.adminuser.dto.UpdateSubAdminPermissionsRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.UpdateSubAdminStatusRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.passwordreset.PasswordResetService;
import com.theholymatrimony.backend.auth.passwordreset.dto.ForgotPasswordRequest;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.auth.service.RefreshTokenService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SubAdminManagementServiceImplTests {

    private UserRepository userRepository;
    private AdminUserPermissionRepository permissionRepository;
    private AdminAccessService adminAccessService;
    private PasswordEncoder passwordEncoder;
    private PasswordResetService passwordResetService;
    private RefreshTokenService refreshTokenService;

    private SubAdminManagementServiceImpl service;

    private User superAdmin;

    @BeforeEach
    void setUp() {
        userRepository =
                mock(UserRepository.class);

        permissionRepository =
                mock(
                        AdminUserPermissionRepository.class
                );

        adminAccessService =
                mock(AdminAccessService.class);

        passwordEncoder =
                mock(PasswordEncoder.class);

        passwordResetService =
                mock(PasswordResetService.class);

        refreshTokenService =
                mock(RefreshTokenService.class);

        service =
                new SubAdminManagementServiceImpl(
                        userRepository,
                        permissionRepository,
                        adminAccessService,
                        passwordEncoder,
                        passwordResetService,
                        refreshTokenService
                );

        superAdmin =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Primary Administrator")
                        .email("primary@example.com")
                        .password("encoded-password")
                        .emailVerified(true)
                        .enabled(true)
                        .status(UserStatus.ACTIVE)
                        .role(Role.ROLE_ADMIN)
                        .adminAccessLevel(
                                AdminAccessLevel.SUPER_ADMIN
                        )
                        .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                superAdmin.getEmail(),
                                "ignored",
                                List.of()
                        )
                );

        when(
                adminAccessService.requireSuperAdmin(
                        superAdmin.getEmail()
                )
        ).thenReturn(
                superAdmin
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createSubAdminUsesHiddenBootstrapPasswordAndSendsSetupOtp() {
        Set<AdminPermission> permissions =
                Set.of(
                        AdminPermission.DASHBOARD_VIEW,
                        AdminPermission.USERS_MANAGE
                );

        CreateSubAdminRequest request =
                new CreateSubAdminRequest(
                        "  Support Admin  ",
                        "  SUPPORT@EXAMPLE.COM  ",
                        permissions
                );

        when(
                userRepository.findByEmail(
                        "support@example.com"
                )
        ).thenReturn(
                Optional.empty()
        );

        when(
                passwordEncoder.encode(
                        any(CharSequence.class)
                )
        ).thenReturn(
                "encoded-bootstrap-secret"
        );

        when(
                userRepository.save(
                        any(User.class)
                )
        ).thenAnswer(
                invocation -> {
                    User user =
                            invocation.getArgument(0);

                    user.setId(
                            UUID.randomUUID()
                    );

                    return user;
                }
        );

        when(
                permissionRepository.findAllByUserId(
                        any(UUID.class)
                )
        ).thenAnswer(
                invocation -> {
                    UUID userId =
                            invocation.getArgument(0);

                    return permissions
                            .stream()
                            .map(
                                    permission ->
                                            AdminUserPermission
                                                    .builder()
                                                    .userId(userId)
                                                    .permission(permission)
                                                    .build()
                            )
                            .toList();
                }
        );

        SubAdminResponse response =
                service.createSubAdmin(
                        request
                );

        assertEquals(
                "Support Admin",
                response.fullName()
        );

        assertEquals(
                "support@example.com",
                response.email()
        );

        assertEquals(
                AdminAccessLevel.SUB_ADMIN,
                response.accessLevel()
        );

        assertEquals(
                UserStatus.ACTIVE,
                response.status()
        );

        assertTrue(
                response.enabled()
        );

        assertEquals(
                permissions,
                response.permissions()
        );

        verify(
                userRepository
        ).save(
                argThat(
                        user ->
                                user.getRole()
                                        == Role.ROLE_ADMIN
                                        && user.getAdminAccessLevel()
                                        == AdminAccessLevel.SUB_ADMIN
                                        && Boolean.TRUE.equals(
                                                user.getEmailVerified()
                                        )
                                        && Boolean.TRUE.equals(
                                                user.getEnabled()
                                        )
                                        && user.getStatus()
                                        == UserStatus.ACTIVE
                                        && "encoded-bootstrap-secret"
                                        .equals(
                                                user.getPassword()
                                        )
                )
        );

        verify(
                permissionRepository
        ).saveAll(
                argThat(
                        rows -> {
                            int count = 0;

                            for (
                                    AdminUserPermission row
                                    : rows
                            ) {
                                if (
                                        !permissions.contains(
                                                row.getPermission()
                                        )
                                ) {
                                    return false;
                                }

                                count++;
                            }

                            return count
                                    == permissions.size();
                        }
                )
        );

        verify(
                passwordResetService
        ).requestOtp(
                argThat(
                        requestOtp ->
                                requestOtp != null
                                        && "support@example.com"
                                        .equals(
                                                requestOtp.email()
                                        )
                )
        );
    }

    @Test
    void createSubAdminRejectsExistingEmailWithoutSendingOtp() {
        User existing =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Existing Member")
                        .email("existing@example.com")
                        .password("encoded-password")
                        .build();

        when(
                userRepository.findByEmail(
                        "existing@example.com"
                )
        ).thenReturn(
                Optional.of(existing)
        );

        CreateSubAdminRequest request =
                new CreateSubAdminRequest(
                        "New Admin",
                        "existing@example.com",
                        Set.of(
                                AdminPermission.DASHBOARD_VIEW
                        )
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createSubAdmin(
                                        request
                                )
                );

        assertEquals(
                "An account already exists with this email.",
                exception.getMessage()
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                any(ForgotPasswordRequest.class)
        );
    }

    @Test
    void updatePermissionsReplacesExistingPermissionRows() {
        User subAdmin =
                subAdmin();

        when(
                userRepository.findForUpdate(
                        subAdmin.getId()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        Set<AdminPermission> newPermissions =
                Set.of(
                        AdminPermission.VERIFICATIONS_MANAGE,
                        AdminPermission.REPORTS_MANAGE
                );

        when(
                permissionRepository.findAllByUserId(
                        subAdmin.getId()
                )
        ).thenReturn(
                newPermissions
                        .stream()
                        .map(
                                permission ->
                                        AdminUserPermission
                                                .builder()
                                                .userId(
                                                        subAdmin.getId()
                                                )
                                                .permission(
                                                        permission
                                                )
                                                .build()
                        )
                        .toList()
        );

        SubAdminResponse response =
                service.updatePermissions(
                        subAdmin.getId(),
                        new UpdateSubAdminPermissionsRequest(
                                newPermissions
                        )
                );

        verify(
                permissionRepository
        ).deleteAllByUserId(
                subAdmin.getId()
        );

        verify(
                permissionRepository
        ).saveAll(
                any()
        );

        assertEquals(
                newPermissions,
                response.permissions()
        );
    }

    @Test
    void deactivateSubAdminDisablesAccountAndRevokesRefreshTokens() {
        User subAdmin =
                subAdmin();

        when(
                userRepository.findForUpdate(
                        subAdmin.getId()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        when(
                userRepository.save(
                        subAdmin
                )
        ).thenReturn(
                subAdmin
        );

        when(
                permissionRepository.findAllByUserId(
                        subAdmin.getId()
                )
        ).thenReturn(
                List.of()
        );

        SubAdminResponse response =
                service.updateStatus(
                        subAdmin.getId(),
                        new UpdateSubAdminStatusRequest(
                                UserStatus.DEACTIVATED,
                                "Access no longer required"
                        ),
                        "203.0.113.10"
                );

        assertEquals(
                UserStatus.DEACTIVATED,
                response.status()
        );

        assertFalse(
                response.enabled()
        );

        assertEquals(
                superAdmin.getId(),
                subAdmin.getStatusChangedBy()
        );

        verify(
                refreshTokenService
        ).revokeAllUserTokens(
                subAdmin,
                "203.0.113.10",
                "Sub-admin deactivated by super administrator"
        );
    }

    @Test
    void activatingSubAdminDoesNotRevokeRefreshTokens() {
        User subAdmin =
                subAdmin();

        subAdmin.changeStatus(
                UserStatus.DEACTIVATED,
                "Disabled",
                superAdmin.getId()
        );

        when(
                userRepository.findForUpdate(
                        subAdmin.getId()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        when(
                userRepository.save(
                        subAdmin
                )
        ).thenReturn(
                subAdmin
        );

        when(
                permissionRepository.findAllByUserId(
                        subAdmin.getId()
                )
        ).thenReturn(
                List.of()
        );

        SubAdminResponse response =
                service.updateStatus(
                        subAdmin.getId(),
                        new UpdateSubAdminStatusRequest(
                                UserStatus.ACTIVE,
                                null
                        ),
                        "203.0.113.11"
                );

        assertEquals(
                UserStatus.ACTIVE,
                response.status()
        );

        assertTrue(
                response.enabled()
        );

        verify(
                refreshTokenService,
                never()
        ).revokeAllUserTokens(
                any(User.class),
                any(),
                any()
        );
    }

    @Test
    void updateStatusRejectsUnsupportedAdministrativeStatus() {
        User subAdmin =
                subAdmin();

        when(
                userRepository.findForUpdate(
                        subAdmin.getId()
                )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.updateStatus(
                                subAdmin.getId(),
                                new UpdateSubAdminStatusRequest(
                                        UserStatus.BLOCKED,
                                        "Not allowed here"
                                ),
                                "203.0.113.12"
                        )
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );

        verify(
                refreshTokenService,
                never()
        ).revokeAllUserTokens(
                any(User.class),
                any(),
                any()
        );
    }

    @Test
    void superAdminCannotBeTargetedThroughSubAdminMutationApi() {
        User targetSuperAdmin =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Another Super Admin")
                        .email("another-primary@example.com")
                        .password("encoded-password")
                        .emailVerified(true)
                        .enabled(true)
                        .status(UserStatus.ACTIVE)
                        .role(Role.ROLE_ADMIN)
                        .adminAccessLevel(
                                AdminAccessLevel.SUPER_ADMIN
                        )
                        .build();

        when(
                userRepository.findForUpdate(
                        targetSuperAdmin.getId()
                )
        ).thenReturn(
                Optional.of(targetSuperAdmin)
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.updatePermissions(
                                targetSuperAdmin.getId(),
                                new UpdateSubAdminPermissionsRequest(
                                        Set.of(
                                                AdminPermission.DASHBOARD_VIEW
                                        )
                                )
                        )
        );

        verify(
                permissionRepository,
                never()
        ).deleteAllByUserId(
                targetSuperAdmin.getId()
        );
    }

    @Test
    void resendSetupOtpRejectsDeactivatedSubAdmin() {
        User subAdmin =
                subAdmin();

        subAdmin.changeStatus(
                UserStatus.DEACTIVATED,
                "Disabled",
                superAdmin.getId()
        );

        when(
                userRepository
                        .findByIdAndRoleAndAdminAccessLevel(
                                subAdmin.getId(),
                                Role.ROLE_ADMIN,
                                AdminAccessLevel.SUB_ADMIN
                        )
        ).thenReturn(
                Optional.of(subAdmin)
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        service.resendSetupOtp(
                                subAdmin.getId()
                        )
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                any(ForgotPasswordRequest.class)
        );
    }

    private User subAdmin() {
        return User.builder()
                .id(UUID.randomUUID())
                .fullName("Support Administrator")
                .email("support-admin@example.com")
                .password("encoded-password")
                .emailVerified(true)
                .enabled(true)
                .status(UserStatus.ACTIVE)
                .role(Role.ROLE_ADMIN)
                .adminAccessLevel(
                        AdminAccessLevel.SUB_ADMIN
                )
                .build();
    }
}
