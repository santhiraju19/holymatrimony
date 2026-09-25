package com.theholymatrimony.backend.secureconnect.termination;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.theholymatrimony.backend.secureconnect.config.LiveKitProperties;

import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.HttpClientErrorException;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class LiveKitRoomTerminationClient {

    private final LiveKitProperties properties;
    private final RestClient httpClient;

    @Autowired
    public LiveKitRoomTerminationClient(
            LiveKitProperties properties
    ) {
        this(
                properties,
                createHttpClient()
        );
    }

    LiveKitRoomTerminationClient(
            LiveKitProperties properties,
            RestClient httpClient
    ) {
        this.properties = properties;
        this.httpClient = httpClient;
    }

    public void removeParticipant(
            String roomName,
            UUID participantUserId
    ) {
        properties.validate();

        if (!StringUtils.hasText(roomName)
                || !roomName.matches(
                        "sc_[0-9a-fA-F-]{36}"
                )) {
            throw new IllegalArgumentException(
                    "A valid Secure Connect room is required."
            );
        }

        if (participantUserId == null) {
            throw new IllegalArgumentException(
                    "Participant user ID is required."
            );
        }

        String endpoint = resolveEndpoint(
                properties.getUrl()
        ).replace(
                "/DeleteRoom",
                "/RemoveParticipant"
        );

        try {
            httpClient.post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers ->
                            headers.setBearerAuth(
                                    createAdministrationToken()
                            )
                    )
                    .body(Map.of(
                            "room", roomName,
                            "identity", "scu_" + participantUserId
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException.NotFound exception) {
            // Participant or room is already absent.
            // Continue with the remaining termination steps.
        }
    }

    public void deleteRoom(String roomName) {
        properties.validate();

        if (!StringUtils.hasText(roomName)
                || !roomName.matches(
                        "sc_[0-9a-fA-F-]{36}"
                )) {
            throw new IllegalArgumentException(
                    "A valid Secure Connect room is required."
            );
        }

        String endpoint = resolveEndpoint(
                properties.getUrl()
        );

        httpClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers ->
                        headers.setBearerAuth(
                                createAdministrationToken()
                        )
                )
                .body(Map.of("room", roomName))
                .retrieve()
                .toBodilessEntity();
    }

    private String createAdministrationToken() {
        Instant now = Instant.now();

        JWTClaimsSet claims =
                new JWTClaimsSet.Builder()
                        .issuer(properties.getApiKey())
                        .subject(
                                "sc-room-termination-"
                                        + UUID.randomUUID()
                        )
                        .issueTime(Date.from(now))
                        .notBeforeTime(
                                Date.from(
                                        now.minusSeconds(5)
                                )
                        )
                        .expirationTime(
                                Date.from(
                                        now.plusSeconds(60)
                                )
                        )
                        .claim(
                                "video",
                                Map.of(
                                        "roomCreate", true,
                                        "roomAdmin", true
                                )
                        )
                        .build();

        SignedJWT jwt = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claims
        );

        try {
            jwt.sign(
                    new MACSigner(
                            properties.getApiSecret()
                                    .getBytes(
                                            StandardCharsets.UTF_8
                                    )
                    )
            );
        } catch (JOSEException exception) {
            throw new IllegalStateException(
                    "Unable to sign LiveKit administration token.",
                    exception
            );
        }

        return jwt.serialize();
    }

    private static String resolveEndpoint(
            String configuredUrl
    ) {
        URI uri = URI.create(configuredUrl);

        String scheme = uri.getScheme();

        if (scheme == null) {
            throw new IllegalArgumentException(
                    "LiveKit URL must include a scheme."
            );
        }

        String httpsScheme;

        if ("wss".equalsIgnoreCase(scheme)
                || "https".equalsIgnoreCase(scheme)) {
            httpsScheme = "https";
        } else {
            throw new IllegalArgumentException(
                    "LiveKit administration requires a secure URL."
            );
        }

        if (!StringUtils.hasText(uri.getHost())
                || uri.getUserInfo() != null
                || uri.getQuery() != null
                || uri.getFragment() != null
                || !StringUtils.hasText(uri.getPath())
                    && configuredUrl.endsWith("//")) {
            throw new IllegalArgumentException(
                    "Invalid LiveKit server URL."
            );
        }

        if (!uri.getPath().isEmpty()
                && !"/".equals(uri.getPath())) {
            throw new IllegalArgumentException(
                    "LiveKit URL must not contain a path."
            );
        }

        return httpsScheme
                + "://"
                + uri.getAuthority()
                + "/twirp/livekit.RoomService/DeleteRoom";
    }

    private static RestClient createHttpClient() {
        ClientHttpRequestFactorySettings settings =
                ClientHttpRequestFactorySettings
                        .defaults()
                        .withConnectTimeout(
                                Duration.ofSeconds(3)
                        )
                        .withReadTimeout(
                                Duration.ofSeconds(5)
                        );

        return RestClient.builder()
                .requestFactory(
                        ClientHttpRequestFactoryBuilder
                                .detect()
                                .build(settings)
                )
                .build();
    }
}
