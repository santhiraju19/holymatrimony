package com.theholymatrimony.backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProfileBoostResponse {

    private boolean eligible;

    private boolean active;

    private LocalDateTime startedAt;

    private LocalDateTime expiresAt;

    private long remainingMinutes;
}
