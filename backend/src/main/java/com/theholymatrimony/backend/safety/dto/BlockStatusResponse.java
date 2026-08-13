package com.theholymatrimony.backend.safety.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockStatusResponse {

    private UUID userId;

    private boolean blockedByMe;

    private boolean messagingBlocked;
}