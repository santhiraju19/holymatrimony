package com.theholymatrimony.backend.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.theholymatrimony.backend.security.jwt.JwtAuthenticationConverter;
import com.theholymatrimony.backend.security.jwt.JwtProperties;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProperties jwtProperties;

    private final JwtAuthenticationConverter
            jwtAuthenticationConverter;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> {
                })

                .csrf(csrf ->
                        csrf.disable()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * =====================================================
                         * Public Authentication Endpoints
                         * =====================================================
                         *
                         * register
                         * login
                         * refresh
                         * logout
                         * verify OTP
                         * resend OTP
                         * forgot password
                         * password reset
                         */
                        .requestMatchers(
                                "/api/v1/auth/**"
                        )
                        .permitAll()

                        /*
                         * =====================================================
                         * Public Uploaded Files
                         * =====================================================
                         */
                        .requestMatchers(
                                "/uploads/**",
                                "/api/v1/uploads/**"
                        )
                        .permitAll()

                        /*
                         * =====================================================
                         * WebSocket Handshake
                         * =====================================================
                         */
                        .requestMatchers(
                                "/ws/**",
                                "/ws-sockjs/**"
                        )
                        .permitAll()

                        /*
                         * =====================================================
                         * Swagger / OpenAPI
                         * =====================================================
                         */
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        )
                        .permitAll()

                        /*
                         * =====================================================
                         * Razorpay Webhook
                         * =====================================================
                         *
                         * Razorpay calls this endpoint directly.
                         *
                         * It does not use the member JWT.
                         *
                         * Authentication is performed inside the webhook
                         * service using the X-Razorpay-Signature header and
                         * RAZORPAY_WEBHOOK_SECRET.
                         */
                        .requestMatchers(
                                "/api/v1/payments/webhook/razorpay"
                        )
                        .permitAll()

                        /*
                         * =====================================================
                         * Public Health Check
                         * =====================================================
                         *
                         * Used by deployment automation and infrastructure
                         * monitoring to confirm that the backend is alive.
                         *
                         * Only the health endpoint is public.
                         * Other Actuator endpoints remain protected.
                         */
                      .requestMatchers(
        "/actuator/health"
)
.permitAll()

                        /*
                         * =====================================================
                         * Admin API
                         * =====================================================
                         */
                        .requestMatchers(
                                "/api/v1/admin/**"
                        )
                        .hasRole("ADMIN")

                        /*
                         * =====================================================
                         * All Remaining API Requests
                         * =====================================================
                         *
                         * Requires a valid JWT.
                         */
                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter
                                )
                        )
                );

        return http.build();
    }

    /*
     * ============================================================
     * JWT Decoder
     * ============================================================
     */

    @Bean
    JwtDecoder jwtDecoder() {

        SecretKey secretKey =
                createSecretKey();

        return NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(
                        MacAlgorithm.HS256
                )
                .build();
    }

    /*
     * ============================================================
     * JWT Encoder
     * ============================================================
     */

    @Bean
    JwtEncoder jwtEncoder() {

        SecretKey secretKey =
                createSecretKey();

        return new NimbusJwtEncoder(
                new ImmutableSecret<>(
                        secretKey
                )
        );
    }

    /*
     * ============================================================
     * Password Encoder
     * ============================================================
     */

    @Bean
    PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    /*
     * ============================================================
     * Authentication Manager
     * ============================================================
     */

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration
                .getAuthenticationManager();
    }

    /*
     * ============================================================
     * JWT Secret Key
     * ============================================================
     */

    private SecretKey createSecretKey() {

        String secret =
                jwtProperties.getSecret();

        if (
                secret == null ||
                secret.isBlank()
        ) {

            throw new IllegalStateException(
                    "JWT secret must be configured."
            );
        }

        byte[] secretBytes =
                secret.getBytes(
                        StandardCharsets.UTF_8
                );

        return new SecretKeySpec(
                secretBytes,
                "HmacSHA256"
        );
    }
}