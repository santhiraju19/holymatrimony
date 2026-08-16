package com.theholymatrimony.backend.verification.mobile;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.verification.dto.MobileOtpResponse;
import com.theholymatrimony.backend.verification.entity.MemberVerification;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;
import com.theholymatrimony.backend.verification.repository.MemberVerificationRepository;

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
public class MobileVerificationOtpService {

    private static final int
            OTP_EXPIRY_MINUTES = 10;

    private static final int
            RESEND_COOLDOWN_SECONDS = 60;

    private static final int
            MAX_ATTEMPTS = 5;

    private final UserRepository
            userRepository;

    private final MobileVerificationOtpRepository
            otpRepository;

    private final MemberVerificationRepository
            memberVerificationRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final SmsSender
            smsSender;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Transactional
    public MobileOtpResponse requestOtp(
            String email
    ) {

        User user =
                findUser(email);

        String mobile =
                requireMobile(user);

        if (isMobileVerified(user)) {

            return response(
                    mobile,
                    true,
                    "Mobile verification is already complete."
            );
        }

        issueOtp(
                user,
                mobile
        );

        return response(
                mobile,
                false,
                "A verification OTP has been sent to your mobile."
        );
    }

    @Transactional
    public MobileOtpResponse resendOtp(
            String email
    ) {

        User user =
                findUser(email);

        String mobile =
                requireMobile(user);

        if (isMobileVerified(user)) {

            return response(
                    mobile,
                    true,
                    "Mobile verification is already complete."
            );
        }

        issueOtp(
                user,
                mobile
        );

        return response(
                mobile,
                false,
                "A new verification OTP has been sent."
        );
    }

    @Transactional
    public MobileOtpResponse verifyOtp(
            String email,
            String otp
    ) {

        User user =
                findUser(email);

        String mobile =
                requireMobile(user);

        if (isMobileVerified(user)) {

            return response(
                    mobile,
                    true,
                    "Mobile verification is already complete."
            );
        }

        MobileVerificationOtp storedOtp =
                otpRepository
                        .findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
                                user
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "No active mobile OTP was found. Please request a new OTP."
                                        )
                        );

        if (
                !mobile.equals(
                        storedOtp.getMobile()
                )
        ) {

            storedOtp.setConsumed(true);

            otpRepository.save(
                    storedOtp
            );

            throw new IllegalArgumentException(
                    "Your mobile number changed. Please request a new OTP."
            );
        }

        if (storedOtp.isExpired()) {

            storedOtp.setConsumed(true);

            otpRepository.save(
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

            otpRepository.save(
                    storedOtp
            );

            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Please request a new OTP."
            );
        }

        storedOtp.setAttempts(
                storedOtp.getAttempts() + 1
        );

        String normalizedOtp =
                otp == null
                        ? ""
                        : otp.trim();

        if (
                !passwordEncoder.matches(
                        normalizedOtp,
                        storedOtp.getOtpHash()
                )
        ) {

            otpRepository.save(
                    storedOtp
            );

            throw new IllegalArgumentException(
                    "The OTP entered is incorrect."
            );
        }

        storedOtp.setConsumed(true);

        otpRepository.save(
                storedOtp
        );

        MemberVerification verification =
                memberVerificationRepository
                        .findByUserIdAndVerificationType(
                                user.getId(),
                                VerificationType.MOBILE
                        )
                        .orElseGet(
                                () ->
                                        MemberVerification
                                                .builder()
                                                .user(user)
                                                .verificationType(
                                                        VerificationType.MOBILE
                                                )
                                                .verificationStatus(
                                                        VerificationStatus.NOT_SUBMITTED
                                                )
                                                .build()
                        );

        verification.approveAutomatically(
                "Mobile number verified successfully using OTP."
        );

        memberVerificationRepository.save(
                verification
        );

        return response(
                mobile,
                true,
                "Mobile verification completed successfully."
        );
    }

    private void issueOtp(
            User user,
            String mobile
    ) {

        otpRepository
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

                        long remaining =
                                RESEND_COOLDOWN_SECONDS -
                                        elapsedSeconds;

                        throw new IllegalArgumentException(
                                "Please wait " +
                                        remaining +
                                        " seconds before requesting another OTP."
                        );
                    }
                });

        otpRepository.deleteByUser(
                user
        );

        String otp =
                generateOtp();

        LocalDateTime now =
                LocalDateTime.now();

        MobileVerificationOtp entity =
                new MobileVerificationOtp();

        entity.setUser(
                user
        );

        entity.setMobile(
                mobile
        );

        entity.setOtpHash(
                passwordEncoder.encode(
                        otp
                )
        );

        entity.setAttempts(
                0
        );

        entity.setConsumed(
                false
        );

        entity.setCreatedAt(
                now
        );

        entity.setLastSentAt(
                now
        );

        entity.setExpiresAt(
                now.plusMinutes(
                        OTP_EXPIRY_MINUTES
                )
        );

        otpRepository.save(
                entity
        );

        smsSender.sendVerificationOtp(
                mobile,
                otp
        );
    }

    private boolean isMobileVerified(
            User user
    ) {

        return memberVerificationRepository
                .existsByUserIdAndVerificationTypeAndVerificationStatus(
                        user.getId(),
                        VerificationType.MOBILE,
                        VerificationStatus.APPROVED
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
                    "Authenticated user is required."
            );
        }

        String email =
                rawEmail
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userRepository
                .findByEmail(
                        email
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Authenticated user was not found."
                                )
                );
    }

    private String requireMobile(
            User user
    ) {

        String mobile =
                user.getMobile();

        if (
                mobile == null ||
                mobile.isBlank()
        ) {

            throw new IllegalStateException(
                    "Add a mobile number to your account before requesting verification."
            );
        }

        String normalized =
                mobile
                        .trim()
                        .replaceAll(
                                "[\\s()\\-]",
                                ""
                        );

        /*
         * Indian 10-digit mobile number.
         *
         * 9154503430
         * becomes
         * +919154503430
         */
        if (
                normalized.matches(
                        "^[6-9]\\d{9}$"
                )
        ) {

            return "+91" +
                    normalized;
        }

        /*
         * Indian number containing country
         * code but without +.
         *
         * 919154503430
         * becomes
         * +919154503430
         */
        if (
                normalized.matches(
                        "^91[6-9]\\d{9}$"
                )
        ) {

            return "+" +
                    normalized;
        }

        /*
         * Already valid international E.164.
         */
        if (
                normalized.matches(
                        "^\\+[1-9]\\d{7,14}$"
                )
        ) {

            return normalized;
        }

        throw new IllegalStateException(
                "Your account mobile number is not valid."
        );
    }

    private String generateOtp() {

        int value =
                secureRandom.nextInt(
                        900_000
                ) +
                        100_000;

        return Integer.toString(
                value
        );
    }

    private MobileOtpResponse response(
            String mobile,
            boolean verified,
            String message
    ) {

        return new MobileOtpResponse(
                maskMobile(
                        mobile
                ),
                verified,
                message
        );
    }

    private String maskMobile(
            String mobile
    ) {

        if (
                mobile == null ||
                mobile.length() <= 4
        ) {

            return "****";
        }

        return "********" +
                mobile.substring(
                        mobile.length() - 4
                );
    }
}