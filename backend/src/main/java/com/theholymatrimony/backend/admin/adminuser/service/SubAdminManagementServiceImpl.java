package com.theholymatrimony.backend.admin.adminuser.service;

import com.theholymatrimony.backend.admin.access.AdminAccessLevel;
import com.theholymatrimony.backend.admin.access.AdminAccessService;
import com.theholymatrimony.backend.admin.access.AdminPermission;
import com.theholymatrimony.backend.admin.access.AdminUserPermission;
import com.theholymatrimony.backend.admin.access.AdminUserPermissionRepository;
import com.theholymatrimony.backend.admin.adminuser.dto.CreateSubAdminRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminPageResponse;
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

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubAdminManagementServiceImpl
        implements SubAdminManagementService {

    private static final int BOOTSTRAP_SECRET_BYTES = 48;

    private final UserRepository userRepository;
    private final AdminUserPermissionRepository permissionRepository;
    private final AdminAccessService adminAccessService;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;
    private final RefreshTokenService refreshTokenService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Override
    public SubAdminPageResponse getSubAdmins(
            String search,
            UserStatus status,
            Pageable pageable
    ) {
        requireCurrentSuperAdmin();

        String normalizedSearch =
                normalizeSearch(search);

        Page<User> result =
                userRepository.searchSubAdmins(
                        Role.ROLE_ADMIN,
                        AdminAccessLevel.SUB_ADMIN,
                        normalizedSearch,
                        status,
                        pageable
                );

        List<SubAdminResponse> content =
                result.getContent()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return new SubAdminPageResponse(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Override
    public SubAdminResponse getSubAdmin(
            UUID userId
    ) {
        requireCurrentSuperAdmin();

        return toResponse(
                findSubAdmin(userId)
        );
    }

    @Override
    @Transactional
    public SubAdminResponse createSubAdmin(
            CreateSubAdminRequest request
    ) {
        requireCurrentSuperAdmin();

        String fullName =
                normalizeName(
                        request.fullName()
                );

        String email =
                normalizeEmail(
                        request.email()
                );

        Set<AdminPermission> permissions =
                normalizePermissions(
                        request.permissions()
                );

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(
                    "An account already exists with this email."
            );
        }

        User user =
                new User();

        user.setFullName(fullName);
        user.setEmail(email);
        user.setMobile(null);

        user.setPassword(
                passwordEncoder.encode(
                        generateBootstrapSecret()
                )
        );

        user.setRole(
                Role.ROLE_ADMIN
        );

        user.setAdminAccessLevel(
                AdminAccessLevel.SUB_ADMIN
        );

        user.setStatus(
                UserStatus.ACTIVE
        );

        user.setEnabled(true);

        /*
         * The account is provisioned by a SUPER_ADMIN.
         *
         * Email ownership is still proven through the password
         * setup OTP delivered to this address before the new
         * administrator can establish a usable password.
         */
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(
                LocalDateTime.now()
        );

        User saved =
                userRepository.save(user);

        savePermissions(
                saved.getId(),
                permissions
        );

        /*
         * Nobody, including the SUPER_ADMIN, receives or knows
         * the random bootstrap password.
         *
         * The new SUB_ADMIN establishes the real password
         * through the existing OTP-backed reset flow.
         */
        passwordResetService.requestOtp(
                new ForgotPasswordRequest(
                        saved.getEmail()
                )
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public SubAdminResponse updatePermissions(
            UUID userId,
            UpdateSubAdminPermissionsRequest request
    ) {
        requireCurrentSuperAdmin();

        User subAdmin =
                findSubAdminForUpdate(
                        userId
                );

        Set<AdminPermission> permissions =
                normalizePermissions(
                        request.permissions()
                );

        permissionRepository.deleteAllByUserId(
                subAdmin.getId()
        );

        savePermissions(
                subAdmin.getId(),
                permissions
        );

        return toResponse(subAdmin);
    }

    @Override
    @Transactional
    public SubAdminResponse updateStatus(
            UUID userId,
            UpdateSubAdminStatusRequest request,
            String clientIp
    ) {
        User currentSuperAdmin =
                requireCurrentSuperAdmin();

        User subAdmin =
                findSubAdminForUpdate(
                        userId
                );

        UserStatus requestedStatus =
                request.status();

        if (
                requestedStatus != UserStatus.ACTIVE
                        && requestedStatus != UserStatus.DEACTIVATED
        ) {
            throw new IllegalArgumentException(
                    "Sub-admin status can only be ACTIVE or DEACTIVATED."
            );
        }

        String reason =
                normalizeStatusReason(
                        request.reason(),
                        requestedStatus
                );

        subAdmin.changeStatus(
                requestedStatus,
                reason,
                currentSuperAdmin.getId()
        );

        User saved =
                userRepository.save(subAdmin);

        if (requestedStatus == UserStatus.DEACTIVATED) {
            refreshTokenService.revokeAllUserTokens(
                    saved,
                    clientIp,
                    "Sub-admin deactivated by super administrator"
            );
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void resendSetupOtp(
            UUID userId
    ) {
        requireCurrentSuperAdmin();

        User subAdmin =
                findSubAdmin(userId);

        if (subAdmin.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Password setup can only be sent to an active sub-admin."
            );
        }

        passwordResetService.requestOtp(
                new ForgotPasswordRequest(
                        subAdmin.getEmail()
                )
        );
    }

    private User requireCurrentSuperAdmin() {
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                        || !authentication.isAuthenticated()
        ) {
            throw new IllegalStateException(
                    "Authenticated administrator not found."
            );
        }

        return adminAccessService.requireSuperAdmin(
                authentication.getName()
        );
    }

    private User findSubAdmin(
            UUID userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Sub-admin user ID is required."
            );
        }

        return userRepository
                .findByIdAndRoleAndAdminAccessLevel(
                        userId,
                        Role.ROLE_ADMIN,
                        AdminAccessLevel.SUB_ADMIN
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Sub-admin account not found."
                        )
                );
    }

    private User findSubAdminForUpdate(
            UUID userId
    ) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Sub-admin user ID is required."
            );
        }

        User user =
                userRepository
                        .findForUpdate(userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Sub-admin account not found."
                                )
                        );

        if (
                user.getRole() != Role.ROLE_ADMIN
                        || user.getAdminAccessLevel()
                        != AdminAccessLevel.SUB_ADMIN
        ) {
            throw new IllegalArgumentException(
                    "Sub-admin account not found."
            );
        }

        return user;
    }

    private void savePermissions(
            UUID userId,
            Set<AdminPermission> permissions
    ) {
        List<AdminUserPermission> entities =
                permissions
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

        permissionRepository.saveAll(
                entities
        );
    }

    private SubAdminResponse toResponse(
            User user
    ) {
        Set<AdminPermission> permissions =
                permissionRepository
                        .findAllByUserId(
                                user.getId()
                        )
                        .stream()
                        .map(
                                AdminUserPermission::getPermission
                        )
                        .collect(
                                () -> new LinkedHashSet<>(),
                                Set::add,
                                Set::addAll
                        );

        return new SubAdminResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAdminAccessLevel(),
                user.getStatus(),
                Boolean.TRUE.equals(
                        user.getEnabled()
                ),
                permissions,
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    private Set<AdminPermission> normalizePermissions(
            Set<AdminPermission> permissions
    ) {
        if (
                permissions == null
                        || permissions.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "Select at least one admin permission."
            );
        }

        boolean containsNull =
                permissions
                        .stream()
                        .anyMatch(
                                java.util.Objects::isNull
                        );

        if (containsNull) {
            throw new IllegalArgumentException(
                    "Admin permissions cannot contain null values."
            );
        }

        return EnumSet.copyOf(
                permissions
        );
    }

    private String normalizeEmail(
            String email
    ) {
        if (
                email == null
                        || email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String normalizeName(
            String fullName
    ) {
        if (
                fullName == null
                        || fullName.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Full name is required."
            );
        }

        return fullName.trim();
    }

    private String normalizeSearch(
            String search
    ) {
        if (
                search == null
                        || search.isBlank()
        ) {
            return null;
        }

        return search.trim();
    }

    private String normalizeStatusReason(
            String reason,
            UserStatus status
    ) {
        if (
                reason != null
                        && !reason.isBlank()
        ) {
            return reason.trim();
        }

        if (status == UserStatus.DEACTIVATED) {
            return "Deactivated by super administrator";
        }

        return "Activated by super administrator";
    }

    private String generateBootstrapSecret() {
        byte[] bytes =
                new byte[
                        BOOTSTRAP_SECRET_BYTES
                ];

        secureRandom.nextBytes(bytes);

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }
}
