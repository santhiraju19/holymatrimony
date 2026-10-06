package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.auth.emailotp.EmailOtpService;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.passwordreset.PasswordResetService;
import com.theholymatrimony.backend.auth.passwordreset.dto.ForgotPasswordRequest;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminUserServiceImplTests {

    private UserRepository userRepository;
    private EmailOtpService emailOtpService;
    private PasswordResetService passwordResetService;

    private AdminUserServiceImpl service;

    @BeforeEach
    void setUp() {

        userRepository =
                mock(UserRepository.class);

        emailOtpService =
                mock(EmailOtpService.class);

        passwordResetService =
                mock(PasswordResetService.class);

        service =
                new AdminUserServiceImpl(
                        userRepository,
                        emailOtpService,
                        passwordResetService
                );
    }

    @Test
    void sendVerificationEmailUsesExistingOtpServiceForPendingUser() {

        UUID userId =
                UUID.randomUUID();

        User user =
                User.builder()
                        .id(userId)
                        .fullName("Pending Member")
                        .email("pending@example.com")
                        .password("encoded-password")
                        .emailVerified(false)
                        .build();

        when(
                userRepository.findById(userId)
        ).thenReturn(
                Optional.of(user)
        );

        service.sendVerificationEmail(
                userId
        );

        verify(emailOtpService)
                .resend(
                        "pending@example.com"
                );
    }

    @Test
    void sendVerificationEmailRejectsAlreadyVerifiedUser() {

        UUID userId =
                UUID.randomUUID();

        User user =
                User.builder()
                        .id(userId)
                        .fullName("Verified Member")
                        .email("verified@example.com")
                        .password("encoded-password")
                        .emailVerified(true)
                        .build();

        when(
                userRepository.findById(userId)
        ).thenReturn(
                Optional.of(user)
        );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.sendVerificationEmail(
                                        userId
                                )
                );

        assertEquals(
                "This user's email address is already verified.",
                exception.getMessage()
        );

        verify(
                emailOtpService,
                never()
        ).resend(
                "verified@example.com"
        );
    }

    @Test
    void sendPasswordResetEmailUsesExistingPasswordResetService() {

        UUID userId =
                UUID.randomUUID();

        User user =
                User.builder()
                        .id(userId)
                        .fullName("Reset Member")
                        .email("reset@example.com")
                        .password("encoded-password")
                        .emailVerified(true)
                        .build();

        when(
                userRepository.findById(userId)
        ).thenReturn(
                Optional.of(user)
        );

        service.sendPasswordResetEmail(
                userId
        );

        verify(passwordResetService)
                .requestOtp(
                        argThat(
                                request ->
                                        request != null
                                                && "reset@example.com"
                                                .equals(
                                                        request.email()
                                                )
                        )
                );
    }

    @Test
    void adminEmailActionRejectsUnknownUser() {

        UUID userId =
                UUID.randomUUID();

        when(
                userRepository.findById(userId)
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.sendVerificationEmail(
                                userId
                        )
        );

        verify(
                emailOtpService,
                never()
        ).resend(
                org.mockito.ArgumentMatchers.anyString()
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                org.mockito.ArgumentMatchers.any(
                        ForgotPasswordRequest.class
                )
        );
    }
}
