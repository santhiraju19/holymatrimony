package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.compatibility.dto.CompatibilityScoreResponse;
import com.theholymatrimony.backend.compatibility.service.CompatibilityScoreService;

import com.theholymatrimony.backend.profile.dto.RecommendedMatchResponse;

import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;

import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.profile.repository.ProfileSpecification;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendedMatchService {

    /*
     * We deliberately inspect more candidates than we ultimately
     * return so compatibility—not database row order—can determine
     * the strongest dashboard recommendations.
     */

    private static final int CANDIDATE_POOL_SIZE = 50;

    private static final int DEFAULT_LIMIT = 6;

    private static final int MAXIMUM_LIMIT = 12;

    private final ProfileRepository
            profileRepository;

    private final ProfilePhotoRepository
            profilePhotoRepository;

    private final CompatibilityScoreService
            compatibilityScoreService;

    /*
     * ============================================================
     * RECOMMENDED MATCHES
     * ============================================================
     */

    public List<RecommendedMatchResponse> getRecommendedMatches(
            String authenticatedEmail,
            int requestedLimit
    ) {

        Profile currentProfile =
                resolveAuthenticatedProfile(
                        authenticatedEmail
                );

        int safeLimit =
                normalizeLimit(
                        requestedLimit
                );

        /*
         * Keep the pageable unsorted.
         *
         * ProfileSpecification already owns the normal recommended
         * ordering rules such as profile boost / membership priority.
         *
         * We subsequently rank the candidate pool by personalized
         * compatibility.
         */

        Page<Profile> candidatePage =
                profileRepository.findAll(
                        ProfileSpecification.search(
                                null,
                                authenticatedEmail
                        ),
                        PageRequest.of(
                                0,
                                CANDIDATE_POOL_SIZE
                        )
                );

        return candidatePage
                .getContent()
                .stream()

                /*
                 * Never recommend the authenticated profile even if
                 * future specification changes accidentally allow it.
                 */
                .filter(
                        candidate ->
                                !candidate
                                        .getId()
                                        .equals(
                                                currentProfile.getId()
                                        )
                )

                .map(
                        candidate ->
                                new RankedCandidate(
                                        candidate,
                                        compatibilityScoreService
                                                .calculate(
                                                        currentProfile,
                                                        candidate
                                                )
                                )
                )

                /*
                 * Personalized compatibility is the primary signal.
                 *
                 * Newer profiles provide deterministic tie-breaking
                 * when scores are equal.
                 */
                .sorted(
                        Comparator
                                .comparingInt(
                                        (RankedCandidate ranked) ->
                                                safeScore(
                                                        ranked
                                                                .compatibility()
                                                )
                                )
                                .reversed()
                                .thenComparing(
                                        ranked ->
                                                ranked.profile()
                                                        .getCreatedAt(),
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                )

                .limit(
                        safeLimit
                )

                .map(
                        this::map
                )

                .toList();
    }

    /*
     * ============================================================
     * MAP DASHBOARD RESPONSE
     * ============================================================
     */

    private RecommendedMatchResponse map(
            RankedCandidate rankedCandidate
    ) {

        Profile profile =
                rankedCandidate.profile();

        CompatibilityScoreResponse compatibility =
                rankedCandidate.compatibility();

        ProfilePhoto primaryPhoto =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                profile
                                        .getUser()
                                        .getId()
                        )
                        .orElse(
                                null
                        );

        return RecommendedMatchResponse
                .builder()

                .id(
                        profile.getId()
                )

                .name(
                        profile
                                .getUser()
                                .getFullName()
                )

                .age(
                        profile.getAge()
                )

                .profession(
                        profile.getProfession()
                )

                .denomination(
                        profile.getDenomination()
                )

                .location(
                        buildLocation(
                                profile
                        )
                )

                .imageUrl(
                        primaryPhoto == null
                                ? null
                                : primaryPhoto
                                        .getImageUrl()
                )

                .compatibilityScore(
                        safeScore(
                                compatibility
                        )
                )

                /*
                 * Leave the trust flags unset here rather than
                 * duplicating BrowseProfileService verification logic.
                 *
                 * They remain optional on the frontend. We can connect
                 * the centralized trust service in the next refinement.
                 */
                .verified(
                        null
                )

                .churchVerified(
                        null
                )

                .build();
    }

    /*
     * ============================================================
     * CURRENT MEMBER
     * ============================================================
     */

    private Profile resolveAuthenticatedProfile(
            String authenticatedEmail
    ) {

        return profileRepository
                .findByUserEmail(
                        authenticatedEmail
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Authenticated profile not found"
                                )
                );
    }

    /*
     * ============================================================
     * LIMIT
     * ============================================================
     */

    private int normalizeLimit(
            int requestedLimit
    ) {

        if (requestedLimit <= 0) {

            return DEFAULT_LIMIT;
        }

        return Math.min(
                requestedLimit,
                MAXIMUM_LIMIT
        );
    }

    /*
     * ============================================================
     * COMPATIBILITY
     * ============================================================
     */

    private static int safeScore(
            CompatibilityScoreResponse compatibility
    ) {

        if (
                compatibility == null
                        || compatibility.getScore() == null
        ) {

            return 0;
        }

        return Math.max(
                0,
                Math.min(
                        compatibility.getScore(),
                        100
                )
        );
    }

    /*
     * ============================================================
     * LOCATION
     * ============================================================
     */

    private String buildLocation(
            Profile profile
    ) {

        return List.of(
                        profile.getCity(),
                        profile.getState(),
                        profile.getCountry()
                )
                .stream()
                .filter(
                        value ->
                                value != null
                                        && !value.isBlank()
                )
                .map(
                        String::trim
                )
                .distinct()
                .reduce(
                        (left, right) ->
                                left + ", " + right
                )
                .orElse(
                        ""
                );
    }

    /*
     * ============================================================
     * INTERNAL RANKED CANDIDATE
     * ============================================================
     */

    private record RankedCandidate(
            Profile profile,
            CompatibilityScoreResponse compatibility
    ) {
    }
}
