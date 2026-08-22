package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.profile.entity.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedSearchRepository
        extends JpaRepository<SavedSearch, UUID> {

    List<SavedSearch> findAllByUserIdOrderByCreatedAtDesc(
            UUID userId
    );

    Optional<SavedSearch> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    Optional<SavedSearch> findFirstByUserIdAndDefaultSearchTrue(
            UUID userId
    );

    long countByUserId(
            UUID userId
    );

    /*
     * =========================================================
     * SAVED SEARCH ALERT PROCESSING
     * =========================================================
     *
     * Returns enabled searches which have never been processed
     * or whose previous alert processing time is old enough for
     * the requested frequency.
     */

    List<SavedSearch>
    findAllByAlertsEnabledTrueAndAlertFrequencyAndLastAlertedAtBefore(
            com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency
                    alertFrequency,
            Instant cutoff
    );

    List<SavedSearch>
    findAllByAlertsEnabledTrueAndAlertFrequencyAndLastAlertedAtIsNull(
            com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency
                    alertFrequency
    );
}
