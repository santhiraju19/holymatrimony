package com.theholymatrimony.backend.presence.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.presence.dto.PresenceStatusResponse;
import com.theholymatrimony.backend.privacy.service.PrivacyPolicyService;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PresenceService {

    private final UserRepository
            userRepository;

    private final PrivacyPolicyService
            privacyPolicyService;

    /*
     * User -> active WebSocket session IDs.
     *
     * Multiple sessions are supported so a user
     * can be logged in from multiple tabs/devices.
     */
    private final Map<UUID, Set<String>>
            activeSessions =
            new ConcurrentHashMap<>();

    /*
     * WebSocket session -> user.
     *
     * Used when SessionDisconnectEvent only gives
     * us the session ID.
     */
    private final Map<String, UUID>
            sessionUsers =
            new ConcurrentHashMap<>();

    /*
     * Fast in-memory Last Seen cache.
     *
     * PostgreSQL remains the durable source.
     */
    private final Map<UUID, LocalDateTime>
            lastSeenTimes =
            new ConcurrentHashMap<>();

    /*
     * ============================================================
     * USER CONNECTED
     * ============================================================
     */

    @Transactional(readOnly = true)
    public synchronized void userConnected(
            String email,
            String sessionId
    ) {

        if (
                !StringUtils.hasText(email) ||
                !StringUtils.hasText(sessionId)
        ) {
            return;
        }

        User user =
                getUserByEmail(
                        email
                );

        UUID userId =
                user.getId();

        Set<String> sessions =
                activeSessions
                        .computeIfAbsent(
                                userId,
                                ignored ->
                                        ConcurrentHashMap
                                                .newKeySet()
                        );

        sessions.add(
                sessionId
        );

        sessionUsers.put(
                sessionId,
                userId
        );
    }

    /*
     * ============================================================
     * USER DISCONNECTED
     * ============================================================
     */

    @Transactional
    public synchronized void userDisconnected(
            String sessionId
    ) {

        if (
                !StringUtils.hasText(
                        sessionId
                )
        ) {
            return;
        }

        UUID userId =
                sessionUsers.remove(
                        sessionId
                );

        if (userId == null) {
            return;
        }

        Set<String> sessions =
                activeSessions.get(
                        userId
                );

        if (sessions == null) {
            return;
        }

        sessions.remove(
                sessionId
        );

        /*
         * User may still be connected through
         * another tab or another device.
         */
        if (!sessions.isEmpty()) {
            return;
        }

        activeSessions.remove(
                userId
        );

        LocalDateTime now =
                LocalDateTime.now();

        lastSeenTimes.put(
                userId,
                now
        );

        /*
         * Persist Last Seen so it survives
         * application/server restarts.
         */
        userRepository
                .findById(
                        userId
                )
                .ifPresent(user -> {

                    user.setLastSeenAt(
                            now
                    );

                    userRepository.save(
                            user
                    );
                });
    }

    /*
     * ============================================================
     * GET PRESENCE
     * ============================================================
     */

    @Transactional(readOnly = true)
    public PresenceStatusResponse getPresence(
            String viewerEmail,
            UUID targetUserId
    ) {

        if (
                !StringUtils.hasText(
                        viewerEmail
                )
        ) {
            throw new IllegalArgumentException(
                    "Authenticated viewer is required"
            );
        }

        if (targetUserId == null) {
            throw new IllegalArgumentException(
                    "Target user ID is required"
            );
        }

        User viewer =
                getUserByEmail(
                        viewerEmail
                );

        User target =
                getUserById(
                        targetUserId
                );

        boolean canSeeOnline =
                privacyPolicyService
                        .canSeeOnlineStatus(
                                viewer,
                                target
                        );

        boolean canSeeLastSeen =
                privacyPolicyService
                        .canSeeLastSeen(
                                viewer,
                                target
                        );

        Set<String> sessions =
                activeSessions.get(
                        targetUserId
                );

        boolean actuallyOnline =
                sessions != null &&
                !sessions.isEmpty();

        boolean visibleOnline =
                canSeeOnline &&
                actuallyOnline;

        /*
         * Prefer the fast in-memory value if
         * available, otherwise use PostgreSQL.
         */
        LocalDateTime lastSeen =
                lastSeenTimes.get(
                        targetUserId
                );

        if (lastSeen == null) {
            lastSeen =
                    target.getLastSeenAt();
        }

        LocalDateTime visibleLastSeen =
                canSeeLastSeen
                        ? lastSeen
                        : null;

        return PresenceStatusResponse
                .builder()
                .userId(
                        targetUserId
                )
                .online(
                        visibleOnline
                )
                .lastSeenAt(
                        visibleLastSeen
                )
                .build();
    }

    /*
     * ============================================================
     * USER LOOKUPS
     * ============================================================
     */

    private User getUserByEmail(
            String email
    ) {

        return userRepository
                .findByEmail(
                        email.trim()
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Authenticated user was not found"
                                )
                );
    }

    private User getUserById(
            UUID userId
    ) {

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Target user was not found"
                                )
                );
    }
}