package com.theholymatrimony.backend.notification.service;

import com.theholymatrimony.backend.notification.dto.CreateNotificationRequest;
import com.theholymatrimony.backend.notification.dto.NotificationResponse;
import com.theholymatrimony.backend.notification.entity.NotificationType;
import org.springframework.stereotype.Service;

@Service
public class NotificationFactory {

    private final NotificationService
            notificationService;

    public NotificationFactory(
            NotificationService notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    public NotificationResponse newMessage(
            String recipientEmail,
            String senderName,
            String conversationId,
            String senderPhotoUrl
    ) {
        String safeSenderName =
                safeName(senderName);

        return notificationService.create(
                new CreateNotificationRequest(
                        recipientEmail,
                        NotificationType.NEW_MESSAGE,
                        "New message",
                        safeSenderName +
                                " sent you a message.",
                        conversationId,
                        "/chat?conversationId=" +
                                conversationId,
                        normalizeOptional(
                                senderPhotoUrl
                        )
                )
        );
    }

    public NotificationResponse interestReceived(
            String recipientEmail,
            String senderName,
            String interestId,
            String senderPhotoUrl
    ) {
        String safeSenderName =
                safeName(senderName);

        return notificationService.create(
                new CreateNotificationRequest(
                        recipientEmail,
                        NotificationType.INTEREST_RECEIVED,
                        "New interest received",
                        safeSenderName +
                                " is interested in your profile.",
                        interestId,
                        "/received-interests",
                        normalizeOptional(
                                senderPhotoUrl
                        )
                )
        );
    }

    public NotificationResponse interestAccepted(
            String recipientEmail,
            String recipientName,
            String interestId,
            String recipientPhotoUrl
    ) {
        String safeRecipientName =
                safeName(recipientName);

        return notificationService.create(
                new CreateNotificationRequest(
                        recipientEmail,
                        NotificationType.INTEREST_ACCEPTED,
                        "Interest accepted",
                        safeRecipientName +
                                " accepted your interest.",
                        interestId,
                        "/received-interests",
                        normalizeOptional(
                                recipientPhotoUrl
                        )
                )
        );
    }

    public NotificationResponse interestRejected(
            String recipientEmail,
            String recipientName,
            String interestId,
            String recipientPhotoUrl
    ) {
        String safeRecipientName =
                safeName(recipientName);

        return notificationService.create(
                new CreateNotificationRequest(
                        recipientEmail,
                        NotificationType.INTEREST_REJECTED,
                        "Interest update",
                        safeRecipientName +
                                " has responded to your interest.",
                        interestId,
                        "/received-interests",
                        normalizeOptional(
                                recipientPhotoUrl
                        )
                )
        );
    }

    private String safeName(
            String name
    ) {
        if (
                name == null ||
                name.isBlank()
        ) {
            return "A member";
        }

        return name.trim();
    }

    private String normalizeOptional(
            String value
    ) {
        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}
