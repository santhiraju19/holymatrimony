package com.theholymatrimony.backend.secureconnect.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectCallResponse;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectCallService;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectMediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SecureConnectCallControllerTests {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private SecureConnectCallService callService;

    private SecureConnectMediaService mediaService;

    private UUID callId;
    private UUID callerUserId;
    private UUID calleeUserId;

    private SecureConnectCallResponse ringingResponse;
    private SecureConnectCallResponse acceptedResponse;
    private SecureConnectCallResponse declinedResponse;
    private SecureConnectCallResponse cancelledResponse;
    private SecureConnectCallResponse endedResponse;

    @BeforeEach
    void setUp() {
        callService =
                mock(SecureConnectCallService.class);

        mediaService =
                mock(SecureConnectMediaService.class);

        SecureConnectCallController controller =
                new SecureConnectCallController(
                        callService,
                        mediaService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(controller)
                        .build();

        objectMapper =
                new ObjectMapper()
                        .findAndRegisterModules();

        callId = UUID.randomUUID();
        callerUserId = UUID.randomUUID();
        calleeUserId = UUID.randomUUID();

        LocalDateTime initiatedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        15,
                        19,
                        30
                );

        ringingResponse =
                new SecureConnectCallResponse(
                        callId,
                        callerUserId,
                        calleeUserId,
                        CallMediaType.AUDIO,
                        CallStatus.RINGING,
                        initiatedAt,
                        null,
                        null,
                        null,
                        0L
                );

        acceptedResponse =
                new SecureConnectCallResponse(
                        callId,
                        callerUserId,
                        calleeUserId,
                        CallMediaType.AUDIO,
                        CallStatus.ACCEPTED,
                        initiatedAt,
                        initiatedAt.plusSeconds(5),
                        null,
                        null,
                        0L
                );

        declinedResponse =
                new SecureConnectCallResponse(
                        callId,
                        callerUserId,
                        calleeUserId,
                        CallMediaType.AUDIO,
                        CallStatus.DECLINED,
                        initiatedAt,
                        null,
                        null,
                        initiatedAt.plusSeconds(10),
                        0L
                );

        cancelledResponse =
                new SecureConnectCallResponse(
                        callId,
                        callerUserId,
                        calleeUserId,
                        CallMediaType.AUDIO,
                        CallStatus.CANCELLED,
                        initiatedAt,
                        null,
                        null,
                        initiatedAt.plusSeconds(10),
                        0L
                );

        endedResponse =
                new SecureConnectCallResponse(
                        callId,
                        callerUserId,
                        calleeUserId,
                        CallMediaType.AUDIO,
                        CallStatus.ENDED,
                        initiatedAt,
                        initiatedAt.plusSeconds(5),
                        initiatedAt.plusSeconds(10),
                        initiatedAt.plusSeconds(70),
                        60L
                );
    }

    @Test
    void initiateCallUsesAuthenticatedIdentity() throws Exception {
        when(callService.initiateCall(
                "caller@example.com",
                calleeUserId,
                CallMediaType.AUDIO
        )).thenReturn(ringingResponse);

        String body =
                """
                {
                  "calleeUserId": "%s",
                  "mediaType": "AUDIO"
                }
                """.formatted(calleeUserId);

        mockMvc.perform(
                        post("/api/v1/calls")
                                .principal(
                                        authenticated(
                                                "caller@example.com"
                                        )
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(body)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.callId")
                                .value(
                                        callId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.callerUserId")
                                .value(
                                        callerUserId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.calleeUserId")
                                .value(
                                        calleeUserId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.mediaType")
                                .value("AUDIO")
                )
                .andExpect(
                        jsonPath("$.status")
                                .value("RINGING")
                );

        verify(callService)
                .initiateCall(
                        "caller@example.com",
                        calleeUserId,
                        CallMediaType.AUDIO
                );
    }

    @Test
    void requestBodyCannotSpoofCallerIdentity() throws Exception {
        UUID spoofedCallerId =
                UUID.randomUUID();

        when(callService.initiateCall(
                "real-member@example.com",
                calleeUserId,
                CallMediaType.AUDIO
        )).thenReturn(ringingResponse);

        /*
         * callerUserId is intentionally sent even though it does
         * not exist in SecureConnectInitiateCallRequest.
         *
         * The controller must still derive caller identity only
         * from the authenticated principal.
         */
        String body =
                """
                {
                  "callerUserId": "%s",
                  "calleeUserId": "%s",
                  "mediaType": "AUDIO"
                }
                """.formatted(
                        spoofedCallerId,
                        calleeUserId
                );

        mockMvc.perform(
                        post("/api/v1/calls")
                                .principal(
                                        authenticated(
                                                "real-member@example.com"
                                        )
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(body)
                )
                .andExpect(status().isOk());

        verify(callService)
                .initiateCall(
                        "real-member@example.com",
                        calleeUserId,
                        CallMediaType.AUDIO
                );

        verifyNoMoreInteractions(callService);
    }

    @Test
    void initiateCallRequiresCalleeUserId() throws Exception {
        String body =
                """
                {
                  "mediaType": "AUDIO"
                }
                """;

        mockMvc.perform(
                        post("/api/v1/calls")
                                .principal(
                                        authenticated(
                                                "caller@example.com"
                                        )
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(body)
                )
                .andExpect(
                        status().isBadRequest()
                );

        verifyNoInteractions(callService);
    }

    @Test
    void initiateCallRequiresMediaType() throws Exception {
        String body =
                """
                {
                  "calleeUserId": "%s"
                }
                """.formatted(calleeUserId);

        mockMvc.perform(
                        post("/api/v1/calls")
                                .principal(
                                        authenticated(
                                                "caller@example.com"
                                        )
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(body)
                )
                .andExpect(
                        status().isBadRequest()
                );

        verifyNoInteractions(callService);
    }

    @Test
    void acceptCallUsesAuthenticatedIdentity() throws Exception {
        when(callService.acceptCall(
                "callee@example.com",
                callId
        )).thenReturn(acceptedResponse);

        mockMvc.perform(
                        post(
                                "/api/v1/calls/{callId}/accept",
                                callId
                        )
                                .principal(
                                        authenticated(
                                                "callee@example.com"
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.status")
                                .value("ACCEPTED")
                );

        verify(callService)
                .acceptCall(
                        "callee@example.com",
                        callId
                );
    }

    @Test
    void markConnectedUsesAuthenticatedIdentity() throws Exception {
        LocalDateTime connectedAt =
                LocalDateTime.of(
                        2026,
                        9,
                        15,
                        19,
                        30,
                        10
                );

        SecureConnectCallResponse connectedResponse =
                new SecureConnectCallResponse(
                        callId,
                        callerUserId,
                        calleeUserId,
                        CallMediaType.AUDIO,
                        CallStatus.ACCEPTED,
                        connectedAt.minusSeconds(10),
                        connectedAt.minusSeconds(5),
                        connectedAt,
                        null,
                        0L
                );

        when(callService.markConnected(
                "caller@example.com",
                callId
        )).thenReturn(connectedResponse);

        mockMvc.perform(
                        post(
                                "/api/v1/calls/{callId}/connected",
                                callId
                        )
                                .principal(
                                        authenticated(
                                                "caller@example.com"
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.status")
                                .value("ACCEPTED")
                )
                .andExpect(
                        jsonPath("$.connectedAt")
                                .exists()
                );

        verify(callService)
                .markConnected(
                        "caller@example.com",
                        callId
                );
    }

    @Test
    void declineCallUsesAuthenticatedIdentity() throws Exception {
        when(callService.declineCall(
                "callee@example.com",
                callId
        )).thenReturn(declinedResponse);

        mockMvc.perform(
                        post(
                                "/api/v1/calls/{callId}/decline",
                                callId
                        )
                                .principal(
                                        authenticated(
                                                "callee@example.com"
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.status")
                                .value("DECLINED")
                );

        verify(callService)
                .declineCall(
                        "callee@example.com",
                        callId
                );
    }

    @Test
    void cancelCallUsesAuthenticatedIdentity() throws Exception {
        when(callService.cancelCall(
                "caller@example.com",
                callId
        )).thenReturn(cancelledResponse);

        mockMvc.perform(
                        post(
                                "/api/v1/calls/{callId}/cancel",
                                callId
                        )
                                .principal(
                                        authenticated(
                                                "caller@example.com"
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.status")
                                .value("CANCELLED")
                );

        verify(callService)
                .cancelCall(
                        "caller@example.com",
                        callId
                );
    }

    @Test
    void eitherParticipantCanReachEndEndpoint() throws Exception {
        when(callService.endCall(
                "callee@example.com",
                callId
        )).thenReturn(endedResponse);

        mockMvc.perform(
                        post(
                                "/api/v1/calls/{callId}/end",
                                callId
                        )
                                .principal(
                                        authenticated(
                                                "callee@example.com"
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.status")
                                .value("ENDED")
                )
                .andExpect(
                        jsonPath("$.durationSeconds")
                                .value(60)
                );

        verify(callService)
                .endCall(
                        "callee@example.com",
                        callId
                );
    }

    @Test
    void historyUsesOnlyAuthenticatedIdentity() throws Exception {
        when(callService.getCallHistory(
                "member@example.com"
        )).thenReturn(
                List.of(
                        ringingResponse,
                        endedResponse
                )
        );

        mockMvc.perform(
                        get("/api/v1/calls/history")
                                .principal(
                                        authenticated(
                                                "member@example.com"
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.length()")
                                .value(2)
                )
                .andExpect(
                        jsonPath("$[0].status")
                                .value("RINGING")
                )
                .andExpect(
                        jsonPath("$[1].status")
                                .value("ENDED")
                );

        verify(callService)
                .getCallHistory(
                        "member@example.com"
                );
    }

    @Test
    void invalidCallIdReturnsBadRequestBeforeServiceInvocation()
            throws Exception {

        mockMvc.perform(
                        post(
                                "/api/v1/calls/not-a-uuid/accept"
                        )
                                .principal(
                                        authenticated(
                                                "callee@example.com"
                                        )
                                )
                )
                .andExpect(
                        status().isBadRequest()
                );

        verifyNoInteractions(callService);
    }

    @Test
    void blankAuthenticatedNameIsRejected() {
        UsernamePasswordAuthenticationToken blankAuthentication =
                new UsernamePasswordAuthenticationToken(
                        "",
                        "unused",
                        List.of()
                );

        jakarta.servlet.ServletException exception =
                assertThrows(
                        jakarta.servlet.ServletException.class,
                        () -> mockMvc.perform(
                                get("/api/v1/calls/history")
                                        .principal(
                                                blankAuthentication
                                        )
                        )
                );

        assertInstanceOf(
                org.springframework.security.authentication.AuthenticationCredentialsNotFoundException.class,
                exception.getCause()
        );

        verifyNoInteractions(callService);
    }

    private UsernamePasswordAuthenticationToken authenticated(
            String email
    ) {
        return new UsernamePasswordAuthenticationToken(
                email,
                "unused",
                List.of()
        );
    }
}
