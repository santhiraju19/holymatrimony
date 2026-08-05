package com.theholymatrimony.backend.auth.passwordreset;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "password_reset_otps",
        indexes = {
                @Index(
                        name = "idx_password_reset_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_password_reset_token_hash",
                        columnList = "reset_token_hash"
                ),
                @Index(
                        name = "idx_password_reset_otp_expiry",
                        columnList = "otp_expires_at"
                )
        }
)
@Getter
@Setter
public class PasswordResetOtp {

    @Id
    @GeneratedValue
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
            name = "otp_hash",
            nullable = false,
            length = 100
    )
    private String otpHash;

    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(
            name = "otp_verified",
            nullable = false
    )
    private Boolean otpVerified = false;

    @Column(nullable = false)
    private Boolean consumed = false;

    @Column(
            name = "otp_expires_at",
            nullable = false
    )
    private LocalDateTime otpExpiresAt;

    @Column(
            name = "last_sent_at",
            nullable = false
    )
    private LocalDateTime lastSentAt;

    @Column(
            name = "reset_token_hash",
            unique = true,
            length = 64
    )
    private String resetTokenHash;

    @Column(
            name = "reset_token_expires_at"
    )
    private LocalDateTime resetTokenExpiresAt;

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (lastSentAt == null) {
            lastSentAt = now;
        }

        if (attempts == null) {
            attempts = 0;
        }

        if (otpVerified == null) {
            otpVerified = false;
        }

        if (consumed == null) {
            consumed = false;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isOtpExpired() {
        return otpExpiresAt == null
                || LocalDateTime.now().isAfter(otpExpiresAt);
    }

    public boolean isResetTokenExpired() {
        return resetTokenExpiresAt == null
                || LocalDateTime.now()
                .isAfter(resetTokenExpiresAt);
    }
}