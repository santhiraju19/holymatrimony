package com.theholymatrimony.backend.auth.passwordreset;

import com.theholymatrimony.backend.auth.emailotp.EmailOtpDeliveryService;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.passwordreset.dto.ForgotPasswordRequest;
import com.theholymatrimony.backend.auth.passwordreset.dto.PasswordResetResponse;
import com.theholymatrimony.backend.auth.passwordreset.dto.ResetPasswordRequest;
import com.theholymatrimony.backend.auth.passwordreset.dto.VerifyPasswordResetOtpRequest;
import com.theholymatrimony.backend.auth.passwordreset.dto.VerifyPasswordResetOtpResponse;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.auth.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 15;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESET_TOKEN_BYTE_LENGTH = 48;

    private final UserRepository userRepository;

    private final PasswordResetOtpRepository
            passwordResetOtpRepository;

    private final PasswordEncoder passwordEncoder;

    private final EmailOtpDeliveryService
            emailOtpDeliveryService;

    private final RefreshTokenService
            refreshTokenService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Transactional
    public PasswordResetResponse requestOtp(
            ForgotPasswordRequest request
    ) {
        String email = normalizeEmail(
                request.email()
        );

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        /*
         * Do not reveal whether the email exists.
         * This helps prevent account enumeration.
         */
        if (user == null) {
            return genericOtpResponse();
        }

        enforceResendCooldown(user);

        passwordResetOtpRepository.deleteByUser(
                user
        );

        String otp = generateOtp();

        LocalDateTime now =
                LocalDateTime.now();

        PasswordResetOtp resetOtp =
                new PasswordResetOtp();

        resetOtp.setUser(user);

        resetOtp.setOtpHash(
                passwordEncoder.encode(otp)
        );

        resetOtp.setAttempts(0);
        resetOtp.setOtpVerified(false);
        resetOtp.setConsumed(false);
        resetOtp.setCreatedAt(now);
        resetOtp.setLastSentAt(now);

        resetOtp.setOtpExpiresAt(
                now.plusMinutes(
                        OTP_EXPIRY_MINUTES
                )
        );

        passwordResetOtpRepository.save(
                resetOtp
        );

        emailOtpDeliveryService
                .sendPasswordResetOtp(
                        user,
                        otp
                );

        return genericOtpResponse();
    }

    @Transactional
    public VerifyPasswordResetOtpResponse verifyOtp(
            VerifyPasswordResetOtpRequest request
    ) {
        User user = findUser(
                request.email()
        );

        PasswordResetOtp resetOtp =
                passwordResetOtpRepository
                        .findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
                                user
                        )
                        .orElseThrow(
                                () ->
                                        invalidOtpException()
                        );

        if (resetOtp.isOtpExpired()) {
            resetOtp.setConsumed(true);

            passwordResetOtpRepository.save(
                    resetOtp
            );

            throw new IllegalArgumentException(
                    "The OTP has expired. Please request a new OTP."
            );
        }

        if (
                resetOtp.getAttempts()
                        >= MAX_ATTEMPTS
        ) {
            resetOtp.setConsumed(true);

            passwordResetOtpRepository.save(
                    resetOtp
            );

            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        resetOtp.setAttempts(
                resetOtp.getAttempts() + 1
        );

        if (
                !passwordEncoder.matches(
                        request.otp(),
                        resetOtp.getOtpHash()
                )
        ) {
            passwordResetOtpRepository.save(
                    resetOtp
            );

            throw invalidOtpException();
        }

        String rawResetToken =
                generateResetToken();

        resetOtp.setOtpVerified(true);

        resetOtp.setResetTokenHash(
                hashToken(rawResetToken)
        );

        resetOtp.setResetTokenExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(
                                RESET_TOKEN_EXPIRY_MINUTES
                        )
        );

        passwordResetOtpRepository.save(
                resetOtp
        );

        return new VerifyPasswordResetOtpResponse(
                true,
                "OTP verified. You may now create a new password.",
                rawResetToken
        );
    }

    @Transactional
    public PasswordResetResponse resetPassword(
            ResetPasswordRequest request,
            String clientIp
    ) {
        validatePasswords(request);

        String resetTokenHash =
                hashToken(
                        request.resetToken()
                );

        PasswordResetOtp resetOtp =
                passwordResetOtpRepository
                        .findByResetTokenHashAndConsumedFalse(
                                resetTokenHash
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "The password reset session is invalid or has expired."
                                        )
                        );

        if (
                !Boolean.TRUE.equals(
                        resetOtp.getOtpVerified()
                )
        ) {
            throw new IllegalArgumentException(
                    "The password reset OTP has not been verified."
            );
        }

        if (resetOtp.isResetTokenExpired()) {
            resetOtp.setConsumed(true);

            passwordResetOtpRepository.save(
                    resetOtp
            );

            throw new IllegalArgumentException(
                    "The password reset session has expired. Please start again."
            );
        }

        User user = resetOtp.getUser();

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);

        resetOtp.setConsumed(true);

        passwordResetOtpRepository.save(
                resetOtp
        );

        /*
         * Sign the user out from every existing
         * device after changing the password.
         */
        refreshTokenService
                .revokeAllUserTokens(
                        user,
                        clientIp,
                        "Password reset completed"
                );

        return new PasswordResetResponse(
                true,
                "Password reset successful. You can now sign in with your new password."
        );
    }

    private void enforceResendCooldown(
            User user
    ) {
        passwordResetOtpRepository
                .findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
                        user
                )
                .ifPresent(existing -> {
                    long elapsedSeconds =
                            Duration.between(
                                    existing.getLastSentAt(),
                                    LocalDateTime.now()
                            ).getSeconds();

                    if (
                            elapsedSeconds
                                    < RESEND_COOLDOWN_SECONDS
                    ) {
                        long remainingSeconds =
                                RESEND_COOLDOWN_SECONDS
                                        - elapsedSeconds;

                        throw new IllegalArgumentException(
                                "Please wait "
                                        + remainingSeconds
                                        + " seconds before requesting another OTP."
                        );
                    }
                });
    }

    private void validatePasswords(
            ResetPasswordRequest request
    ) {
        if (
                !request.newPassword()
                        .equals(
                                request.confirmPassword()
                        )
        ) {
            throw new IllegalArgumentException(
                    "New password and confirm password do not match."
            );
        }
    }

    private User findUser(
            String rawEmail
    ) {
        String email =
                normalizeEmail(rawEmail);

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        this::invalidOtpException
                );
    }

    private String normalizeEmail(
            String rawEmail
    ) {
        if (
                rawEmail == null
                        || rawEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        return rawEmail
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String generateOtp() {
        int value =
                secureRandom.nextInt(
                        900_000
                ) + 100_000;

        return Integer.toString(value);
    }

    private String generateResetToken() {
        byte[] tokenBytes =
                new byte[
                        RESET_TOKEN_BYTE_LENGTH
                ];

        secureRandom.nextBytes(
                tokenBytes
        );

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        tokenBytes
                );
    }

    private String hashToken(
            String rawToken
    ) {
        if (
                rawToken == null
                        || rawToken.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Reset token is required."
            );
        }

        try {
            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            rawToken.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of()
                    .formatHex(hash);

        } catch (
                NoSuchAlgorithmException exception
        ) {
            throw new IllegalStateException(
                    "SHA-256 hashing is unavailable.",
                    exception
            );
        }
    }

    private IllegalArgumentException
    invalidOtpException() {
        return new IllegalArgumentException(
                "The OTP is invalid or has expired."
        );
    }

    private PasswordResetResponse
    genericOtpResponse() {
        return new PasswordResetResponse(
                true,
                "If an account exists with that email, a password reset OTP has been sent."
        );
    }
}