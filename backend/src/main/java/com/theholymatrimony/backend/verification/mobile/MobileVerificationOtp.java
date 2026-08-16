package com.theholymatrimony.backend.verification.mobile;

import com.theholymatrimony.backend.auth.entity.User;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "mobile_verification_otps",
        indexes = {
                @Index(
                        name = "idx_mobile_verification_otp_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_mobile_verification_otp_expires",
                        columnList = "expires_at"
                )
        }
)
public class MobileVerificationOtp {

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

    @Column(
            name = "mobile",
            nullable = false,
            length = 20
    )
    private String mobile;

    @Column(
            name = "otp_hash",
            nullable = false,
            length = 100
    )
    private String otpHash;

    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(nullable = false)
    private Boolean consumed = false;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private LocalDateTime expiresAt;

    @Column(
            name = "last_sent_at",
            nullable = false
    )
    private LocalDateTime lastSentAt;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now =
                LocalDateTime.now();

        if (attempts == null) {
            attempts = 0;
        }

        if (consumed == null) {
            consumed = false;
        }

        if (createdAt == null) {
            createdAt = now;
        }

        if (lastSentAt == null) {
            lastSentAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt =
                LocalDateTime.now();
    }

    public boolean isExpired() {
        return expiresAt == null ||
                LocalDateTime.now()
                        .isAfter(expiresAt);
    }

    public UUID getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }

    public Boolean getConsumed() {
        return consumed;
    }

    public void setConsumed(Boolean consumed) {
        this.consumed = consumed;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt
    ) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getLastSentAt() {
        return lastSentAt;
    }

    public void setLastSentAt(
            LocalDateTime lastSentAt
    ) {
        this.lastSentAt = lastSentAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
