package com.theholymatrimony.backend.auth.service;

import com.theholymatrimony.backend.auth.dto.AuthResponse;
import com.theholymatrimony.backend.auth.dto.AuthSession;
import com.theholymatrimony.backend.auth.dto.LoginRequest;
import com.theholymatrimony.backend.auth.dto.RegisterRequest;
import com.theholymatrimony.backend.auth.dto.RegisterResponse;
import com.theholymatrimony.backend.auth.entity.RefreshToken;
import com.theholymatrimony.backend.auth.entity.User;
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

    private static final String TOKEN_TYPE = "Bearer";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail =
                normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account already exists with this email."
            );
        }

        User user = new User();
        user.setFullName(
                normalizeName(request.getFullName())
        );
        user.setEmail(normalizedEmail);
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                "Registration successful."
        );
    }

    @Transactional
    public AuthSession login(
            LoginRequest request,
            String clientIp
    ) {
        String normalizedEmail =
                normalizeEmail(request.getEmail());

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                normalizedEmail,
                                request.getPassword()
                        )
                );

        User user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User account not found."
                        )
                );

        List<String> authorities = authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String accessToken =
                jwtService.generateAccessToken(
                        user.getEmail(),
                        authorities
                );

        String refreshToken =
                refreshTokenService.createRefreshToken(
                        user,
                        clientIp
                );

        AuthResponse response = new AuthResponse(
                accessToken,
                TOKEN_TYPE,
                jwtService.getAccessTokenExpirationMillis(),
                user.getEmail(),
                user.getFullName()
        );

        return new AuthSession(
                response,
                refreshToken
        );
    }

    @Transactional
    public AuthSession refresh(
            String currentRefreshToken,
            String clientIp
    ) {
        RefreshToken storedToken =
                refreshTokenService.validateRefreshToken(
                        currentRefreshToken
                );

        User user = storedToken.getUser();

        String accessToken =
                jwtService.generateAccessToken(
                        user.getEmail(),
                        List.of("ROLE_USER")
                );

        String replacementRefreshToken =
                refreshTokenService.rotateRefreshToken(
                        currentRefreshToken,
                        clientIp
                );

        AuthResponse response = new AuthResponse(
                accessToken,
                TOKEN_TYPE,
                jwtService.getAccessTokenExpirationMillis(),
                user.getEmail(),
                user.getFullName()
        );

        return new AuthSession(
                response,
                replacementRefreshToken
        );
    }

    @Transactional
    public void logout(
            String refreshToken,
            String clientIp
    ) {
        refreshTokenService.revokeRefreshToken(
                refreshToken,
                clientIp,
                "User logged out"
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException(
                    "Full name is required."
            );
        }

        return fullName
                .trim()
                .replaceAll("\\s+", " ");
    }
}