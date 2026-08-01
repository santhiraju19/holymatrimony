package com.theholymatrimony.backend.notification.service;

import com.theholymatrimony.backend.notification.dto.CreateNotificationRequest;
import com.theholymatrimony.backend.notification.dto.NotificationPageResponse;
import com.theholymatrimony.backend.notification.dto.NotificationResponse;
import com.theholymatrimony.backend.notification.entity.Notification;
import com.theholymatrimony.backend.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class NotificationService {

    private static final int MAX_PAGE_SIZE = 100;

    private final NotificationRepository
            notificationRepository;

    private final NotificationRealtimePublisher
            realtimePublisher;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationRealtimePublisher realtimePublisher
    ) {
        this.notificationRepository =
                notificationRepository;

        this.realtimePublisher =
                realtimePublisher;
    }

    public NotificationResponse create(
            CreateNotificationRequest request
    ) {
        validateCreateRequest(request);

        String recipientEmail =
                normalizeEmail(
                        request.recipientEmail()
                );

        Notification notification =
                new Notification();

        notification.setRecipientEmail(
                recipientEmail
        );

        notification.setType(
                request.type()
        );

        notification.setTitle(
                request.title().trim()
        );

        notification.setMessage(
                request.message().trim()
        );

        notification.setReferenceId(
                normalizeOptional(
                        request.referenceId()
                )
        );

        notification.setActionUrl(
                normalizeOptional(
                        request.actionUrl()
                )
        );

        notification.setImageUrl(
                normalizeOptional(
                        request.imageUrl()
                )
        );

        Notification saved =
                notificationRepository.save(
                        notification
                );

        NotificationResponse response =
                toResponse(saved);

        realtimePublisher.publish(
                recipientEmail,
                response
        );

        return response;
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse getNotifications(
            String recipientEmail,
            boolean unreadOnly,
            int page,
            int size
    ) {
        String normalizedEmail =
                normalizeEmail(recipientEmail);

        int safePage =
                Math.max(page, 0);

        int safeSize =
                Math.min(
                        Math.max(size, 1),
                        MAX_PAGE_SIZE
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<Notification> notificationPage;

        if (unreadOnly) {
            notificationPage =
                    notificationRepository
                            .findByRecipientEmailIgnoreCaseAndReadFalseOrderByCreatedAtDesc(
                                    normalizedEmail,
                                    pageable
                            );
        } else {
            notificationPage =
                    notificationRepository
                            .findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(
                                    normalizedEmail,
                                    pageable
                            );
        }

        return new NotificationPageResponse(
                notificationPage
                        .getContent()
                        .stream()
                        .map(this::toResponse)
                        .toList(),

                notificationPage.getNumber(),
                notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.isFirst(),
                notificationPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(
            String recipientEmail
    ) {
        return notificationRepository
                .countByRecipientEmailIgnoreCaseAndReadFalse(
                        normalizeEmail(
                                recipientEmail
                        )
                );
    }

    public NotificationResponse markAsRead(
            UUID notificationId,
            String recipientEmail
    ) {
        String normalizedEmail =
                normalizeEmail(recipientEmail);

        Notification notification =
                notificationRepository
                        .findByIdAndRecipientEmailIgnoreCase(
                                notificationId,
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new NotificationNotFoundException(
                                                "Notification not found"
                                        )
                        );

        notification.markAsRead();

        Notification saved =
                notificationRepository.save(
                        notification
                );

        return toResponse(saved);
    }

    public int markAllAsRead(
            String recipientEmail
    ) {
        return notificationRepository
                .markAllAsRead(
                        normalizeEmail(
                                recipientEmail
                        ),
                        Instant.now()
                );
    }

    public void deleteNotification(
            UUID notificationId,
            String recipientEmail
    ) {
        String normalizedEmail =
                normalizeEmail(recipientEmail);

        Notification notification =
                notificationRepository
                        .findByIdAndRecipientEmailIgnoreCase(
                                notificationId,
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new NotificationNotFoundException(
                                                "Notification not found"
                                        )
                        );

        notificationRepository.delete(
                notification
        );
    }

    private NotificationResponse toResponse(
            Notification notification
    ) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getReferenceId(),
                notification.getActionUrl(),
                notification.getImageUrl(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }

    private void validateCreateRequest(
            CreateNotificationRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Notification request is required"
            );
        }

        if (
                request.recipientEmail() == null ||
                request.recipientEmail().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Recipient email is required"
            );
        }

        if (request.type() == null) {
            throw new IllegalArgumentException(
                    "Notification type is required"
            );
        }

        if (
                request.title() == null ||
                request.title().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Notification title is required"
            );
        }

        if (
                request.message() == null ||
                request.message().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Notification message is required"
            );
        }
    }

    private String normalizeEmail(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required"
            );
        }

        return email
                .trim()
                .toLowerCase(Locale.ROOT);
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
