package com.theholymatrimony.backend.config;

import com.theholymatrimony.backend.websocket.security.WebSocketAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig
        implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor
            webSocketAuthChannelInterceptor;

    @Override
    public void configureMessageBroker(
            MessageBrokerRegistry registry
    ) {
        /*
         * Backend application destinations.
         *
         * Frontend publishes to:
         * /app/chat.send
         */
        registry.setApplicationDestinationPrefixes(
                "/app"
        );

        /*
         * Server-delivered destinations.
         *
         * Frontend subscribes to:
         * /user/queue/messages
         * /user/queue/errors
         */
        registry.enableSimpleBroker(
                "/queue",
                "/topic"
        );

        registry.setUserDestinationPrefix(
                "/user"
        );
    }

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {
        registry
                .addEndpoint("/ws")
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://theholymatrimony.com",
                        "https://www.theholymatrimony.com"
                );

        registry
                .addEndpoint("/ws-sockjs")
                .setAllowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://theholymatrimony.com",
                        "https://www.theholymatrimony.com"
                )
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {
        registration.interceptors(
                webSocketAuthChannelInterceptor
        );
    }
}
