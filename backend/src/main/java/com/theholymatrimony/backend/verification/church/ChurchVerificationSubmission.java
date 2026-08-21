package com.theholymatrimony.backend.verification.church;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.verification.entity.MemberVerification;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "church_verification_submissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_church_submission_verification",
                        columnNames = "verification_id"
                ),
                @UniqueConstraint(
                        name = "uk_church_submission_stored_file",
                        columnNames = "stored_file_name"
                )
        },
        indexes = {
                @Index(
                        name = "idx_church_submission_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_church_submission_method",
                        columnList = "verification_method"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChurchVerificationSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "verification_id",
            nullable = false
    )
    private MemberVerification verification;

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
            name = "verification_method",
            nullable = false,
            length = 30
    )
    private ChurchVerificationMethod verificationMethod;

    /*
     * ============================================================
     * Pastor / Church Office Contact
     * ============================================================
     */

    @Column(
            name = "pastor_name",
            length = 150
    )
    private String pastorName;

    @Column(
            name = "church_phone",
            length = 50
    )
    private String churchPhone;

    @Column(
            name = "church_email",
            length = 255
    )
    private String churchEmail;

    /*
     * ============================================================
     * Membership Information
     * ============================================================
     */

    @Column(
            name = "membership_id",
            length = 150
    )
  private String membershipId;

/*
 * ============================================================
 * Membership Priority
 * ============================================================
 *
 * Captures whether this church verification submission
 * qualified for priority review at submission time.
 */

@Builder.Default
@Column(
        name = "priority_verification",
        nullable = false
)
private boolean priorityVerification = false;

/*
 * ============================================================
 * Optional Supporting Document
 * ============================================================
 */

    @Column(
            name = "original_file_name",
            length = 255
    )
    private String originalFileName;

    @Column(
            name = "stored_file_name",
            unique = true,
            length = 255
    )
    private String storedFileName;

    @Column(
            name = "content_type",
            length = 100
    )
    private String contentType;

    @Column(
            name = "file_size"
    )
    private Long fileSize;

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

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}
