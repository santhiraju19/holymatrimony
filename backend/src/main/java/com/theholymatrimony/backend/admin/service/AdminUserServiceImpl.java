package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminUserDetailResponse;
import com.theholymatrimony.backend.admin.dto.AdminUserPageResponse;
import com.theholymatrimony.backend.admin.dto.AdminUserResponse;
import com.theholymatrimony.backend.admin.dto.UpdateUserStatusRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserServiceImpl
        implements AdminUserService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final UserRepository userRepository;

    @Override
    public AdminUserPageResponse getUsers(
            int page,
            int size,
            String search,
            UserStatus status
    ) {

        int safePage = Math.max(page, 0);
        int safeSize = normalizePageSize(size);

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<User> users =
                userRepository.searchAdminUsers(
                        normalizeSearch(search),
                        status,
                        pageable
                );

        return AdminUserPageResponse
                .builder()
                .content(
                        users.getContent()
                                .stream()
                                .map(this::toListResponse)
                                .toList()
                )
                .page(users.getNumber())
                .size(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .first(users.isFirst())
                .last(users.isLast())
                .build();
    }

    @Override
    public AdminUserDetailResponse getUser(
            UUID userId
    ) {

        User user = findUser(userId);

        return toDetailResponse(user);
    }

    @Override
    @Transactional
    public AdminUserDetailResponse updateUserStatus(
            UUID userId,
            UpdateUserStatusRequest request
    ) {

        User targetUser =
                findUser(userId);

        User currentAdmin =
                getCurrentAdmin();

        if (targetUser.getId()
                .equals(currentAdmin.getId())) {

            throw new IllegalStateException(
                    "You cannot change your own account status."
            );
        }

        targetUser.changeStatus(
                request.getStatus(),
                request.getReason(),
                currentAdmin.getId()
        );

        User saved =
                userRepository.save(targetUser);

        return toDetailResponse(saved);
    }

    private User findUser(
            UUID userId
    ) {

        return userRepository
                .findById(userId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User not found: " + userId
                        )
                );
    }

    private User getCurrentAdmin() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "Authenticated administrator not found."
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new IllegalStateException(
                                "Administrator account not found."
                        )
                );
    }

    private AdminUserResponse toListResponse(
            User user
    ) {

        return AdminUserResponse
                .builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .status(resolveStatus(user))
                .enabled(
                        Boolean.TRUE.equals(
                                user.getEnabled()
                        )
                )
                .emailVerified(
                        user.isEmailVerificationComplete()
                )
                .profileCompletion(
                        safeProfileCompletion(
                                user.getProfileCompletion()
                        )
                )
                .membershipType(
                        safeMembershipType(
                                user.getMembershipType()
                        )
                )
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AdminUserDetailResponse toDetailResponse(
            User user
    ) {

        return AdminUserDetailResponse
                .builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .status(resolveStatus(user))
                .enabled(
                        Boolean.TRUE.equals(
                                user.getEnabled()
                        )
                )
                .emailVerified(
                        user.isEmailVerificationComplete()
                )
                .emailVerifiedAt(
                        user.getEmailVerifiedAt()
                )
                .profileCompletion(
                        safeProfileCompletion(
                                user.getProfileCompletion()
                        )
                )
                .membershipType(
                        safeMembershipType(
                                user.getMembershipType()
                        )
                )
                .statusReason(
                        user.getStatusReason()
                )
                .statusChangedAt(
                        user.getStatusChangedAt()
                )
                .statusChangedBy(
                        user.getStatusChangedBy()
                )
                .createdAt(
                        user.getCreatedAt()
                )
                .updatedAt(
                        user.getUpdatedAt()
                )
                .lastLoginAt(
                        user.getLastLoginAt()
                )
                .build();
    }

    private UserStatus resolveStatus(
            User user
    ) {

        if (user.getStatus() != null) {
            return user.getStatus();
        }

        if (Boolean.FALSE.equals(
                user.getEnabled()
        )) {
            return UserStatus.SUSPENDED;
        }

        return UserStatus.ACTIVE;
    }

    private int normalizePageSize(
            int size
    ) {

        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }

    private String normalizeSearch(
            String search
    ) {

        if (search == null) {
            return null;
        }

        String trimmed =
                search.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    private Integer safeProfileCompletion(
            Integer value
    ) {

        if (value == null) {
            return 0;
        }

        return Math.max(
                0,
                Math.min(100, value)
        );
    }

    private String safeMembershipType(
            String value
    ) {

        if (value == null
                || value.isBlank()) {

            return "FREE";
        }

        return value;
    }
}