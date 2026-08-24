package com.theholymatrimony.backend.profile.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
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
import java.util.ArrayList;
import java.util.List;
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
    // Personal Information
    // =========================================================

    @Column(name = "height_cm")
    private Integer heightCm;

    @Column(name = "weight_kg")
    private Integer weightKg;

    @Column(length = 50)
    private String complexion;

    @Column(
            name = "body_type",
            length = 50
    )
    private String bodyType;

    @Column(
            name = "mother_tongue",
            length = 80
    )
    private String motherTongue;

    /*
     * Current religion / faith identity.
     *
     * Kept separate from denomination and community because
     * members may belong to a particular social/community
     * background while currently following Christianity.
     */
    @Column(length = 80)
    private String religion;

    /*
     * Community / caste background.
     *
     * Examples:
     * Reddy
     * Kamma
     * Kapu
     * Nair
     * Dalit Christian
     * Anglo Indian
     *
     * This remains optional.
     */
    @Column(length = 120)
    private String community;

    @Column(
            name = "sub_community",
            length = 120
    )
    private String subCommunity;

    /*
     * Examples:
     *
     * CHRISTIAN_BY_BIRTH
     * CONVERTED_TO_CHRISTIANITY
     * CHRISTIAN_FAMILY_BACKGROUND
     * PREFER_NOT_TO_SAY
     */
    @Column(
            name = "faith_background",
            length = 80
    )
    private String faithBackground;

    @Column(
            name = "physical_status",
            length = 80
    )
    private String physicalStatus;

    @Column(length = 50)
    private String diet;

    @Column(length = 30)
    private String smoking;

    @Column(length = 30)
    private String drinking;

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

    /*
 * Structured church location.
 *
 * Church information remains optional and these fields must never
 * block profile completion or verification submission.
 */
@Column(
        name = "church_country",
        length = 120
)
private String churchCountry;

@Column(
        name = "church_state",
        length = 120
)
private String churchState;

@Column(
        name = "church_district",
        length = 120
)
private String churchDistrict;

@Column(
        name = "church_city",
        length = 120
)
private String churchCity;

    // =========================================================
    // Education
    // =========================================================

    @Column(length = 120)
    private String highestEducation;

    /*
     * Education specialization / field.
     *
     * Examples:
     * Computer Science
     * Medicine
     * Commerce
     * Mechanical Engineering
     */
    @Column(
            name = "education_field",
            length = 120
    )
    private String educationField;

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

    /*
 * Structured family location.
 *
 * familyLocation is retained temporarily for backward compatibility
 * with existing profiles.
 */
@Column(
        name = "family_country",
        length = 120
)
private String familyCountry;

@Column(
        name = "family_state",
        length = 120
)
private String familyState;

@Column(
        name = "family_district",
        length = 120
)
private String familyDistrict;

@Column(
        name = "family_city",
        length = 120
)
private String familyCity;

    @Column(
            name = "family_type",
            length = 50
    )
    private String familyType;

    @Column(
            name = "family_values",
            length = 50
    )
    private String familyValues;

    // =========================================================
    // Partner Preferences
    // =========================================================

    private Integer preferredAgeFrom;

    private Integer preferredAgeTo;

    @Column(name = "preferred_height_from_cm")
    private Integer preferredHeightFromCm;

    @Column(name = "preferred_height_to_cm")
    private Integer preferredHeightToCm;

    @Column(
            name = "preferred_religion",
            length = 80
    )
    private String preferredReligion;

    @Column(length = 120)
    private String preferredDenomination;

    @Column(
            name = "preferred_marital_status",
            length = 50
    )
    private String preferredMaritalStatus;

    @Column(
            name = "preferred_community",
            length = 120
    )
    private String preferredCommunity;

    /*
     * When true, community matching should not restrict
     * recommendations/search results.
     */
    @Builder.Default
    @Column(
            name = "community_no_bar",
            nullable = false
    )
    private Boolean communityNoBar = true;

    @Column(
            name = "preferred_mother_tongue",
            length = 80
    )
    private String preferredMotherTongue;

    @Column(length = 120)
    private String preferredEducation;

    @Column(
            name = "preferred_profession",
            length = 120
    )
    private String preferredProfession;

    @Column(
            name = "preferred_country",
            length = 120
    )
    private String preferredCountry;

    @Column(
            name = "preferred_state",
            length = 120
    )
    private String preferredState;

    @Column(
        name = "preferred_district",
        length = 120
)
private String preferredDistrict;

    @Column(
            name = "preferred_city",
            length = 120
    )
    private String preferredCity;

    // =========================================================
    // Multiple Preferred Locations
    // =========================================================

    @OneToMany(
            mappedBy = "profile",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<PreferredLocation> preferredLocations =
            new ArrayList<>();


    @Column(
            name = "preferred_diet",
            length = 50
    )
    private String preferredDiet;

    @Column(
            name = "preferred_smoking",
            length = 30
    )
    private String preferredSmoking;

    @Column(
            name = "preferred_drinking",
            length = 30
    )
    private String preferredDrinking;

    /*
     * Examples:
     *
     * ANY
     * PRACTICING_CHRISTIAN
     * REGULAR_CHURCH_ATTENDEE
     * BAPTIZED_CHRISTIAN
     * CHURCH_VERIFIED_PREFERRED
     */
    @Column(
            name = "preferred_faith_commitment",
            length = 80
    )
    private String preferredFaithCommitment;

    // =========================================================
    // Location
    // =========================================================

@Column(
        name = "district",
        length = 120
)
private String district;

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

        if (communityNoBar == null) {
            communityNoBar = true;
        }

        if (verificationStatus == null) {
            verificationStatus =
                    ProfileVerificationStatus.NOT_SUBMITTED;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        if (communityNoBar == null) {
            communityNoBar = true;
        }

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


    public List<PreferredLocation> getPreferredLocations() {

        if (preferredLocations == null) {
            preferredLocations =
                    new ArrayList<>();
        }

        return preferredLocations;
    }

}