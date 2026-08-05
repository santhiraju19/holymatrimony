package com.theholymatrimony.backend.auth.emailotp;

import com.theholymatrimony.backend.auth.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository
        extends JpaRepository<EmailOtp, UUID> {

    Optional<EmailOtp>
    findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
            User user
    );

    void deleteByUser(User user);
}