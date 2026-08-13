package com.theholymatrimony.backend.safety.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.safety.enums.ReportReason;
import com.theholymatrimony.backend.safety.enums.ReportStatus;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "user_reports",
        indexes = {
                @Index(
                        name = "idx_user_report_reporter",
                        columnList = "reporter_id"
                ),
                @Index(
                        name = "idx_user_report_reported_user",
                        columnList = "reported_user_id"
                ),
                @Index(
                        name = "idx_user_report_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_user_report_created_at",
                        columnList = "created_at"
                ),
                @Index(
                        name = "idx_user_report_conversation",
                        columnList = "conversation_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReport {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "reporter_id",
            nullable = false
    )
    private User reporter;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "reported_user_id",
            nullable = false
    )
    private User reportedUser;

    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "conversation_id"
    )
    private Conversation conversation;

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "reason",
            nullable = false,
            length = 50
    )
    private ReportReason reason;

    @Column(
            name = "details",
            length = 1000
    )
    private String details;

    @Enumerated(
            EnumType.STRING
    )
    @Builder.Default
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private ReportStatus status =
            ReportStatus.PENDING;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "reviewed_at"
    )
    private LocalDateTime reviewedAt;

    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "reviewed_by"
    )
    private User reviewedBy;

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }

        if (status == null) {
            status =
                    ReportStatus.PENDING;
        }
    }
}