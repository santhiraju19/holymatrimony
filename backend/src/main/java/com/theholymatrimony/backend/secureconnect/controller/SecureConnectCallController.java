package com.theholymatrimony.backend.secureconnect.controller;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectCallResponse;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectInitiateCallRequest;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectCallService;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectMediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calls")
@RequiredArgsConstructor
public class SecureConnectCallController {

    private final SecureConnectCallService callService;
    private final SecureConnectMediaService mediaService;

    @PostMapping
    public ResponseEntity<SecureConnectCallResponse> initiateCall(
            Authentication authentication,
            @Valid
            @RequestBody
            SecureConnectInitiateCallRequest request
    ) {
        return ResponseEntity.ok(
                callService.initiateCall(
                        getAuthenticatedEmail(authentication),
                        request.calleeUserId(),
                        request.mediaType()
                )
        );
    }

    @PostMapping("/{callId}/accept")
    public ResponseEntity<SecureConnectCallResponse> acceptCall(
            Authentication authentication,
            @PathVariable
            UUID callId
    ) {
        return ResponseEntity.ok(
                callService.acceptCall(
                        getAuthenticatedEmail(authentication),
                        callId
                )
        );
    }

    @PostMapping("/{callId}/decline")
    public ResponseEntity<SecureConnectCallResponse> declineCall(
            Authentication authentication,
            @PathVariable
            UUID callId
    ) {
        return ResponseEntity.ok(
                callService.declineCall(
                        getAuthenticatedEmail(authentication),
                        callId
                )
        );
    }

    @PostMapping("/{callId}/cancel")
    public ResponseEntity<SecureConnectCallResponse> cancelCall(
            Authentication authentication,
            @PathVariable
            UUID callId
    ) {
        return ResponseEntity.ok(
                callService.cancelCall(
                        getAuthenticatedEmail(authentication),
                        callId
                )
        );
    }

    @PostMapping("/{callId}/end")
    public ResponseEntity<SecureConnectCallResponse> endCall(
            Authentication authentication,
            @PathVariable
            UUID callId
    ) {
        return ResponseEntity.ok(
                callService.endCall(
                        getAuthenticatedEmail(authentication),
                        callId
                )
        );
    }

    @PostMapping("/{callId}/media-token")
    public ResponseEntity<SecureConnectMediaCredentials>
    createMediaCredentials(
            Authentication authentication,
            @PathVariable
            UUID callId
    ) {
        return ResponseEntity.ok(
                mediaService.createCredentials(
                        getAuthenticatedEmail(authentication),
                        callId
                )
        );
    }

    @GetMapping("/history")
    public ResponseEntity<List<SecureConnectCallResponse>>
    getCallHistory(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                callService.getCallHistory(
                        getAuthenticatedEmail(authentication)
                )
        );
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Authentication is required to access Secure Connect."
            );
        }

        return authentication
                .getName()
                .trim();
    }
}
