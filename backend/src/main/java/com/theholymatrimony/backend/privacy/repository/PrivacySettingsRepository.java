
package com.theholymatrimony.backend.privacy.repository;

import com.theholymatrimony.backend.privacy.entity.PrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PrivacySettingsRepository
        extends JpaRepository<
                PrivacySettings,
                UUID
        > {

    Optional<PrivacySettings>
    findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}