package com.theholymatrimony.backend.verification.mobile;

import com.theholymatrimony.backend.auth.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MobileVerificationOtpRepository
        extends JpaRepository<MobileVerificationOtp, UUID> {

    Optional<MobileVerificationOtp>
    findFirstByUserAndConsumedFalseOrderByCreatedAtDesc(
            User user
    );

    void deleteByUser(
            User user
    );
}
