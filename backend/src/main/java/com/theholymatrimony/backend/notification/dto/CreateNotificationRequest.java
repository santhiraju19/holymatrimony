package com.theholymatrimony.backend.notification.dto;

import com.theholymatrimony.backend.notification.entity.NotificationType;

public record CreateNotificationRequest(

        String recipientEmail,

        NotificationType type,

        String title,

        String message,

        String referenceId,

        String actionUrl,

        String imageUrl

) {
}
