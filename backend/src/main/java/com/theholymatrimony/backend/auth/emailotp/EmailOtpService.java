package com.theholymatrimony.backend.auth.emailotp;

import com.theholymatrimony.backend.auth.dto.EmailVerificationResponse;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailOtpService {

    private static final int
            OTP_EXPIRY_MINUTES = 10;

    private static final int
            RESEND_COOLDOWN_SECONDS = 60;

    private static final int
            MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;

    private final EmailOtpRepository
            emailOtpRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final EmailOtpDeliveryService
            deliveryService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Transactional
    public void issueRegistrationOtp(
            User user
    ) {
        issueOtp(
                user,
                true
        );
    }

    @Transactional
    public EmailVerificationResponse verify(
            String rawEmail,
            String otp
    ) {
        User user =
                findUser(rawEmail);

        if (
                user.isEmailVerificationComplete()
        ) {
            return response(
                    user,
                    "Email verification is already complete."
            );
        }

        EmailOtp storedOtp =
                emailOtpRepository
                        .findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "No active email OTP was found. Please request a new OTP."
                                        )
                        );

        if (storedOtp.isExpired()) {
            storedOtp.setConsumed(true);

            emailOtpRepository.save(
                    storedOtp
            );

            throw new IllegalArgumentException(
                    "The OTP has expired. Please request a new OTP."
            );
        }

        if (
                storedOtp.getAttempts() >=
                        MAX_ATTEMPTS
        ) {
            storedOtp.setConsumed(true);

            emailOtpRepository.save(
                    storedOtp
            );

            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        storedOtp.setAttempts(
                storedOtp.getAttempts() + 1
        );

        if (
                !passwordEncoder.matches(
                        otp,
                        storedOtp.getOtpHash()
                )
        ) {
            emailOtpRepository.save(
                    storedOtp
            );

            throw new IllegalArgumentException(
                    "The OTP entered is incorrect."
            );
        }

        storedOtp.setConsumed(true);

        emailOtpRepository.save(
                storedOtp
        );

        user.setEmailVerified(true);

        user.setEmailVerifiedAt(
                LocalDateTime.now()
        );

        User savedUser =
                userRepository.save(user);

        return response(
                savedUser,
                "Email verification completed. You can now sign in."
        );
    }

    @Transactional
    public EmailVerificationResponse resend(
            String rawEmail
    ) {
        User user =
                findUser(rawEmail);

        if (
                user.isEmailVerificationComplete()
        ) {
            return response(
                    user,
                    "Email verification is already complete."
            );
        }

        issueOtp(
                user,
                false
        );

        return response(
                user,
                "A new email OTP has been sent."
        );
    }

    @Transactional(readOnly = true)
    public EmailVerificationResponse status(
            String rawEmail
    ) {
        User user =
                findUser(rawEmail);

        return response(
                user,
                "Email verification status loaded."
        );
    }

    private void issueOtp(
            User user,
            boolean bypassCooldown
    ) {
        if (!bypassCooldown) {
            emailOtpRepository
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
                                elapsedSeconds <
                                        RESEND_COOLDOWN_SECONDS
                        ) {
                            long remainingSeconds =
                                    RESEND_COOLDOWN_SECONDS -
                                            elapsedSeconds;

                            throw new IllegalArgumentException(
                                    "Please wait " +
                                            remainingSeconds +
                                            " seconds before requesting another OTP."
                            );
                        }
                    });
        }

        emailOtpRepository.deleteByUser(
                user
        );

        String otp =
                generateOtp();

        LocalDateTime now =
                LocalDateTime.now();

        EmailOtp emailOtp =
                new EmailOtp();

        emailOtp.setUser(user);

        emailOtp.setOtpHash(
                passwordEncoder.encode(
                        otp
                )
        );

        emailOtp.setAttempts(0);
        emailOtp.setConsumed(false);
        emailOtp.setCreatedAt(now);
        emailOtp.setLastSentAt(now);

        emailOtp.setExpiresAt(
                now.plusMinutes(
                        OTP_EXPIRY_MINUTES
                )
        );

        emailOtpRepository.save(
                emailOtp
        );

        deliveryService.send(
                user,
                otp
        );
    }

    private String generateOtp() {
        int value =
                secureRandom.nextInt(
                        900_000
                ) + 100_000;

        return Integer.toString(
                value
        );
    }

    private User findUser(
            String rawEmail
    ) {
        if (
                rawEmail == null ||
                rawEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        String email =
                rawEmail
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "No account was found with this email."
                                )
                );
    }

    private EmailVerificationResponse response(
            User user,
            String message
    ) {
        return new EmailVerificationResponse(
                user.getId(),
                user.getEmail(),
                user.isEmailVerificationComplete(),
                message
        );
    }
}