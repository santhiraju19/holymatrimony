package com.theholymatrimony.backend.notification.dto;

import com.theholymatrimony.backend.notification.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(

        UUID id,

        NotificationType type,

        String title,

        String message,

        String referenceId,

        String actionUrl,

        String imageUrl,

        boolean read,

        Instant readAt,

        Instant createdAt

) {
}
