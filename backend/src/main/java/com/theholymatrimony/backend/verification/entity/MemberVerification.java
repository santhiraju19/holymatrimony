package com.theholymatrimony.backend.verification.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "member_verifications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_member_verification_user_type",
                        columnNames = {
                                "user_id",
                                "verification_type"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_member_verification_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_member_verification_status",
                        columnList = "verification_status"
                ),
                @Index(
                        name = "idx_member_verification_type_status",
                        columnList =
                                "verification_type, verification_status"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "verification_type",
            nullable = false,
            length = 30
    )
    private VerificationType verificationType;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(
            name = "verification_status",
            nullable = false,
            length = 30
    )
    private VerificationStatus verificationStatus =
            VerificationStatus.NOT_SUBMITTED;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(
            name = "review_reason",
            length = 1000
    )
    private String reviewReason;

    /*
     * Optional member-supplied note associated
     * with the verification request.
     *
     * Document metadata will be modeled separately
     * when secure verification uploads are added.
     */
    @Column(
            name = "member_note",
            length = 1000
    )
    private String memberNote;

    @Builder.Default
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (verificationStatus == null) {
            verificationStatus =
                    VerificationStatus.NOT_SUBMITTED;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    public void submit(
            String note
    ) {

        verificationStatus =
                VerificationStatus.PENDING;

        submittedAt =
                LocalDateTime.now();

        reviewedAt = null;
        reviewedBy = null;
        reviewReason = null;

        memberNote =
                normalize(note);
    }

    public void approve(
            UUID adminId,
            String reason

    ) {

        

        verificationStatus =
                VerificationStatus.APPROVED;

        reviewedAt =
                LocalDateTime.now();

        reviewedBy =
                adminId;

        reviewReason =
                normalize(reason);
    }

    public void reject(
            UUID adminId,
            String reason
    ) {

        verificationStatus =
                VerificationStatus.REJECTED;

        reviewedAt =
                LocalDateTime.now();

        reviewedBy =
                adminId;

        reviewReason =
                normalize(reason);
    }

    public boolean isApproved() {

        return verificationStatus ==
                VerificationStatus.APPROVED;
    }

    public void approveAutomatically(
        String reason
) {

    verificationStatus =
            VerificationStatus.APPROVED;

    reviewedAt =
            LocalDateTime.now();

    reviewedBy =
            null;

    reviewReason =
            normalize(reason);
}
    public boolean isPending() {

        return verificationStatus ==
                VerificationStatus.PENDING;
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}
