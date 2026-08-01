package com.theholymatrimony.backend.notification.service;

import com.theholymatrimony.backend.notification.dto.NotificationResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationRealtimePublisher {

    private static final String DESTINATION =
            "/queue/notifications";

    private final SimpMessagingTemplate
            messagingTemplate;

    public NotificationRealtimePublisher(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate =
                messagingTemplate;
    }

    public void publish(
            String recipientEmail,
            NotificationResponse notification
    ) {
        if (
                recipientEmail == null ||
                recipientEmail.isBlank() ||
                notification == null
        ) {
            return;
        }

        messagingTemplate.convertAndSendToUser(
                recipientEmail
                        .trim()
                        .toLowerCase(),
                DESTINATION,
                notification
        );
    }
}
