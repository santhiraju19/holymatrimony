package com.theholymatrimony.backend.auth.passwordreset;

import com.theholymatrimony.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetOtpRepository
        extends JpaRepository<PasswordResetOtp, UUID> {

    Optional<PasswordResetOtp>
    findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
            User user
    );

    Optional<PasswordResetOtp>
    findByResetTokenHashAndConsumedFalse(
            String resetTokenHash
    );

    void deleteByUser(User user);
}