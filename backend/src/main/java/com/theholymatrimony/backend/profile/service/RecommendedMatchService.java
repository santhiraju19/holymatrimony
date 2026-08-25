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
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendedMatchService {

    /*
     * We deliberately inspect more candidates than we ultimately
     * return so compatibility—not database row order—can determine
     * the strongest dashboard recommendations.
     */

    private static final int CANDIDATE_POOL_SIZE =
            50;

    private static final int DEFAULT_LIMIT =
            6;

    private static final int MAXIMUM_LIMIT =
            12;

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
     *
     * Matrimony gender rule:
     *
     * Logged-in MALE
     *     -> FEMALE profiles only
     *
     * Logged-in FEMALE
     *     -> MALE profiles only
     *
     * The authenticated profile is always the source of truth.
     */

    public List<RecommendedMatchResponse> getRecommendedMatches(
            String authenticatedEmail,
            int requestedLimit
    ) {

        Profile currentProfile =
                resolveAuthenticatedProfile(
                        authenticatedEmail
                );

        String requiredMatchGender =
                resolveRequiredMatchGender(
                        currentProfile
                );

        int safeLimit =
                normalizeLimit(
                        requestedLimit
                );

        /*
         * Keep the pageable unsorted.
         *
         * ProfileSpecification owns the normal recommended
         * ordering rules such as profile boost / membership priority.
         *
         * We subsequently re-rank the candidate pool by personalized
         * compatibility.
         */

        Page<Profile> candidatePage =
                profileRepository.findAll(
                        ProfileSpecification.search(
                                null,
                                authenticatedEmail,
                                requiredMatchGender
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
                 * Defensive protection:
                 *
                 * ProfileSpecification already excludes the
                 * authenticated profile, but keep this check in case
                 * the specification changes in the future.
                 */

                .filter(
                        candidate ->
                                !candidate
                                        .getId()
                                        .equals(
                                                currentProfile
                                                        .getId()
                                        )
                )

                /*
                 * Defensive gender protection:
                 *
                 * The database query should already enforce this,
                 * but the recommendation stream also refuses to
                 * surface a candidate of the wrong gender.
                 */

                .filter(
                        candidate ->
                                isRequiredGender(
                                        candidate,
                                        requiredMatchGender
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
                                        (
                                                RankedCandidate ranked
                                        ) ->
                                                safeScore(
                                                        ranked
                                                                .compatibility()
                                                )
                                )
                                .reversed()
                                .thenComparing(
                                        ranked ->
                                                ranked
                                                        .profile()
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
     * REQUIRED MATCH GENDER
     * ============================================================
     *
     * MALE   -> FEMALE
     * FEMALE -> MALE
     *
     * Fail closed if the profile contains no usable gender.
     */

    private String resolveRequiredMatchGender(
            Profile currentProfile
    ) {

        if (currentProfile == null) {

            throw new IllegalStateException(
                    "Authenticated profile is required before viewing recommended matches"
            );
        }

        String gender =
                currentProfile.getGender();

        if (
                gender == null
                        || gender.isBlank()
        ) {

            throw new IllegalStateException(
                    "Profile gender is required before viewing recommended matches"
            );
        }

        String normalizedGender =
                gender
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        );

        return switch (
                normalizedGender
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
     * DEFENSIVE GENDER CHECK
     * ============================================================
     */

    private boolean isRequiredGender(
            Profile candidate,
            String requiredGender
    ) {

        if (
                candidate == null
                        || candidate.getGender() == null
                        || candidate.getGender().isBlank()
                        || requiredGender == null
                        || requiredGender.isBlank()
        ) {

            return false;
        }

        return candidate
                .getGender()
                .trim()
                .equalsIgnoreCase(
                        requiredGender
                );
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
                 * They remain optional on the frontend.
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
     * LIMIT NORMALIZATION
     * ============================================================
     */

    private int normalizeLimit(
            int requestedLimit
    ) {

        if (
                requestedLimit <= 0
        ) {

            return DEFAULT_LIMIT;
        }

        return Math.min(
                requestedLimit,
                MAXIMUM_LIMIT
        );
    }

    /*
     * ============================================================
     * SAFE COMPATIBILITY SCORE
     * ============================================================
     */

    private int safeScore(
            CompatibilityScoreResponse compatibility
    ) {

        if (
                compatibility == null
                        || compatibility.getScore() == null
        ) {

            return 0;
        }

        return compatibility
                .getScore();
    }

    /*
     * ============================================================
     * LOCATION
     * ============================================================
     */

    private String buildLocation(
            Profile profile
    ) {

        String city =
                normalizeText(
                        profile.getCity()
                );

        String state =
                normalizeText(
                        profile.getState()
                );

        String country =
                normalizeText(
                        profile.getCountry()
                );

        if (
                city != null
                        && state != null
        ) {

            return city
                    + ", "
                    + state;
        }

        if (city != null) {

            return city;
        }

        if (state != null) {

            return state;
        }

        return country;
    }

    /*
     * ============================================================
     * TEXT NORMALIZATION
     * ============================================================
     */

    private String normalizeText(
            String value
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {

            return null;
        }

        return value.trim();
    }

    /*
     * ============================================================
     * RANKED CANDIDATE
     * ============================================================
     */

    private record RankedCandidate(
            Profile profile,
            CompatibilityScoreResponse compatibility
    ) {
    }
}
