package com.theholymatrimony.backend.websocket.security;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class WebSocketAuthChannelInterceptor
        implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    public WebSocketAuthChannelInterceptor(
            JwtDecoder jwtDecoder
    ) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        /*
         * Important:
         * Get the accessor already associated
         * with this STOMP message.
         *
         * Do not use StompHeaderAccessor.wrap()
         * here because that creates another
         * accessor and the Principal may not
         * remain attached to the session.
         */
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        StompCommand command =
                accessor.getCommand();

        /*
         * Authenticate only CONNECT.
         * Spring carries this Principal into
         * future SEND and SUBSCRIBE frames.
         */
        if (!StompCommand.CONNECT.equals(command)) {
            return message;
        }

        String authorization =
                accessor.getFirstNativeHeader(
                        "Authorization"
                );

        if (
                authorization == null ||
                !authorization.startsWith("Bearer ")
        ) {
            throw new IllegalArgumentException(
                    "Missing WebSocket Authorization header"
            );
        }

        String token = authorization
                .substring(7)
                .trim();

        if (token.isBlank()) {
            throw new IllegalArgumentException(
                    "WebSocket access token is empty"
            );
        }

        Jwt jwt = jwtDecoder.decode(token);

        String tokenType =
                jwt.getClaimAsString("type");

        if (!"access".equals(tokenType)) {
            throw new IllegalArgumentException(
                    "Invalid WebSocket token type"
            );
        }

        String email = jwt.getSubject();

        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "JWT subject is missing"
            );
        }

        List<String> authorityNames =
                jwt.getClaimAsStringList(
                        "authorities"
                );

        if (authorityNames == null) {
            authorityNames = List.of();
        }

        List<SimpleGrantedAuthority> authorities =
                authorityNames.stream()
                        .filter(Objects::nonNull)
                        .filter(value ->
                                !value.isBlank()
                        )
                        .map(
                                SimpleGrantedAuthority::new
                        )
                        .toList();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        authorities
                );

        accessor.setUser(authentication);

        return message;
    }
}
