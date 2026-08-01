package com.theholymatrimony.backend.notification.controller;

import com.theholymatrimony.backend.notification.dto.NotificationPageResponse;
import com.theholymatrimony.backend.notification.dto.NotificationResponse;
import com.theholymatrimony.backend.notification.dto.UnreadNotificationCountResponse;
import com.theholymatrimony.backend.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    public NotificationController(
            NotificationService
                    notificationService
    ) {
        this.notificationService =
                notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationPageResponse>
    getNotifications(
            Authentication authentication,

            @RequestParam(
                    defaultValue = "false"
            )
            boolean unreadOnly,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {
        String email =
                requireAuthenticatedEmail(
                        authentication
                );

        NotificationPageResponse response =
                notificationService
                        .getNotifications(
                                email,
                                unreadOnly,
                                page,
                                size
                        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadNotificationCountResponse>
    getUnreadCount(
            Authentication authentication
    ) {
        String email =
                requireAuthenticatedEmail(
                        authentication
                );

        long count =
                notificationService
                        .getUnreadCount(email);

        return ResponseEntity.ok(
                new UnreadNotificationCountResponse(
                        count
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse>
    markAsRead(
            @PathVariable
            UUID notificationId,

            Authentication authentication
    ) {
        String email =
                requireAuthenticatedEmail(
                        authentication
                );

        NotificationResponse response =
                notificationService
                        .markAsRead(
                                notificationId,
                                email
                        );

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>>
    markAllAsRead(
            Authentication authentication
    ) {
        String email =
                requireAuthenticatedEmail(
                        authentication
                );

        int updatedCount =
                notificationService
                        .markAllAsRead(email);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Notifications marked as read",

                        "updatedCount",
                        updatedCount
                )
        );
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void>
    deleteNotification(
            @PathVariable
            UUID notificationId,

            Authentication authentication
    ) {
        String email =
                requireAuthenticatedEmail(
                        authentication
                );

        notificationService
                .deleteNotification(
                        notificationId,
                        email
                );

        return ResponseEntity.noContent()
                .build();
    }

    private String requireAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication.getName();
    }
}
