package com.theholymatrimony.backend.secureconnect.termination;

import com.nimbusds.jwt.SignedJWT;
import com.theholymatrimony.backend.secureconnect.config.LiveKitProperties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class LiveKitRoomTerminationClientTests {

    private LiveKitProperties properties;
    private RestClient.Builder builder;
    private MockRestServiceServer server;
    private LiveKitRoomTerminationClient client;

    @BeforeEach
    void setUp() {
        properties = new LiveKitProperties();
        properties.setUrl("wss://example.livekit.cloud");
        properties.setApiKey("test-api-key");
        properties.setApiSecret(
                "test-secret-with-at-least-32-characters"
        );

        builder = RestClient.builder();

        server = MockRestServiceServer
                .bindTo(builder)
                .build();

        client = new LiveKitRoomTerminationClient(
                properties,
                builder.build()
        );
    }

    @Test
    void sendsAuthenticatedDeleteRoomRequest()
            throws Exception {

        String room = "sc_" + UUID.randomUUID();

        AtomicReference<String> authorization =
                new AtomicReference<>();

        server.expect(requestTo(
                        "https://example.livekit.cloud"
                                + "/twirp/livekit.RoomService/DeleteRoom"
                ))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.room").value(room))
                .andExpect(request -> authorization.set(
                        request.getHeaders()
                                .getFirst("Authorization")
                ))
                .andRespond(withSuccess(
                        "{}",
                        MediaType.APPLICATION_JSON
                ));

        client.deleteRoom(room);

        server.verify();

        String header = authorization.get();

        assertNotNull(header);
        assertTrue(header.startsWith("Bearer "));

        SignedJWT jwt = SignedJWT.parse(
                header.substring("Bearer ".length())
        );

        assertEquals(
                "test-api-key",
                jwt.getJWTClaimsSet().getIssuer()
        );

        Map<?, ?> videoGrant =
                (Map<?, ?>) jwt.getJWTClaimsSet()
                        .getClaim("video");

        assertEquals(
                Boolean.TRUE,
                videoGrant.get("roomCreate")
        );
    }

    @Test
    void sendsAuthenticatedRemoveParticipantRequest()
            throws Exception {
        String room = "sc_" + UUID.randomUUID();
        UUID participantId = UUID.randomUUID();

        AtomicReference<String> authorization =
                new AtomicReference<>();

        server.expect(requestTo(
                        "https://example.livekit.cloud"
                                + "/twirp/livekit.RoomService/RemoveParticipant"
                ))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(
                        MediaType.APPLICATION_JSON
                ))
                .andExpect(jsonPath("$.room").value(room))
                .andExpect(jsonPath("$.identity").value(
                        "scu_" + participantId
                ))
                .andExpect(request -> authorization.set(
                        request.getHeaders()
                                .getFirst("Authorization")
                ))
                .andRespond(withSuccess(
                        "{}",
                        MediaType.APPLICATION_JSON
                ));

        client.removeParticipant(room, participantId);
        server.verify();

        String header = authorization.get();
        assertNotNull(header);
        assertTrue(header.startsWith("Bearer "));

        SignedJWT jwt = SignedJWT.parse(
                header.substring("Bearer ".length())
        );

        Map<?, ?> grant = (Map<?, ?>)
                jwt.getJWTClaimsSet().getClaim("video");

        assertEquals(Boolean.TRUE, grant.get("roomAdmin"));
    }

    @Test
    void rejectsInvalidParticipantRemovalArguments() {
        assertThrows(
                IllegalArgumentException.class,
                () -> client.removeParticipant(
                        "../other-room",
                        UUID.randomUUID()
                )
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> client.removeParticipant(
                        "sc_" + UUID.randomUUID(),
                        null
                )
        );

        server.verify();
    }

    @Test
    void propagatesParticipantRemovalFailureForRetry() {
        String room = "sc_" + UUID.randomUUID();

        server.expect(requestTo(
                        "https://example.livekit.cloud"
                                + "/twirp/livekit.RoomService/RemoveParticipant"
                ))
                .andRespond(withServerError());

        assertThrows(
                RuntimeException.class,
                () -> client.removeParticipant(
                        room,
                        UUID.randomUUID()
                )
        );

        server.verify();
    }







    @Test
    void rejectsInvalidRoomNames() {
        assertThrows(
                IllegalArgumentException.class,
                () -> client.deleteRoom("../other-room")
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> client.deleteRoom("")
        );

        server.verify();
    }

    @Test
    void rejectsInsecureLiveKitUrl() {
        properties.setUrl(
                "http://example.livekit.cloud"
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> client.deleteRoom(
                        "sc_" + UUID.randomUUID()
                )
        );

        server.verify();
    }

    @Test
    void propagatesServerFailureForRetry() {
        String room = "sc_" + UUID.randomUUID();

        server.expect(requestTo(
                        "https://example.livekit.cloud"
                                + "/twirp/livekit.RoomService/DeleteRoom"
                ))
                .andRespond(
                        withServerError()
                );

        assertThrows(
                RuntimeException.class,
                () -> client.deleteRoom(room)
        );

        server.verify();
    }
}
