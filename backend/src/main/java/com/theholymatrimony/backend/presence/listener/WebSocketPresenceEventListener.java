
package com.theholymatrimony.backend.presence.listener;

import com.theholymatrimony.backend.presence.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketPresenceEventListener {

    private final PresenceService presenceService;

    @EventListener
    public void handleSessionConnected(
            SessionConnectEvent event
    ) {
        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(
                        event.getMessage()
                );

        Principal principal =
                accessor.getUser();

        String sessionId =
                accessor.getSessionId();

        if (
                principal == null ||
                principal.getName() == null ||
                principal.getName().isBlank() ||
                sessionId == null ||
                sessionId.isBlank()
        ) {
            return;
        }

        try {
            presenceService.userConnected(
                    principal.getName(),
                    sessionId
            );

            log.info(
                    "[Presence] Connected: user={}, session={}",
                    principal.getName(),
                    sessionId
            );
        } catch (RuntimeException exception) {
            log.warn(
                    "[Presence] Unable to register connection: {}",
                    exception.getMessage()
            );
        }
    }

    @EventListener
    public void handleSessionDisconnected(
            SessionDisconnectEvent event
    ) {
        String sessionId =
                event.getSessionId();

        if (
                sessionId == null ||
                sessionId.isBlank()
        ) {
            return;
        }

        presenceService.userDisconnected(
                sessionId
        );

        log.info(
                "[Presence] Disconnected: session={}",
                sessionId
        );
    }
}