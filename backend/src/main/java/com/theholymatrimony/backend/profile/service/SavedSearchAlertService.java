package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.notification.dto.CreateNotificationRequest;
import com.theholymatrimony.backend.notification.entity.NotificationType;
import com.theholymatrimony.backend.notification.service.NotificationService;

import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.SavedSearch;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.profile.repository.ProfileSpecification;
import com.theholymatrimony.backend.profile.repository.SavedSearchRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import java.util.List;
import java.util.Locale;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedSearchAlertService {

    /*
     * Maximum number of matching profiles we need to inspect
     * during one saved-search alert evaluation.
     *
     * We are creating a summary notification rather than one
     * notification per profile.
     */
    private static final int MATCH_LIMIT = 50;

    private final SavedSearchRepository
            savedSearchRepository;

    private final ProfileRepository
            profileRepository;

    private final UserRepository
            userRepository;

    private final SavedSearchService
            savedSearchService;

    private final NotificationService
            notificationService;

    /*
     * ============================================================
     * PROCESS ONE SAVED SEARCH
     * ============================================================
     */

    @Transactional
    public void processSavedSearch(
            SavedSearch savedSearch
    ) {

        if (savedSearch == null) {
            return;
        }

        if (!savedSearch.isAlertsEnabled()) {
            return;
        }

        /*
         * Resolve the owner.
         *
         * If the user no longer exists, simply skip the saved
         * search. We do not want one orphaned row to stop the
         * scheduler.
         */
        Optional<User> userOptional =
                userRepository.findById(
                        savedSearch.getUserId()
                );

        if (userOptional.isEmpty()) {
            return;
        }

        User user =
                userOptional.get();

        /*
         * Disabled/deactivated accounts should not receive
         * saved-search notifications.
         */
        if (!user.isAccountActive()) {

            markProcessed(
                    savedSearch
            );

            return;
        }

        String email =
                user.getEmail();

        if (
                email == null
                        || email.isBlank()
        ) {

            markProcessed(
                    savedSearch
            );

            return;
        }

        /*


         * Resolve the saved-search owner's profile so alerts obey


         * the same matrimony gender rule as Browse, Search and


         * Dashboard Recommendations.


         */



        Optional<Profile> currentProfileOptional =


                profileRepository.findByUserEmail(


                        email


                );



        if (currentProfileOptional.isEmpty()) {



            markProcessed(


                    savedSearch


            );



            return;


        }



        Profile currentProfile =


                currentProfileOptional.get();



        String requiredMatchGender =


                resolveRequiredMatchGender(


                        currentProfile


                );



        SearchProfileRequest request =


                savedSearchService


                        .toSearchProfileRequest(


                                savedSearch


                        );

        /*
         * Search using the same ProfileSpecification used by
         * normal member search.
         *
         * This deliberately avoids BrowseProfileService because
         * background processing should not depend on the current
         * HTTP request or trigger ADVANCED_SEARCH authorization.
         */
        Pageable pageable =
                PageRequest.of(
                        0,
                        MATCH_LIMIT
                );

        Page<Profile> matches =
                profileRepository.findAll(
                        ProfileSpecification.search(
                                request,
                                email,
                                requiredMatchGender
                        ),
                        pageable
                );

        Instant previousAlertTime =
                savedSearch.getLastAlertedAt();

        /*
         * ========================================================
         * NEW MATCH DETECTION
         * ========================================================
         *
         * First evaluation:
         *     Profiles created after the saved search itself.
         *
         * Later evaluations:
         *     Profiles created after the previous evaluation.
         *
         * This prevents the member from receiving repeated alerts
         * for the same historical profiles.
         */
        Instant baseline =
                previousAlertTime != null
                        ? previousAlertTime
                        : savedSearch.getCreatedAt();

        long newMatchCount =
                matches
                        .getContent()
                        .stream()
                        .filter(
                                profile ->
                                        isNewMatch(
                                                profile,
                                                baseline
                                        )
                        )
                        .count();

        /*
         * Mark the evaluation time even when there are zero
         * matches.
         *
         * Otherwise DAILY/WEEKLY searches with no results would
         * remain continuously due.
         */
        markProcessed(
                savedSearch
        );

        if (newMatchCount <= 0) {
            return;
        }

        createNotification(
                user,
                savedSearch,
                newMatchCount
        );
    }

    /*
     * ============================================================
     * REQUIRED MATCH GENDER
     * ============================================================
     *
     * MALE   -> FEMALE
     * FEMALE -> MALE
     *
     * Saved-search alerts use the authenticated member's profile
     * as the only source of truth for candidate gender.
     */

    private String resolveRequiredMatchGender(
            Profile currentProfile
    ) {

        if (currentProfile == null) {

            throw new IllegalStateException(
                    "Profile is required before processing saved-search alerts"
            );
        }

        String gender =
                currentProfile.getGender();

        if (
                gender == null
                        || gender.isBlank()
        ) {

            throw new IllegalStateException(
                    "Profile gender is required before processing saved-search alerts"
            );
        }

        return switch (
                gender
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        )
        ) {

            case "MALE" ->
                    "FEMALE";

            case "FEMALE" ->
                    "MALE";

            default ->
                    throw new IllegalStateException(
                            "Unsupported profile gender: "
                                    + gender
                    );
        };
    }



    /*
     * ============================================================
     * NEW MATCH
     * ============================================================
     */

    private boolean isNewMatch(
            Profile profile,
            Instant baseline
    ) {

        if (profile == null) {
            return false;
        }

        if (baseline == null) {
            return true;
        }

        /*
         * Profile.createdAt currently uses LocalDateTime.
         *
         * Application persistence is configured around UTC,
         * therefore convert using UTC before comparing against
         * SavedSearch.lastAlertedAt (Instant).
         */
        LocalDateTime createdAt =
                profile.getCreatedAt();

        if (createdAt == null) {
            return false;
        }

        Instant profileCreatedAt =
                createdAt.toInstant(
                        ZoneOffset.UTC
                );

        return profileCreatedAt.isAfter(
                baseline
        );
    }

    /*
     * ============================================================
     * NOTIFICATION
     * ============================================================
     */

    private void createNotification(
            User user,
            SavedSearch savedSearch,
            long newMatchCount
    ) {

        String title =
                newMatchCount == 1
                        ? "New match found"
                        : "New matches found";

        String message =
                newMatchCount == 1
                        ? "1 new profile matches your saved search \""
                                + savedSearch.getName()
                                + "\"."
                        : newMatchCount
                                + " new profiles match your saved search \""
                                + savedSearch.getName()
                                + "\".";

        /*
         * Reference the saved search so the frontend can identify
         * which saved search generated the notification.
         */
        CreateNotificationRequest request =
                new CreateNotificationRequest(
                        user.getEmail(),
                        NotificationType.SAVED_SEARCH_MATCH,
                        title,
                        message,
                        savedSearch.getId().toString(),
                        "/saved-searches",
                        null
                );

        notificationService.create(
                request
        );
    }

    /*
     * ============================================================
     * MARK PROCESSED
     * ============================================================
     */

    private void markProcessed(
            SavedSearch savedSearch
    ) {

        savedSearch.setLastAlertedAt(
                Instant.now()
        );

        savedSearchRepository.save(
                savedSearch
        );
    }
}