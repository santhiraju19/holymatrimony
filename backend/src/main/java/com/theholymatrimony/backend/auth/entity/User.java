package com.theholymatrimony.backend.auth.entity;

import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(
            nullable = false,
            length = 120
    )
    private String fullName;

    @Column(
            nullable = false,
            unique = true,
            length = 150
    )
    private String email;

    /*
     * Nullable for accounts created before
     * mobile registration was introduced.
     */
    @Column(
            unique = true,
            length = 20
    )
    private String mobile;

    @Column(nullable = false)
    private String password;

    /*
     * Null represents a legacy user created before
     * email verification was introduced.
     *
     * Legacy users are treated as verified.
     * New registrations explicitly receive false.
     */
    @Column(name = "email_verified")
    private Boolean emailVerified;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    /*
     * Spring Security login/account switch.
     *
     * Existing authentication code can continue
     * using this field without any changes.
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    /*
     * Application role.
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private Role role = Role.ROLE_USER;

    /*
     * Administrative account status.
     *
     * Existing users will automatically receive ACTIVE
     * when the application loads/saves them.
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    /*
     * Optional reason supplied by an administrator
     * when suspending, blocking or deactivating an account.
     */
    @Column(
            name = "status_reason",
            length = 500
    )
    private String statusReason;

    /*
     * When the account status was last changed.
     */
    @Column(name = "status_changed_at")
    private LocalDateTime statusChangedAt;

    /*
     * UUID of the administrator who last changed
     * this user's account status.
     *
     * We intentionally store the UUID rather than a
     * User relationship to avoid unnecessary circular
     * entity relationships.
     */
    @Column(name = "status_changed_by")
    private UUID statusChangedBy;

    /*
     * Reserved for future profile/dashboard use.
     *
     * Default is 0 until profile completion is calculated.
     */
    @Builder.Default
    @Column(
            name = "profile_completion",
            nullable = false
    )
    private Integer profileCompletion = 0;

    /*
     * Membership value can later become an enum.
     *
     * Keeping it as String initially avoids coupling
     * Admin User Management to subscription development.
     */
    @Builder.Default
    @Column(
            name = "membership_type",
            nullable = false,
            length = 30
    )
    private String membershipType = "FREE";

    /*
     * Last successful login.
     *
     * We will update this from the login service
     * after authentication succeeds.
     */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_seen_at")
private LocalDateTime lastSeenAt;

    @Builder.Default
    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt =
            LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (enabled == null) {
            enabled = true;
        }

        if (role == null) {
            role = Role.ROLE_USER;
        }

        if (status == null) {
            status = UserStatus.ACTIVE;
        }

        if (profileCompletion == null) {
            profileCompletion = 0;
        }

        if (membershipType == null
                || membershipType.isBlank()) {
            membershipType = "FREE";
        }
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    /*
     * Legacy email verification behaviour remains unchanged.
     */
    public boolean isEmailVerificationComplete() {

        return emailVerified == null
                || Boolean.TRUE.equals(emailVerified);
    }

    /*
     * Centralised account-access check.
     *
     * We can later use this from CustomUserDetailsService.
     */
    public boolean isAccountActive() {

        return Boolean.TRUE.equals(enabled)
                && status == UserStatus.ACTIVE;
    }

    /*
     * Convenience method used by admin operations.
     */
    public void changeStatus(
            UserStatus newStatus,
            String reason,
            UUID changedBy
    ) {

        this.status = newStatus;
        this.statusReason = normalizeReason(reason);
        this.statusChangedBy = changedBy;
        this.statusChangedAt = LocalDateTime.now();

        /*
         * Keep the existing enabled field synchronized
         * so existing Spring Security authentication logic
         * immediately respects administrative actions.
         */
        this.enabled =
                newStatus == UserStatus.ACTIVE;
    }

    private String normalizeReason(
            String reason
    ) {

        if (reason == null) {
            return null;
        }

        String trimmed =
                reason.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }
}