package com.theholymatrimony.backend.profile.scheduler;

import com.theholymatrimony.backend.profile.entity.SavedSearch;
import com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency;
import com.theholymatrimony.backend.profile.repository.SavedSearchRepository;
import com.theholymatrimony.backend.profile.service.SavedSearchAlertService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SavedSearchAlertScheduler {

    /*
     * The scheduler wakes up every 15 minutes.
     *
     * Frequency eligibility is still controlled separately:
     *
     * IMMEDIATE -> 15 minutes
     * DAILY     -> 24 hours
     * WEEKLY    -> 7 days
     */

    private static final Duration IMMEDIATE_INTERVAL =
            Duration.ofMinutes(15);

    private static final Duration DAILY_INTERVAL =
            Duration.ofDays(1);

    private static final Duration WEEKLY_INTERVAL =
            Duration.ofDays(7);

    private final SavedSearchRepository savedSearchRepository;

    private final SavedSearchAlertService savedSearchAlertService;

    /*
     * ============================================================
     * PROCESS SAVED SEARCH ALERTS
     * ============================================================
     */

    @Scheduled(
            fixedDelayString =
                    "${saved-search.alerts.scheduler-delay-ms:900000}",
            initialDelayString =
                    "${saved-search.alerts.initial-delay-ms:60000}"
    )
    public void processSavedSearchAlerts() {

        Instant now = Instant.now();

        Map<UUID, SavedSearch> dueSearches =
                new LinkedHashMap<>();

        collectDueSearches(
                dueSearches,
                SavedSearchAlertFrequency.IMMEDIATE,
                now.minus(IMMEDIATE_INTERVAL)
        );

        collectDueSearches(
                dueSearches,
                SavedSearchAlertFrequency.DAILY,
                now.minus(DAILY_INTERVAL)
        );

        collectDueSearches(
                dueSearches,
                SavedSearchAlertFrequency.WEEKLY,
                now.minus(WEEKLY_INTERVAL)
        );

        if (dueSearches.isEmpty()) {
            return;
        }

        log.info(
                "Processing {} due saved-search alert(s)",
                dueSearches.size()
        );

        for (SavedSearch savedSearch : dueSearches.values()) {

            try {

                savedSearchAlertService.processSavedSearch(
                        savedSearch
                );

            } catch (Exception exception) {

                /*
                 * One bad saved search must never stop processing
                 * the remaining searches.
                 */

                log.error(
                        "Failed processing saved-search alert {}",
                        savedSearch.getId(),
                        exception
                );
            }
        }
    }

    /*
     * ============================================================
     * COLLECT DUE SEARCHES
     * ============================================================
     */

    private void collectDueSearches(
            Map<UUID, SavedSearch> dueSearches,
            SavedSearchAlertFrequency frequency,
            Instant cutoff
    ) {

        /*
         * Searches that have never been evaluated.
         */

        List<SavedSearch> neverProcessed =
                savedSearchRepository
                        .findAllByAlertsEnabledTrueAndAlertFrequencyAndLastAlertedAtIsNull(
                                frequency
                        );

        for (SavedSearch savedSearch : neverProcessed) {

            dueSearches.put(
                    savedSearch.getId(),
                    savedSearch
            );
        }

        /*
         * Searches whose previous evaluation is old enough
         * for their configured frequency.
         */

        List<SavedSearch> previouslyProcessed =
                savedSearchRepository
                        .findAllByAlertsEnabledTrueAndAlertFrequencyAndLastAlertedAtBefore(
                                frequency,
                                cutoff
                        );

        for (SavedSearch savedSearch : previouslyProcessed) {

            dueSearches.put(
                    savedSearch.getId(),
                    savedSearch
            );
        }
    }
}
