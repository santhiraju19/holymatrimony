package com.theholymatrimony.backend.security;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        String normalizedEmail =
                normalizeEmail(email);

        User user =
                userRepository
                        .findByEmail(
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new UsernameNotFoundException(
                                                "Invalid email address or password."
                                        )
                        );

        Role role =
                user.getRole() == null
                        ? Role.ROLE_USER
                        : user.getRole();

        return org.springframework.security
                .core.userdetails.User
                .withUsername(
                        user.getEmail()
                )
                .password(
                        user.getPassword()
                )
                .authorities(
                        role.name()
                )
                .disabled(
                        !Boolean.TRUE.equals(
                                user.getEnabled()
                        )
                )
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .build();
    }

    private String normalizeEmail(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
        ) {
            throw new UsernameNotFoundException(
                    "Invalid email address or password."
            );
        }

        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }
}