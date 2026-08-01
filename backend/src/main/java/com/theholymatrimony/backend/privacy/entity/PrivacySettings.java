
package com.theholymatrimony.backend.privacy.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.privacy.enums.CallPermission;
import com.theholymatrimony.backend.privacy.enums.VisibilityScope;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "privacy_settings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_privacy_settings_user",
                        columnNames = "user_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_privacy_settings_user",
                        columnList = "user_id"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrivacySettings {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "profile_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope profileVisibility =
            VisibilityScope.VERIFIED_MEMBERS;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "photo_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope photoVisibility =
            VisibilityScope.INTEREST_ACCEPTED;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "phone_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope phoneVisibility =
            VisibilityScope.NOBODY;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "email_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope emailVisibility =
            VisibilityScope.NOBODY;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "address_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope addressVisibility =
            VisibilityScope.NOBODY;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "church_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope churchVisibility =
            VisibilityScope.VERIFIED_MEMBERS;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "family_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope familyVisibility =
            VisibilityScope.INTEREST_ACCEPTED;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "online_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope onlineVisibility =
            VisibilityScope.INTEREST_ACCEPTED;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "last_seen_visibility",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private VisibilityScope lastSeenVisibility =
            VisibilityScope.INTEREST_ACCEPTED;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "audio_call_permission",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private CallPermission audioCallPermission =
            CallPermission.INTEREST_ACCEPTED;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "video_call_permission",
            nullable = false,
            length = 40
    )
    @Builder.Default
    private CallPermission videoCallPermission =
            CallPermission.INTEREST_ACCEPTED;

    @Builder.Default
    @Column(
            name = "allow_photo_requests",
            nullable = false
    )
    private Boolean allowPhotoRequests = true;

    @Builder.Default
    @Column(
            name = "allow_contact_requests",
            nullable = false
    )
    private Boolean allowContactRequests = true;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    @Builder.Default
    private LocalDateTime createdAt =
            LocalDateTime.now();

    @Column(
            name = "updated_at"
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        applyDefaults();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();

        applyDefaults();
    }

    private void applyDefaults() {
        if (profileVisibility == null) {
            profileVisibility =
                    VisibilityScope.VERIFIED_MEMBERS;
        }

        if (photoVisibility == null) {
            photoVisibility =
                    VisibilityScope.INTEREST_ACCEPTED;
        }

        if (phoneVisibility == null) {
            phoneVisibility =
                    VisibilityScope.NOBODY;
        }

        if (emailVisibility == null) {
            emailVisibility =
                    VisibilityScope.NOBODY;
        }

        if (addressVisibility == null) {
            addressVisibility =
                    VisibilityScope.NOBODY;
        }

        if (churchVisibility == null) {
            churchVisibility =
                    VisibilityScope.VERIFIED_MEMBERS;
        }

        if (familyVisibility == null) {
            familyVisibility =
                    VisibilityScope.INTEREST_ACCEPTED;
        }

        if (onlineVisibility == null) {
            onlineVisibility =
                    VisibilityScope.INTEREST_ACCEPTED;
        }

        if (lastSeenVisibility == null) {
            lastSeenVisibility =
                    VisibilityScope.INTEREST_ACCEPTED;
        }

        if (audioCallPermission == null) {
            audioCallPermission =
                    CallPermission.INTEREST_ACCEPTED;
        }

        if (videoCallPermission == null) {
            videoCallPermission =
                    CallPermission.INTEREST_ACCEPTED;
        }

        if (allowPhotoRequests == null) {
            allowPhotoRequests = true;
        }

        if (allowContactRequests == null) {
            allowContactRequests = true;
        }
    }
}