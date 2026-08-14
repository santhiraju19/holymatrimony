package com.theholymatrimony.backend.security;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
@RequiredArgsConstructor
public class ActiveAccountValidator {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User requireActiveUser(String email) {

        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException(
                    "Authenticated user was not found."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase(Locale.ROOT);

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Authenticated user was not found."
                        )
                );

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new DisabledException(
                    accountUnavailableMessage(user)
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new DisabledException(
                    accountUnavailableMessage(user)
            );
        }

        return user;
    }

    private String accountUnavailableMessage(User user) {

        UserStatus status = user.getStatus();

        if (status == null) {
            return "This account is currently unavailable.";
        }

        return switch (status) {
            case SUSPENDED ->
                    "This account has been suspended.";

            case BLOCKED ->
                    "This account has been blocked.";

            case DEACTIVATED ->
                    "This account has been deactivated.";

            case ACTIVE ->
                    "This account is currently unavailable.";
        };
    }
}