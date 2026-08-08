package com.theholymatrimony.backend.auth.service;

import com.theholymatrimony.backend.auth.dto.AuthResponse;
import com.theholymatrimony.backend.auth.dto.AuthSession;
import com.theholymatrimony.backend.auth.dto.LoginRequest;
import com.theholymatrimony.backend.auth.dto.RegisterRequest;
import com.theholymatrimony.backend.auth.dto.RegisterResponse;

import com.theholymatrimony.backend.auth.emailotp.EmailOtpService;

import com.theholymatrimony.backend.auth.entity.RefreshToken;
import com.theholymatrimony.backend.auth.entity.User;

import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;

import com.theholymatrimony.backend.auth.exception.AccountStatusException;

import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.security.jwt.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String TOKEN_TYPE =
            "Bearer";

    private final UserRepository userRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final AuthenticationManager
            authenticationManager;

    private final JwtService jwtService;

    private final RefreshTokenService
            refreshTokenService;

    private final EmailOtpService
            emailOtpService;

    /*
     * ---------------------------------------------------------
     * Registration
     * ---------------------------------------------------------
     */

    @Transactional
    public RegisterResponse register(
            RegisterRequest request
    ) {

        String normalizedEmail =
                normalizeEmail(
                        request.getEmail()
                );

        String normalizedMobile =
                normalizeMobile(
                        request.getMobile()
                );

        if (
                userRepository.existsByEmail(
                        normalizedEmail
                )
        ) {

            throw new IllegalArgumentException(
                    "An account already exists with this email."
            );
        }

        if (
                userRepository.existsByMobile(
                        normalizedMobile
                )
        ) {

            throw new IllegalArgumentException(
                    "An account already exists with this mobile number."
            );
        }

        User user =
                new User();

        user.setFullName(
                normalizeName(
                        request.getFullName()
                )
        );

        user.setEmail(
                normalizedEmail
        );

        user.setMobile(
                normalizedMobile
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        /*
         * New registrations are always
         * normal platform members.
         *
         * Admin access is granted separately.
         */
        user.setRole(
                Role.ROLE_USER
        );

        /*
         * New accounts begin as ACTIVE.
         */
        user.setStatus(
                UserStatus.ACTIVE
        );

        /*
         * Enabled remains true during registration.
         *
         * Email verification is handled separately.
         */
        user.setEnabled(true);

        user.setEmailVerified(false);

        User savedUser =
                userRepository.save(
                        user
                );

        emailOtpService
                .issueRegistrationOtp(
                        savedUser
                );

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getMobile(),
                "Account created. Verify the OTP sent to your email before signing in."
        );
    }

    /*
     * ---------------------------------------------------------
     * Login
     * ---------------------------------------------------------
     */

    @Transactional
    public AuthSession login(
            LoginRequest request,
            String clientIp
    ) {

        String normalizedEmail =
                normalizeEmail(
                        request.getEmail()
                );

        User user =
                userRepository
                        .findByEmail(
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Invalid email or password."
                                        )
                        );

        /*
         * -----------------------------------------------------
         * Administrative account status
         * -----------------------------------------------------
         *
         * Admin User Management keeps:
         *
         * ACTIVE
         * SUSPENDED
         * BLOCKED
         * DEACTIVATED
         *
         * Only ACTIVE accounts may sign in.
         */
        validateAccountStatus(
                user
        );

        /*
         * Existing email-verification behaviour.
         */
        if (
                !user.isEmailVerificationComplete()
        ) {

            throw new IllegalArgumentException(
                    "Please verify your email address before signing in."
            );
        }

        /*
         * Password authentication.
         *
         * CustomUserDetailsService still checks
         * enabled=false as an additional security layer.
         */
        Authentication authentication =
                authenticationManager
                        .authenticate(
                                new UsernamePasswordAuthenticationToken(
                                        normalizedEmail,
                                        request.getPassword()
                                )
                        );

        List<String> authorities =
                authentication
                        .getAuthorities()
                        .stream()
                        .map(
                                GrantedAuthority::getAuthority
                        )
                        .toList();

        String accessToken =
                jwtService
                        .generateAccessToken(
                                user.getEmail(),
                                authorities
                        );

        String refreshToken =
                refreshTokenService
                        .createRefreshToken(
                                user,
                                clientIp
                        );

        /*
         * Track successful login.
         */
        user.setLastLoginAt(
                java.time.LocalDateTime.now()
        );

        userRepository.save(
                user
        );

        AuthResponse response =
                new AuthResponse(
                        accessToken,
                        TOKEN_TYPE,
                        jwtService
                                .getAccessTokenExpirationMillis(),
                        user.getEmail(),
                        user.getFullName()
                );

        return new AuthSession(
                response,
                refreshToken
        );
    }

    /*
     * ---------------------------------------------------------
     * Refresh
     * ---------------------------------------------------------
     */

    @Transactional
    public AuthSession refresh(
            String currentRefreshToken,
            String clientIp
    ) {

        RefreshToken storedToken =
                refreshTokenService
                        .validateRefreshToken(
                                currentRefreshToken
                        );

        User user =
                storedToken.getUser();

        /*
         * A suspended/blocked/deactivated user
         * must not continue using an old refresh token.
         */
        validateAccountStatus(
                user
        );

        if (
                !user.isEmailVerificationComplete()
        ) {

            throw new IllegalArgumentException(
                    "Email verification is required."
            );
        }

        Role role =
                user.getRole() == null
                        ? Role.ROLE_USER
                        : user.getRole();

        String accessToken =
                jwtService
                        .generateAccessToken(
                                user.getEmail(),
                                List.of(
                                        role.name()
                                )
                        );

        String replacementRefreshToken =
                refreshTokenService
                        .rotateRefreshToken(
                                currentRefreshToken,
                                clientIp
                        );

        AuthResponse response =
                new AuthResponse(
                        accessToken,
                        TOKEN_TYPE,
                        jwtService
                                .getAccessTokenExpirationMillis(),
                        user.getEmail(),
                        user.getFullName()
                );

        return new AuthSession(
                response,
                replacementRefreshToken
        );
    }

    /*
     * ---------------------------------------------------------
     * Logout
     * ---------------------------------------------------------
     */

    @Transactional
    public void logout(
            String refreshToken,
            String clientIp
    ) {

        refreshTokenService
                .revokeRefreshToken(
                        refreshToken,
                        clientIp,
                        "User logged out"
                );
    }

    /*
     * ---------------------------------------------------------
     * Account status validation
     * ---------------------------------------------------------
     */

    private void validateAccountStatus(
            User user
    ) {

        UserStatus status =
                user.getStatus() == null
                        ? UserStatus.ACTIVE
                        : user.getStatus();

        switch (status) {

            case ACTIVE -> {
                /*
                 * Account can continue.
                 */
            }

            case SUSPENDED ->
                    throw new AccountStatusException(
                            "Your account has been suspended. Please contact support."
                    );

            case BLOCKED ->
                    throw new AccountStatusException(
                            "Your account has been blocked. Please contact support."
                    );

            case DEACTIVATED ->
                    throw new AccountStatusException(
                            "Your account has been deactivated."
                    );
        }
    }

    /*
     * ---------------------------------------------------------
     * Normalization
     * ---------------------------------------------------------
     */

    private String normalizeEmail(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
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

    private String normalizeMobile(
            String mobile
    ) {

        if (
                mobile == null ||
                mobile.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Mobile number is required."
            );
        }

        return mobile.trim();
    }

    private String normalizeName(
            String fullName
    ) {

        if (
                fullName == null ||
                fullName.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Full name is required."
            );
        }

        return fullName.trim();
    }
}