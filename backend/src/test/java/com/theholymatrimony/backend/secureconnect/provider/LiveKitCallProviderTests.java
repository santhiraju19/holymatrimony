package com.theholymatrimony.backend.secureconnect.provider;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.theholymatrimony.backend.secureconnect.config.LiveKitProperties;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class LiveKitCallProviderTests {

    private LiveKitProperties properties;
    private LiveKitCallProvider provider;

    private UUID callId;
    private UUID participantUserId;

    @BeforeEach
    void setUp() {
        properties =
                new LiveKitProperties();

        properties.setUrl(
                "wss://example.livekit.cloud"
        );

        properties.setApiKey(
                "test-api-key"
        );

        /*
         * HS256 requires a sufficiently long secret.
         * This value exists only inside the unit test.
         */
        properties.setApiSecret(
                "test-livekit-secret-key-that-is-long-enough-for-hs256"
        );

        properties.setTokenTtlSeconds(300L);

        provider =
                new LiveKitCallProvider(properties);

        callId = UUID.randomUUID();
        participantUserId = UUID.randomUUID();
    }

    @Test
    void audioTokenAllowsMicrophoneOnly()
            throws Exception {

        SecureConnectCallSession call =
                call(CallMediaType.AUDIO);

        SecureConnectMediaCredentials credentials =
                provider.createParticipantCredentials(
                        call,
                        participantUserId
                );

        assertEquals(
                "wss://example.livekit.cloud",
                credentials.serverUrl()
        );

        assertEquals(
                "sc_" + callId,
                credentials.roomName()
        );

        assertEquals(
                "scu_" + participantUserId,
                credentials.participantIdentity()
        );

        assertEquals(
                CallMediaType.AUDIO,
                credentials.mediaType()
        );

        JWTClaimsSet claims =
                parse(credentials);

        assertEquals(
                "test-api-key",
                claims.getIssuer()
        );

        assertEquals(
                "scu_" + participantUserId,
                claims.getSubject()
        );

        Map<String, Object> video =
                videoGrant(claims);

        assertEquals(
                Boolean.TRUE,
                video.get("roomJoin")
        );

        assertEquals(
                "sc_" + callId,
                video.get("room")
        );

        assertEquals(
                Boolean.TRUE,
                video.get("canPublish")
        );

        assertEquals(
                Boolean.TRUE,
                video.get("canSubscribe")
        );

        assertEquals(
                Boolean.FALSE,
                video.get("canPublishData")
        );

        List<?> sources =
                (List<?>) video.get(
                        "canPublishSources"
                );

        assertEquals(
                List.of("microphone"),
                sources
        );
    }

    @Test
    void videoTokenAllowsMicrophoneAndCamera()
            throws Exception {

        SecureConnectCallSession call =
                call(CallMediaType.VIDEO);

        SecureConnectMediaCredentials credentials =
                provider.createParticipantCredentials(
                        call,
                        participantUserId
                );

        JWTClaimsSet claims =
                parse(credentials);

        Map<String, Object> video =
                videoGrant(claims);

        List<?> sources =
                (List<?>) video.get(
                        "canPublishSources"
                );

        assertEquals(
                List.of(
                        "microphone",
                        "camera"
                ),
                sources
        );
    }

    @Test
    void tokenIsRestrictedToCallRoom()
            throws Exception {

        SecureConnectMediaCredentials credentials =
                provider.createParticipantCredentials(
                        call(CallMediaType.VIDEO),
                        participantUserId
                );

        Map<String, Object> video =
                videoGrant(
                        parse(credentials)
                );

        assertEquals(
                "sc_" + callId,
                video.get("room")
        );
    }

    @Test
    void tokenUsesOpaqueIdentity()
            throws Exception {

        SecureConnectMediaCredentials credentials =
                provider.createParticipantCredentials(
                        call(CallMediaType.AUDIO),
                        participantUserId
                );

        JWTClaimsSet claims =
                parse(credentials);

        assertEquals(
                "scu_" + participantUserId,
                claims.getSubject()
        );

        assertFalse(
                claims.getSubject()
                        .contains("@")
        );
    }

    @Test
    void tokenExpiresApproximatelyAtConfiguredTtl()
            throws Exception {

        long before =
                System.currentTimeMillis();

        SecureConnectMediaCredentials credentials =
                provider.createParticipantCredentials(
                        call(CallMediaType.AUDIO),
                        participantUserId
                );

        long after =
                System.currentTimeMillis();

        JWTClaimsSet claims =
                parse(credentials);

        Date issuedAt =
                claims.getIssueTime();

        Date expiresAt =
                claims.getExpirationTime();

        assertNotNull(issuedAt);
        assertNotNull(expiresAt);

        long lifetimeMillis =
                expiresAt.getTime()
                        - issuedAt.getTime();

        assertEquals(
                300_000L,
                lifetimeMillis
        );

        assertTrue(
                issuedAt.getTime()
                        >= before - 1_000L
        );

        assertTrue(
                issuedAt.getTime()
                        <= after + 1_000L
        );
    }

    @Test
    void providerAndRoomNamesAreStable() {
        SecureConnectCallSession call =
                call(CallMediaType.VIDEO);

        assertEquals(
                "LIVEKIT",
                provider.providerName()
        );

        assertEquals(
                "sc_" + callId,
                provider.roomName(call)
        );

        assertEquals(
                provider.roomName(call),
                provider.roomName(call)
        );
    }

    private SecureConnectCallSession call(
            CallMediaType mediaType
    ) {
        return SecureConnectCallSession
                .builder()
                .id(callId)
                .mediaType(mediaType)
                .status(CallStatus.ACCEPTED)
                .durationSeconds(0L)
                .build();
    }

    private JWTClaimsSet parse(
            SecureConnectMediaCredentials credentials
    ) throws Exception {
        return SignedJWT
                .parse(
                        credentials.participantToken()
                )
                .getJWTClaimsSet();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> videoGrant(
            JWTClaimsSet claims
    ) throws Exception {
        Object value =
                claims.getClaim("video");

        assertInstanceOf(
                Map.class,
                value
        );

        return (Map<String, Object>) value;
    }
}
