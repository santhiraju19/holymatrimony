package com.theholymatrimony.backend.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

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

        if (enabled == null) {
            enabled = true;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }

    public boolean isEmailVerificationComplete() {
        return emailVerified == null ||
                Boolean.TRUE.equals(emailVerified);
    }
}