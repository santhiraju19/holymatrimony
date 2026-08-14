package com.theholymatrimony.backend.websocket.security;

import com.theholymatrimony.backend.security.ActiveAccountValidator;

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

import java.security.Principal;
import java.util.List;
import java.util.Objects;

@Component
public class WebSocketAuthChannelInterceptor
        implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    private final ActiveAccountValidator
            activeAccountValidator;

    public WebSocketAuthChannelInterceptor(
            JwtDecoder jwtDecoder,
            ActiveAccountValidator activeAccountValidator
    ) {
        this.jwtDecoder = jwtDecoder;
        this.activeAccountValidator =
                activeAccountValidator;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {

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

        if (command == null) {
            return message;
        }

        /*
         * CONNECT
         *
         * Decode the JWT and establish the
         * authenticated WebSocket Principal.
         */
        if (StompCommand.CONNECT.equals(command)) {

            authenticateConnect(accessor);

            return message;
        }

        /*
         * SEND and SUBSCRIBE
         *
         * Re-check the account against the database.
         *
         * This prevents an already-connected member
         * from continuing to send messages or create
         * subscriptions after an administrator has
         * suspended or blocked the account.
         */
        if (
                StompCommand.SEND.equals(command) ||
                StompCommand.SUBSCRIBE.equals(command)
        ) {

            Principal principal =
                    accessor.getUser();

            if (principal == null) {
                throw new IllegalArgumentException(
                        "WebSocket user is not authenticated"
                );
            }

            activeAccountValidator.requireActiveUser(
                    principal.getName()
            );
        }

        return message;
    }

    private void authenticateConnect(
            StompHeaderAccessor accessor
    ) {

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

        String token =
                authorization
                        .substring(7)
                        .trim();

        if (token.isBlank()) {
            throw new IllegalArgumentException(
                    "WebSocket access token is empty"
            );
        }

        Jwt jwt =
                jwtDecoder.decode(token);

        String tokenType =
                jwt.getClaimAsString("type");

        if (!"access".equals(tokenType)) {
            throw new IllegalArgumentException(
                    "Invalid WebSocket token type"
            );
        }

        String email =
                jwt.getSubject();

        /*
         * Validate the current database status,
         * not merely the JWT.
         */
        activeAccountValidator.requireActiveUser(
                email
        );

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
                        .map(String::trim)
                        .filter(value ->
                                !value.isBlank()
                        )
                        .distinct()
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
    }
}