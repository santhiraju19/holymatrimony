package com.theholymatrimony.backend.notification.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(
                        name = "idx_notification_recipient_email",
                        columnList = "recipient_email"
                ),
                @Index(
                        name = "idx_notification_recipient_unread",
                        columnList = "recipient_email, is_read"
                ),
                @Index(
                        name = "idx_notification_created_at",
                        columnList = "created_at"
                )
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "recipient_email",
            nullable = false,
            length = 255
    )
    private String recipientEmail;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "notification_type",
            nullable = false,
            length = 50
    )
    private NotificationType type;

    @Column(
            name = "title",
            nullable = false,
            length = 150
    )
    private String title;

    @Column(
            name = "message",
            nullable = false,
            length = 1000
    )
    private String message;

    @Column(
            name = "reference_id",
            length = 100
    )
    private String referenceId;

    @Column(
            name = "action_url",
            length = 500
    )
    private String actionUrl;

    @Column(
            name = "image_url",
            length = 1000
    )
    private String imageUrl;

    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read = false;

    @Column(
            name = "read_at"
    )
    private Instant readAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    public Notification() {
    }

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();

        createdAt = now;
        updatedAt = now;

        if (recipientEmail != null) {
            recipientEmail =
                    recipientEmail.trim().toLowerCase();
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();

        if (recipientEmail != null) {
            recipientEmail =
                    recipientEmail.trim().toLowerCase();
        }
    }

    public void markAsRead() {
        if (!read) {
            read = true;
            readAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public void setRecipientEmail(
            String recipientEmail
    ) {
        this.recipientEmail = recipientEmail;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(
            String referenceId
    ) {
        this.referenceId = referenceId;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public void setActionUrl(
            String actionUrl
    ) {
        this.actionUrl = actionUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(
            String imageUrl
    ) {
        this.imageUrl = imageUrl;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;

        if (read && readAt == null) {
            readAt = Instant.now();
        }

        if (!read) {
            readAt = null;
        }
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            Instant createdAt
    ) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            Instant updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}
