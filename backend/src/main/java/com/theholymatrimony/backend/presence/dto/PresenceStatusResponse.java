
package com.theholymatrimony.backend.presence.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PresenceStatusResponse {

    private UUID userId;

    private boolean online;

    private LocalDateTime lastSeenAt;
}