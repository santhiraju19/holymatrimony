package com.theholymatrimony.backend.account.service;

import com.theholymatrimony.backend.account.dto.AccountActionResponse;
import com.theholymatrimony.backend.account.dto.AccountResponse;
import com.theholymatrimony.backend.account.dto.ChangePasswordRequest;
import com.theholymatrimony.backend.account.dto.UpdateAccountRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.auth.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService refreshTokenService;

    @Transactional(readOnly = true)
    public AccountResponse getAccount(
            String email
    ) {
        User user = findUser(email);

        return toResponse(user);
    }

    @Transactional
    public AccountResponse updateAccount(
            String email,
            UpdateAccountRequest request
    ) {
        User user = findUser(email);

        String fullName = request.fullName().trim();
        String mobile = normalizeMobile(request.mobile());

        if (
                mobile != null &&
                userRepository.existsByMobile(mobile) &&
                !mobile.equals(user.getMobile())
        ) {
            throw new IllegalArgumentException(
                    "Mobile number is already registered."
            );
        }

        user.setFullName(fullName);
        user.setMobile(mobile);

        User savedUser =
                userRepository.save(user);

        return toResponse(savedUser);
    }

    @Transactional
    public AccountActionResponse changePassword(
            String email,
            ChangePasswordRequest request,
            String clientIp
    ) {
        User user = findUser(email);

        if (
                !passwordEncoder.matches(
                        request.currentPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }

        if (
                !request.newPassword()
                        .equals(request.confirmPassword())
        ) {
            throw new IllegalArgumentException(
                    "New password and confirmation do not match."
            );
        }

        if (
                passwordEncoder.matches(
                        request.newPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "New password must be different from the current password."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);

        /*
         * Password changes are security-sensitive.
         *
         * Revoke every refresh token so all existing
         * browser/device sessions must authenticate again.
         */
        refreshTokenService.revokeAllUserTokens(
                user,
                clientIp,
                "Password changed"
        );

        return new AccountActionResponse(
                "Password changed successfully. Please sign in again."
        );
    }

    @Transactional
    public AccountActionResponse logoutAll(
            String email,
            String clientIp
    ) {
        User user = findUser(email);

        refreshTokenService.revokeAllUserTokens(
                user,
                clientIp,
                "User requested logout from all devices"
        );

        return new AccountActionResponse(
                "You have been logged out from all devices."
        );
    }

    private User findUser(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user is unavailable."
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        return userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User account not found."
                        )
                );
    }

    private String normalizeMobile(
            String mobile
    ) {
        if (mobile == null) {
            return null;
        }

        String normalized =
                mobile.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

    private AccountResponse toResponse(
            User user
    ) {
        return new AccountResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobile(),
                user.isEmailVerificationComplete(),
                user.getStatus(),
                user.getMembershipType(),
                user.getProfileCompletion(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}
