package com.theholymatrimony.backend.auth.service;

import com.theholymatrimony.backend.auth.dto.LoginRequest;
import com.theholymatrimony.backend.auth.dto.LoginResponse;
import com.theholymatrimony.backend.auth.dto.RegisterRequest;
import com.theholymatrimony.backend.auth.dto.RegisterResponse;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.common.exception.ResourceAlreadyExistsException;
import com.theholymatrimony.backend.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already registered.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        user = userRepository.save(user);

        return RegisterResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .message("Registration Successful")
                .build();
    }

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}