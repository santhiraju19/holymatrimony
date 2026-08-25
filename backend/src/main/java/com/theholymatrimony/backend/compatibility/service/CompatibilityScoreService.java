package com.theholymatrimony.backend.compatibility.service;

import com.theholymatrimony.backend.compatibility.dto.CompatibilityCategoryResponse;
import com.theholymatrimony.backend.compatibility.dto.CompatibilityScoreResponse;
import com.theholymatrimony.backend.profile.entity.PreferredLocation;
import com.theholymatrimony.backend.profile.entity.Profile;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class CompatibilityScoreService {

    /*
     * ============================================================
     * OVERALL COMPATIBILITY WEIGHTS
     * ============================================================
     *
     * Total possible weight = 100.
     *
     * Important:
     *
     * The score is normalized only across preferences that actually
     * apply to the pair.
     *
     * NOT_APPLICABLE categories are removed from the denominator.
     *
     * Location is treated as one hierarchical category:
     *
     * Country -> State -> District -> City
     */

    private static final int AGE_WEIGHT =
            15;

    private static final int HEIGHT_WEIGHT =
            6;

    private static final int RELIGION_WEIGHT =
            11;

    private static final int DENOMINATION_WEIGHT =
            15;

    private static final int MARITAL_STATUS_WEIGHT =
            8;

    private static final int COMMUNITY_WEIGHT =
            4;

    private static final int MOTHER_TONGUE_WEIGHT =
            4;

    private static final int EDUCATION_WEIGHT =
            9;

    private static final int PROFESSION_WEIGHT =
            6;

    private static final int LOCATION_WEIGHT =
            10;

    private static final int DIET_WEIGHT =
            3;

    private static final int SMOKING_WEIGHT =
            5;

    private static final int DRINKING_WEIGHT =
            4;

    /*
     * ============================================================
     * LEGACY BREAKDOWN WEIGHTS
     * ============================================================
     *
     * Keep these temporarily because existing frontend components
     * still consume:
     *
     * Age          -> 40
     * Denomination -> 35
     * Education    -> 25
     *
     * Compatibility 2.0 uses categories[] as the new richer
     * breakdown while preserving the old API contract.
     */

    private static final int LEGACY_AGE_SCORE =
            40;

    private static final int LEGACY_DENOMINATION_SCORE =
            35;

    private static final int LEGACY_EDUCATION_SCORE =
            25;

    /*
     * ============================================================
     * CALCULATE
     * ============================================================
     */

    public CompatibilityScoreResponse calculate(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        if (
                currentProfile == null
                        || candidateProfile == null
        ) {

            return emptyScore();
        }

        /*
         * ========================================================
         * AGE
         * ========================================================
         */

        MatchResult age =
                evaluateRangePreference(
                        currentProfile.getPreferredAgeFrom(),
                        currentProfile.getPreferredAgeTo(),
                        candidateProfile.getAge(),

                        candidateProfile.getPreferredAgeFrom(),
                        candidateProfile.getPreferredAgeTo(),
                        currentProfile.getAge()
                );

        /*
         * ========================================================
         * HEIGHT
         * ========================================================
         */

        MatchResult height =
                evaluateRangePreference(
                        currentProfile.getPreferredHeightFromCm(),
                        currentProfile.getPreferredHeightToCm(),
                        candidateProfile.getHeightCm(),

                        candidateProfile.getPreferredHeightFromCm(),
                        candidateProfile.getPreferredHeightToCm(),
                        currentProfile.getHeightCm()
                );

        /*
         * ========================================================
         * RELIGION
         * ========================================================
         */

        MatchResult religion =
                evaluateTextPreference(
                        currentProfile.getPreferredReligion(),
                        candidateProfile.getReligion(),

                        candidateProfile.getPreferredReligion(),
                        currentProfile.getReligion()
                );

        /*
         * ========================================================
         * DENOMINATION
         * ========================================================
         */

        MatchResult denomination =
                evaluateTextPreference(
                        currentProfile.getPreferredDenomination(),
                        candidateProfile.getDenomination(),

                        candidateProfile.getPreferredDenomination(),
                        currentProfile.getDenomination()
                );

        /*
         * ========================================================
         * MARITAL STATUS
         * ========================================================
         */

        MatchResult maritalStatus =
                evaluateTextPreference(
                        currentProfile.getPreferredMaritalStatus(),
                        candidateProfile.getMaritalStatus(),

                        candidateProfile.getPreferredMaritalStatus(),
                        currentProfile.getMaritalStatus()
                );

        /*
         * ========================================================
         * COMMUNITY
         * ========================================================
         */

        MatchResult community =
                evaluateCommunityPreference(
                        currentProfile,
                        candidateProfile
                );

        /*
         * ========================================================
         * MOTHER TONGUE
         * ========================================================
         */

        MatchResult motherTongue =
                evaluateTextPreference(
                        currentProfile.getPreferredMotherTongue(),
                        candidateProfile.getMotherTongue(),

                        candidateProfile.getPreferredMotherTongue(),
                        currentProfile.getMotherTongue()
                );

        /*
         * ========================================================
         * EDUCATION
         * ========================================================
         */

        MatchResult education =
                evaluateTextPreference(
                        currentProfile.getPreferredEducation(),
                        candidateProfile.getHighestEducation(),

                        candidateProfile.getPreferredEducation(),
                        currentProfile.getHighestEducation()
                );

        /*
         * ========================================================
         * PROFESSION
         * ========================================================
         */

        MatchResult profession =
                evaluateTextPreference(
                        currentProfile.getPreferredProfession(),
                        candidateProfile.getProfession(),

                        candidateProfile.getPreferredProfession(),
                        currentProfile.getProfession()
                );

        /*
         * ========================================================
         * STRUCTURED LOCATION
         * ========================================================
         *
         * Evaluate:
         *
         * Current member preferredLocations[]
         *     against candidate actual location
         *
         * AND
         *
         * Candidate preferredLocations[]
         *     against current member actual location.
         *
         * Multiple locations use OR semantics.
         *
         * Fields inside one location use AND semantics.
         */

        MatchResult location =
                evaluateLocationPreference(
                        currentProfile,
                        candidateProfile
                );

        /*
         * ========================================================
         * DIET
         * ========================================================
         */

        MatchResult diet =
                evaluateTextPreference(
                        currentProfile.getPreferredDiet(),
                        candidateProfile.getDiet(),

                        candidateProfile.getPreferredDiet(),
                        currentProfile.getDiet()
                );

        /*
         * ========================================================
         * SMOKING
         * ========================================================
         */

        MatchResult smoking =
                evaluateTextPreference(
                        currentProfile.getPreferredSmoking(),
                        candidateProfile.getSmoking(),

                        candidateProfile.getPreferredSmoking(),
                        currentProfile.getSmoking()
                );

        /*
         * ========================================================
         * DRINKING
         * ========================================================
         */

        MatchResult drinking =
                evaluateTextPreference(
                        currentProfile.getPreferredDrinking(),
                        candidateProfile.getDrinking(),

                        candidateProfile.getPreferredDrinking(),
                        currentProfile.getDrinking()
                );

        /*
         * ========================================================
         * FAITH COMMITMENT
         * ========================================================
         *
         * preferredFaithCommitment intentionally remains excluded.
         *
         * Profile stores preferredFaithCommitment but currently has
         * no corresponding actual member-side faithCommitment field.
         *
         * Do not fabricate compatibility from an unrelated field.
         */

        /*
         * ========================================================
         * WEIGHTED OVERALL SCORE
         * ========================================================
         */

        WeightedScore weightedScore =
                new WeightedScore();

        weightedScore.add(
                age,
                AGE_WEIGHT
        );

        weightedScore.add(
                height,
                HEIGHT_WEIGHT
        );

        weightedScore.add(
                religion,
                RELIGION_WEIGHT
        );

        weightedScore.add(
                denomination,
                DENOMINATION_WEIGHT
        );

        weightedScore.add(
                maritalStatus,
                MARITAL_STATUS_WEIGHT
        );

        weightedScore.add(
                community,
                COMMUNITY_WEIGHT
        );

        weightedScore.add(
                motherTongue,
                MOTHER_TONGUE_WEIGHT
        );

        weightedScore.add(
                education,
                EDUCATION_WEIGHT
        );

        weightedScore.add(
                profession,
                PROFESSION_WEIGHT
        );

        weightedScore.add(
                location,
                LOCATION_WEIGHT
        );

        weightedScore.add(
                diet,
                DIET_WEIGHT
        );

        weightedScore.add(
                smoking,
                SMOKING_WEIGHT
        );

        weightedScore.add(
                drinking,
                DRINKING_WEIGHT
        );

        int overallScore =
                weightedScore.percentage();

        /*
         * ========================================================
         * COMPATIBILITY 2.0 CATEGORY BREAKDOWN
         * ========================================================
         *
         * Status meanings:
         *
         * MATCH
         *     At least one meaningful preference applies and every
         *     applicable side accepts the other profile.
         *
         * MISMATCH
         *     At least one meaningful preference applies and one or
         *     both applicable sides do not accept the other profile.
         *
         * FLEXIBLE
         *     Neither member restricted this category.
         *
         * FLEXIBLE categories do not affect the denominator.
         */

        List<CompatibilityCategoryResponse> categories =
                List.of(
                        category(
                                "age",
                                "Age Preference",
                                age,
                                AGE_WEIGHT
                        ),

                        category(
                                "height",
                                "Height Preference",
                                height,
                                HEIGHT_WEIGHT
                        ),

                        category(
                                "religion",
                                "Faith",
                                religion,
                                RELIGION_WEIGHT
                        ),

                        category(
                                "denomination",
                                "Denomination",
                                denomination,
                                DENOMINATION_WEIGHT
                        ),

                        category(
                                "maritalStatus",
                                "Marital Status",
                                maritalStatus,
                                MARITAL_STATUS_WEIGHT
                        ),

                        category(
                                "community",
                                "Community",
                                community,
                                COMMUNITY_WEIGHT
                        ),

                        category(
                                "motherTongue",
                                "Mother Tongue",
                                motherTongue,
                                MOTHER_TONGUE_WEIGHT
                        ),

                        category(
                                "education",
                                "Education",
                                education,
                                EDUCATION_WEIGHT
                        ),

                        category(
                                "profession",
                                "Profession",
                                profession,
                                PROFESSION_WEIGHT
                        ),

                        category(
                                "location",
                                "Location",
                                location,
                                LOCATION_WEIGHT
                        ),

                        category(
                                "diet",
                                "Diet",
                                diet,
                                DIET_WEIGHT
                        ),

                        category(
                                "smoking",
                                "Smoking",
                                smoking,
                                SMOKING_WEIGHT
                        ),

                        category(
                                "drinking",
                                "Drinking",
                                drinking,
                                DRINKING_WEIGHT
                        )
                );

        /*
         * ========================================================
         * LEGACY FRONTEND BREAKDOWN
         * ========================================================
         *
         * Keep until BrowseProfileCard and ProfileDetailsContent
         * are migrated completely to categories[].
         */

        int ageScore =
                age == MatchResult.MATCH
                        ? LEGACY_AGE_SCORE
                        : 0;

        int denominationScore =
                denomination == MatchResult.MATCH
                        ? LEGACY_DENOMINATION_SCORE
                        : 0;

        int educationScore =
                education == MatchResult.MATCH
                        ? LEGACY_EDUCATION_SCORE
                        : 0;

        return CompatibilityScoreResponse
                .builder()

                .score(
                        overallScore
                )

                .categories(
                        categories
                )

                .ageScore(
                        ageScore
                )

                .denominationScore(
                        denominationScore
                )

                .educationScore(
                        educationScore
                )

                .ageCompatible(
                        age == MatchResult.MATCH
                )

                .denominationCompatible(
                        denomination
                                == MatchResult.MATCH
                )

                .educationCompatible(
                        education
                                == MatchResult.MATCH
                )

                .build();
    }

    /*
     * ============================================================
     * RANGE PREFERENCES
     * ============================================================
     */

    private MatchResult evaluateRangePreference(
            Integer firstMinimum,
            Integer firstMaximum,
            Integer secondActual,

            Integer secondMinimum,
            Integer secondMaximum,
            Integer firstActual
    ) {

        Boolean firstAcceptsSecond =
                matchesRangePreference(
                        firstMinimum,
                        firstMaximum,
                        secondActual
                );

        Boolean secondAcceptsFirst =
                matchesRangePreference(
                        secondMinimum,
                        secondMaximum,
                        firstActual
                );

        return combinePreferenceResults(
                firstAcceptsSecond,
                secondAcceptsFirst
        );
    }

    private Boolean matchesRangePreference(
            Integer minimum,
            Integer maximum,
            Integer actualValue
    ) {

        /*
         * No restriction.
         */

        if (
                minimum == null
                        && maximum == null
        ) {

            return null;
        }

        /*
         * A preference exists but the other member has no usable
         * actual value.
         */

        if (actualValue == null) {

            return false;
        }

        if (
                minimum != null
                        && actualValue < minimum
        ) {

            return false;
        }

        if (
                maximum != null
                        && actualValue > maximum
        ) {

            return false;
        }

        return true;
    }

    /*
     * ============================================================
     * TEXT PREFERENCES
     * ============================================================
     */

    private MatchResult evaluateTextPreference(
            String firstPreference,
            String secondActual,

            String secondPreference,
            String firstActual
    ) {

        Boolean firstAcceptsSecond =
                matchesTextPreference(
                        firstPreference,
                        secondActual
                );

        Boolean secondAcceptsFirst =
                matchesTextPreference(
                        secondPreference,
                        firstActual
                );

        return combinePreferenceResults(
                firstAcceptsSecond,
                secondAcceptsFirst
        );
    }

    /*
     * ============================================================
     * COMMUNITY
     * ============================================================
     */

    private MatchResult evaluateCommunityPreference(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        Boolean currentAcceptsCandidate =
                matchesCommunityPreference(
                        currentProfile,
                        candidateProfile.getCommunity()
                );

        Boolean candidateAcceptsCurrent =
                matchesCommunityPreference(
                        candidateProfile,
                        currentProfile.getCommunity()
                );

        return combinePreferenceResults(
                currentAcceptsCandidate,
                candidateAcceptsCurrent
        );
    }

    private Boolean matchesCommunityPreference(
            Profile preferenceOwner,
            String actualCommunity
    ) {

        if (preferenceOwner == null) {

            return null;
        }

        /*
         * Community No Bar means there is intentionally no
         * community restriction.
         */

        if (
                Boolean.TRUE.equals(
                        preferenceOwner.getCommunityNoBar()
                )
        ) {

            return null;
        }

        return matchesTextPreference(
                preferenceOwner.getPreferredCommunity(),
                actualCommunity
        );
    }

    /*
     * ============================================================
     * STRUCTURED LOCATION PREFERENCES
     * ============================================================
     */

    private MatchResult evaluateLocationPreference(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        Boolean currentAcceptsCandidate =
                matchesLocationPreference(
                        currentProfile,
                        candidateProfile.getCountry(),
                        candidateProfile.getState(),
                        candidateProfile.getDistrict(),
                        candidateProfile.getCity()
                );

        Boolean candidateAcceptsCurrent =
                matchesLocationPreference(
                        candidateProfile,
                        currentProfile.getCountry(),
                        currentProfile.getState(),
                        currentProfile.getDistrict(),
                        currentProfile.getCity()
                );

        return combinePreferenceResults(
                currentAcceptsCandidate,
                candidateAcceptsCurrent
        );
    }

    /*
     * Returns:
     *
     * null
     *     Member supplied no meaningful location preference.
     *
     * true
     *     At least one preferred location path matches.
     *
     * false
     *     Meaningful preferences exist but no path matches.
     */

    private Boolean matchesLocationPreference(
            Profile preferenceOwner,
            String actualCountry,
            String actualState,
            String actualDistrict,
            String actualCity
    ) {

        List<LocationPreference> preferredLocations =
                resolveLocationPreferences(
                        preferenceOwner
                );

        if (preferredLocations.isEmpty()) {

            return null;
        }

        for (
                LocationPreference preferredLocation
                : preferredLocations
        ) {

            if (
                    locationPathMatches(
                            preferredLocation,
                            actualCountry,
                            actualState,
                            actualDistrict,
                            actualCity
                    )
            ) {

                return true;
            }
        }

        return false;
    }

    /*
     * ============================================================
     * PREFERRED LOCATION SOURCE
     * ============================================================
     *
     * New source of truth:
     *
     * Profile.preferredLocations[]
     *
     * Legacy scalar fallback:
     *
     * preferredCountry
     * preferredState
     * preferredDistrict
     * preferredCity
     */

    private List<LocationPreference> resolveLocationPreferences(
            Profile profile
    ) {

        List<LocationPreference> result =
                new ArrayList<>();

        if (profile == null) {

            return result;
        }

        List<PreferredLocation> structuredLocations =
                profile.getPreferredLocations();

        if (structuredLocations != null) {

            for (
                    PreferredLocation location
                    : structuredLocations
            ) {

                if (location == null) {

                    continue;
                }

                LocationPreference preference =
                        new LocationPreference(
                                location.getCountry(),
                                location.getState(),
                                location.getDistrict(),
                                location.getCity()
                        );

                if (
                        hasMeaningfulLocationPreference(
                                preference
                        )
                ) {

                    result.add(
                            preference
                    );
                }
            }
        }

        /*
         * Structured locations are authoritative whenever at least
         * one meaningful entry exists.
         */

        if (!result.isEmpty()) {

            return result;
        }

        /*
         * Backward compatibility for profiles saved before the
         * preferredLocations table became the primary source.
         */

        LocationPreference legacy =
                new LocationPreference(
                        profile.getPreferredCountry(),
                        profile.getPreferredState(),
                        profile.getPreferredDistrict(),
                        profile.getPreferredCity()
                );

        if (
                hasMeaningfulLocationPreference(
                        legacy
                )
        ) {

            result.add(
                    legacy
            );
        }

        return result;
    }

    /*
     * ============================================================
     * HIERARCHICAL LOCATION PATH
     * ============================================================
     *
     * Every meaningful field in ONE preferred location must match
     * the corresponding actual profile field.
     *
     * Blank / Any values mean that hierarchy level is unrestricted.
     */

    private boolean locationPathMatches(
            LocationPreference preference,
            String actualCountry,
            String actualState,
            String actualDistrict,
            String actualCity
    ) {

        return locationFieldMatches(
                preference.country(),
                actualCountry
        )

                && locationFieldMatches(
                preference.state(),
                actualState
        )

                && locationFieldMatches(
                preference.district(),
                actualDistrict
        )

                && locationFieldMatches(
                preference.city(),
                actualCity
        );
    }

    private boolean locationFieldMatches(
            String preferredValue,
            String actualValue
    ) {

        String normalizedPreference =
                normalize(
                        preferredValue
                );

        /*
         * Blank / Any means this level is unrestricted.
         */

        if (
                normalizedPreference == null
                        || isNoPreferenceValue(
                                normalizedPreference
                        )
        ) {

            return true;
        }

        String normalizedActual =
                normalize(
                        actualValue
                );

        if (normalizedActual == null) {

            return false;
        }

        return normalizedPreference.equals(
                normalizedActual
        );
    }

    private boolean hasMeaningfulLocationPreference(
            LocationPreference preference
    ) {

        if (preference == null) {

            return false;
        }

        return isMeaningfulPreferenceValue(
                preference.country()
        )

                || isMeaningfulPreferenceValue(
                preference.state()
        )

                || isMeaningfulPreferenceValue(
                preference.district()
        )

                || isMeaningfulPreferenceValue(
                preference.city()
        );
    }

    private boolean isMeaningfulPreferenceValue(
            String value
    ) {

        String normalized =
                normalize(
                        value
                );

        return normalized != null
                && !isNoPreferenceValue(
                        normalized
                );
    }

    /*
     * ============================================================
     * TEXT MATCH
     * ============================================================
     */

    private Boolean matchesTextPreference(
            String preference,
            String actualValue
    ) {

        String normalizedPreference =
                normalize(
                        preference
                );

        if (
                normalizedPreference == null
                        || isNoPreferenceValue(
                                normalizedPreference
                        )
        ) {

            return null;
        }

        String normalizedActual =
                normalize(
                        actualValue
                );

        if (normalizedActual == null) {

            return false;
        }

        return normalizedPreference.equals(
                normalizedActual
        );
    }

    /*
     * ============================================================
     * FLEXIBLE / NO-PREFERENCE VALUES
     * ============================================================
     */

    private boolean isNoPreferenceValue(
            String normalizedValue
    ) {

        if (normalizedValue == null) {

            return true;
        }

        return normalizedValue.equals("any")
                || normalizedValue.equals("all")
                || normalizedValue.equals("any denomination")
                || normalizedValue.equals("any religion")
                || normalizedValue.equals("any education")
                || normalizedValue.equals("any profession")
                || normalizedValue.equals("any community")
                || normalizedValue.equals("any mother tongue")
                || normalizedValue.equals("any marital status")
                || normalizedValue.equals("any country")
                || normalizedValue.equals("any state")
                || normalizedValue.equals("any district")
                || normalizedValue.equals("any city")
                || normalizedValue.equals("any location")
                || normalizedValue.equals("anywhere")
                || normalizedValue.equals("any diet")
                || normalizedValue.equals("no preference")
                || normalizedValue.equals("no bar")
                || normalizedValue.equals("doesn't matter")
                || normalizedValue.equals("does not matter")
                || normalizedValue.equals("not important");
    }

    /*
     * ============================================================
     * MUTUAL PREFERENCE RESULT
     * ============================================================
     *
     * Examples:
     *
     * first FLEXIBLE + second FLEXIBLE
     *     -> NOT_APPLICABLE
     *
     * first FLEXIBLE + second MATCH
     *     -> MATCH
     *
     * first MATCH + second FLEXIBLE
     *     -> MATCH
     *
     * first MATCH + second MATCH
     *     -> MATCH
     *
     * any applicable mismatch
     *     -> MISMATCH
     */

    private MatchResult combinePreferenceResults(
            Boolean first,
            Boolean second
    ) {

        if (
                first == null
                        && second == null
        ) {

            return MatchResult.NOT_APPLICABLE;
        }

        if (first == null) {

            return Boolean.TRUE.equals(
                    second
            )
                    ? MatchResult.MATCH
                    : MatchResult.MISMATCH;
        }

        if (second == null) {

            return Boolean.TRUE.equals(
                    first
            )
                    ? MatchResult.MATCH
                    : MatchResult.MISMATCH;
        }

        return Boolean.TRUE.equals(
                first
        )
                && Boolean.TRUE.equals(
                second
        )
                ? MatchResult.MATCH
                : MatchResult.MISMATCH;
    }

    /*
     * ============================================================
     * COMPATIBILITY CATEGORY
     * ============================================================
     */

    private CompatibilityCategoryResponse category(
            String key,
            String label,
            MatchResult result,
            int weight
    ) {

        MatchResult safeResult =
                result == null
                        ? MatchResult.NOT_APPLICABLE
                        : result;

        String status =
                switch (
                        safeResult
                ) {

                    case MATCH ->
                            "MATCH";

                    case MISMATCH ->
                            "MISMATCH";

                    case NOT_APPLICABLE ->
                            "FLEXIBLE";
                };

        return CompatibilityCategoryResponse
                .builder()

                .key(
                        key
                )

                .label(
                        label
                )

                .status(
                        status
                )

                .weight(
                        weight
                )

                .build();
    }

    /*
     * ============================================================
     * NORMALIZATION
     * ============================================================
     */

    private String normalize(
            String value
    ) {

        if (value == null) {

            return null;
        }

        String normalized =
                value
                        .trim()
                        .replace(
                                '_',
                                ' '
                        )
                        .replace(
                                '-',
                                ' '
                        )
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .toLowerCase(
                                Locale.ROOT
                        );

        return normalized.isBlank()
                ? null
                : normalized;
    }

    /*
     * ============================================================
     * EMPTY RESPONSE
     * ============================================================
     */

    private CompatibilityScoreResponse emptyScore() {

        return CompatibilityScoreResponse
                .builder()

                .score(
                        0
                )

                .categories(
                        List.of()
                )

                .ageScore(
                        0
                )

                .denominationScore(
                        0
                )

                .educationScore(
                        0
                )

                .ageCompatible(
                        false
                )

                .denominationCompatible(
                        false
                )

                .educationCompatible(
                        false
                )

                .build();
    }

    /*
     * ============================================================
     * INTERNAL LOCATION VALUE
     * ============================================================
     */

    private record LocationPreference(
            String country,
            String state,
            String district,
            String city
    ) {
    }

    /*
     * ============================================================
     * INTERNAL RESULT
     * ============================================================
     */

    private enum MatchResult {

        MATCH,

        MISMATCH,

        NOT_APPLICABLE
    }

    /*
     * ============================================================
     * WEIGHTED SCORE
     * ============================================================
     *
     * This is intentionally unchanged from the existing scoring
     * semantics.
     *
     * NOT_APPLICABLE categories do not participate in the
     * denominator.
     */

    private static final class WeightedScore {

        private int earnedWeight;

        private int availableWeight;

        private void add(
                MatchResult result,
                int weight
        ) {

            if (
                    result == null
                            || result
                            == MatchResult.NOT_APPLICABLE
                            || weight <= 0
            ) {

                return;
            }

            availableWeight +=
                    weight;

            if (
                    result == MatchResult.MATCH
            ) {

                earnedWeight +=
                        weight;
            }
        }

        private int percentage() {

            if (availableWeight <= 0) {

                return 0;
            }

            int percentage =
                    (int) Math.round(
                            (
                                    earnedWeight
                                            * 100.0
                            )
                                    / availableWeight
                    );

            return Math.max(
                    0,
                    Math.min(
                            percentage,
                            100
                    )
            );
        }
    }
}
