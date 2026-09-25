package com.theholymatrimony.backend.secureconnect.provider;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.theholymatrimony.backend.secureconnect.config.LiveKitProperties;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class LiveKitCallProvider implements CallProvider {

    private static final String PROVIDER_NAME = "LIVEKIT";

    private final LiveKitProperties properties;

    public LiveKitCallProvider(
            LiveKitProperties properties
    ) {
        this.properties = properties;
    }

    @Override
    public String providerName() {
        return PROVIDER_NAME;
    }

    @Override
    public String roomName(
            SecureConnectCallSession call
    ) {
        if (call == null || call.getId() == null) {
            throw new IllegalArgumentException(
                    "Secure Connect call is required."
            );
        }

        return "sc_" + call.getId();
    }

    @Override
    public SecureConnectMediaCredentials createParticipantCredentials(
            SecureConnectCallSession call,
            UUID participantUserId
    ) {
        return createParticipantCredentials(
                call,
                participantUserId,
                null
        );
    }

    public SecureConnectMediaCredentials createParticipantCredentials(
            SecureConnectCallSession call,
            UUID participantUserId,
            Instant deadline
    ) {
        properties.validate();

        if (call == null || call.getId() == null) {
            throw new IllegalArgumentException(
                    "Secure Connect call is required."
            );
        }

        if (participantUserId == null) {
            throw new IllegalArgumentException(
                    "Participant user ID is required."
            );
        }

        String roomName = roomName(call);
        String identity =
                "scu_" + participantUserId;

        Instant now = Instant.now();
        Instant expiresAt =
                now.plusSeconds(
                        properties.getTokenTtlSeconds()
                );

        if (deadline != null) {
            if (!deadline.isAfter(now)) {
                throw new IllegalStateException(
                        "Secure Connect media authorization has expired."
                );
            }

            if (deadline.isBefore(expiresAt)) {
                expiresAt = deadline;
            }
        }

        Map<String, Object> videoGrant =
                buildVideoGrant(
                        call,
                        roomName
                );

        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .issuer(
                                properties.getApiKey()
                        )
                        .subject(identity)
                        .issueTime(
                                Date.from(now)
                        )
                        .notBeforeTime(
                                Date.from(
                                        now.minusSeconds(5L)
                                )
                        )
                        .expirationTime(
                                Date.from(expiresAt)
                        )
                        .jwtID(
                                UUID.randomUUID()
                                        .toString()
                        )
                        .claim(
                                "name",
                                identity
                        )
                        .claim(
                                "video",
                                videoGrant
                        )
                        .build();

        SignedJWT signedJwt =
                new SignedJWT(
                        new JWSHeader(
                                JWSAlgorithm.HS256
                        ),
                        claims
                );

        try {
            signedJwt.sign(
                    new MACSigner(
                            properties
                                    .getApiSecret()
                                    .getBytes(
                                            java.nio.charset.StandardCharsets.UTF_8
                                    )
                    )
            );
        } catch (JOSEException exception) {
            throw new IllegalStateException(
                    "Unable to create Secure Connect media token.",
                    exception
            );
        }

        return new SecureConnectMediaCredentials(
                properties.getUrl(),
                signedJwt.serialize(),
                roomName,
                identity,
                call.getMediaType()
        );
    }

    private Map<String, Object> buildVideoGrant(
            SecureConnectCallSession call,
            String roomName
    ) {
        List<String> publishSources =
                call.getMediaType()
                        == CallMediaType.VIDEO
                        ? List.of(
                                "microphone",
                                "camera"
                        )
                        : List.of(
                                "microphone"
                        );

        return Map.of(
                "roomJoin", true,
                "room", roomName,
                "canPublish", true,
                "canSubscribe", true,
                "canPublishData", false,
                "canPublishSources", publishSources
        );
    }
}
