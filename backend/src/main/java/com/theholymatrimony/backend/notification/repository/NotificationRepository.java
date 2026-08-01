package com.theholymatrimony.backend.notification.repository;

import com.theholymatrimony.backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    Page<Notification>
    findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(
            String recipientEmail,
            Pageable pageable
    );

    Page<Notification>
    findByRecipientEmailIgnoreCaseAndReadFalseOrderByCreatedAtDesc(
            String recipientEmail,
            Pageable pageable
    );

    long countByRecipientEmailIgnoreCaseAndReadFalse(
            String recipientEmail
    );

    Optional<Notification>
    findByIdAndRecipientEmailIgnoreCase(
            UUID id,
            String recipientEmail
    );

    @Modifying
    @Query("""
            update Notification notification
               set notification.read = true,
                   notification.readAt = :readAt,
                   notification.updatedAt = :readAt
             where lower(notification.recipientEmail) =
                   lower(:recipientEmail)
               and notification.read = false
            """)
    int markAllAsRead(
            @Param("recipientEmail")
            String recipientEmail,

            @Param("readAt")
            Instant readAt
    );

    void deleteByRecipientEmailIgnoreCase(
            String recipientEmail
    );
}
