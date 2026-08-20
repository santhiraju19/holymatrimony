package com.theholymatrimony.backend.profile.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    // =========================================================
    // Basic
    // =========================================================

    @Column(length = 20)
    private String mobile;

    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    private Integer age;

    @Column(length = 30)
    private String maritalStatus;

    // =========================================================
    // Church
    // =========================================================

    @Column(length = 120)
    private String denomination;

    @Column(length = 150)
    private String churchName;

    @Column(length = 120)
    private String pastorName;

    private Boolean baptized;

    @Column(length = 60)
    private String membershipId;

    @Column(length = 300)
    private String churchAddress;

    // =========================================================
    // Education
    // =========================================================

    @Column(length = 120)
    private String highestEducation;

    @Column(length = 120)
    private String profession;

    @Column(length = 120)
    private String company;

    @Column(length = 40)
    private String annualIncome;

    // =========================================================
    // Family
    // =========================================================

    @Column(length = 120)
    private String fatherName;

    @Column(length = 120)
    private String motherName;

    @Column(length = 50)
    private String siblings;

    @Column(length = 120)
    private String familyLocation;

    // =========================================================
    // Preferences
    // =========================================================

    private Integer preferredAgeFrom;

    private Integer preferredAgeTo;

    @Column(length = 120)
    private String preferredDenomination;

    @Column(length = 120)
    private String preferredEducation;

    // =========================================================
    // Location
    // =========================================================

    @Column(length = 120)
    private String city;

    @Column(length = 120)
    private String state;

    @Column(length = 120)
    private String country;

    // =========================================================
    // About
    // =========================================================

    @Column(length = 2000)
    private String aboutMe;

    // =========================================================
    // Completion
    // =========================================================

    @Builder.Default
    @Column(
            name = "completion_percentage",
            nullable = false
    )
    private Integer completionPercentage = 0;

    @Builder.Default
    @Column(
            name = "profile_completed",
            nullable = false
    )
    private Boolean profileCompleted = false;

    // =========================================================
    // Profile Verification
    // =========================================================

    /*
     * NOT_SUBMITTED
     *     Profile has not entered the review queue.
     *
     * PENDING
     *     Waiting for administrator review.
     *
     * APPROVED
     *     Administrator verified the profile.
     *
     * REJECTED
     *     Administrator rejected the profile and
     *     supplied a reason.
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(
            name = "verification_status",
            nullable = false,
            length = 30
    )
    private ProfileVerificationStatus verificationStatus =
            ProfileVerificationStatus.NOT_SUBMITTED;

    /*
     * When the member submitted the profile
     * for administrator verification.
     */
    @Column(name = "verification_submitted_at")
    private LocalDateTime verificationSubmittedAt;

    /*
     * When an administrator completed the review.
     */
    @Column(name = "verification_reviewed_at")
    private LocalDateTime verificationReviewedAt;

    /*
     * Administrator UUID responsible for the
     * most recent verification decision.
     */
    @Column(name = "verification_reviewed_by")
    private UUID verificationReviewedBy;

    /*
     * Optional administrator note/rejection reason.
     */
    @Column(
            name = "verification_reason",
            length = 1000
    )
    private String verificationReason;

// =========================================================
// Profile Boost
// =========================================================

@Column(name = "boost_started_at")
private LocalDateTime boostStartedAt;

@Column(name = "boost_expires_at")
private LocalDateTime boostExpiresAt;



    // =========================================================
    // Audit
    // =========================================================

    @Builder.Default
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (completionPercentage == null) {
            completionPercentage = 0;
        }

        if (profileCompleted == null) {
            profileCompleted = false;
        }

        if (verificationStatus == null) {
            verificationStatus =
                    ProfileVerificationStatus.NOT_SUBMITTED;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    // =========================================================
    // Verification helpers
    // =========================================================

    public void submitForVerification() {

        this.verificationStatus =
                ProfileVerificationStatus.PENDING;

        this.verificationSubmittedAt =
                LocalDateTime.now();

        /*
         * A resubmission clears the previous
         * administrative decision.
         */
        this.verificationReviewedAt = null;
        this.verificationReviewedBy = null;
        this.verificationReason = null;
    }

    public void approveVerification(
            UUID adminId,
            String reason
    ) {

        this.verificationStatus =
                ProfileVerificationStatus.APPROVED;

        this.verificationReviewedAt =
                LocalDateTime.now();

        this.verificationReviewedBy =
                adminId;

        this.verificationReason =
                normalizeVerificationReason(
                        reason
                );
    }

    public void rejectVerification(
            UUID adminId,
            String reason
    ) {

        this.verificationStatus =
                ProfileVerificationStatus.REJECTED;

        this.verificationReviewedAt =
                LocalDateTime.now();

        this.verificationReviewedBy =
                adminId;

        this.verificationReason =
                normalizeVerificationReason(
                        reason
                );
    }

    public boolean isVerificationApproved() {

        return verificationStatus ==
                ProfileVerificationStatus.APPROVED;
    }

    private String normalizeVerificationReason(
            String reason
    ) {

        if (reason == null) {
            return null;
        }

        String normalized =
                reason.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}