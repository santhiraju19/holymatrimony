package com.theholymatrimony.backend.presence.controller;

import com.theholymatrimony.backend.presence.dto.PresenceStatusResponse;
import com.theholymatrimony.backend.presence.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService
            presenceService;

    @GetMapping("/{userId}")
    public ResponseEntity<
            PresenceStatusResponse
            > getUserPresence(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        PresenceStatusResponse response =
                presenceService.getPresence(
                        getAuthenticatedEmail(
                                authentication
                        ),
                        userId
                );

        return ResponseEntity.ok(
                response
        );
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                !StringUtils.hasText(
                        authentication.getName()
                )
        ) {
            throw new IllegalStateException(
                    "Authenticated viewer is required"
            );
        }

        return authentication
                .getName()
                .trim();
    }
}