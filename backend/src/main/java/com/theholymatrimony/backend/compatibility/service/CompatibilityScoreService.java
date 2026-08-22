package com.theholymatrimony.backend.compatibility.service;

import com.theholymatrimony.backend.compatibility.dto.CompatibilityScoreResponse;
import com.theholymatrimony.backend.profile.entity.Profile;

import org.springframework.stereotype.Service;

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
     * These weights are used for the comprehensive compatibility
     * percentage returned as CompatibilityScoreResponse.score.
     *
     * A category is included in the denominator only when at least
     * one member actually supplied a preference for that category.
     *
     * This prevents incomplete preference data from creating an
     * artificial 100% compatibility score.
     */

    private static final int AGE_WEIGHT = 15;

    private static final int HEIGHT_WEIGHT = 6;

    private static final int RELIGION_WEIGHT = 11;

    private static final int DENOMINATION_WEIGHT = 15;

    private static final int MARITAL_STATUS_WEIGHT = 8;

    private static final int COMMUNITY_WEIGHT = 4;

    private static final int MOTHER_TONGUE_WEIGHT = 4;

    private static final int EDUCATION_WEIGHT = 9;

    private static final int PROFESSION_WEIGHT = 6;

    private static final int COUNTRY_WEIGHT = 5;

    private static final int STATE_WEIGHT = 3;

    private static final int CITY_WEIGHT = 2;

    private static final int DIET_WEIGHT = 3;

    private static final int SMOKING_WEIGHT = 5;

    private static final int DRINKING_WEIGHT = 4;

    /*
     * ============================================================
     * LEGACY BREAKDOWN WEIGHTS
     * ============================================================
     *
     * Existing frontend compatibility components currently expect:
     *
     * Age          -> maximum 40
     * Denomination -> maximum 35
     * Education    -> maximum 25
     *
     * Keep these values until the frontend compatibility breakdown
     * is upgraded to the richer category model.
     */

    private static final int LEGACY_AGE_SCORE = 40;

    private static final int LEGACY_DENOMINATION_SCORE = 35;

    private static final int LEGACY_EDUCATION_SCORE = 25;

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

        MatchResult age =
                evaluateRangePreference(
                        currentProfile.getPreferredAgeFrom(),
                        currentProfile.getPreferredAgeTo(),
                        candidateProfile.getAge(),

                        candidateProfile.getPreferredAgeFrom(),
                        candidateProfile.getPreferredAgeTo(),
                        currentProfile.getAge()
                );

        MatchResult height =
                evaluateRangePreference(
                        currentProfile.getPreferredHeightFromCm(),
                        currentProfile.getPreferredHeightToCm(),
                        candidateProfile.getHeightCm(),

                        candidateProfile.getPreferredHeightFromCm(),
                        candidateProfile.getPreferredHeightToCm(),
                        currentProfile.getHeightCm()
                );

        MatchResult religion =
                evaluateTextPreference(
                        currentProfile.getPreferredReligion(),
                        candidateProfile.getReligion(),

                        candidateProfile.getPreferredReligion(),
                        currentProfile.getReligion()
                );

        MatchResult denomination =
                evaluateTextPreference(
                        currentProfile.getPreferredDenomination(),
                        candidateProfile.getDenomination(),

                        candidateProfile.getPreferredDenomination(),
                        currentProfile.getDenomination()
                );

        MatchResult maritalStatus =
                evaluateTextPreference(
                        currentProfile.getPreferredMaritalStatus(),
                        candidateProfile.getMaritalStatus(),

                        candidateProfile.getPreferredMaritalStatus(),
                        currentProfile.getMaritalStatus()
                );

        MatchResult community =
                evaluateCommunityPreference(
                        currentProfile,
                        candidateProfile
                );

        MatchResult motherTongue =
                evaluateTextPreference(
                        currentProfile.getPreferredMotherTongue(),
                        candidateProfile.getMotherTongue(),

                        candidateProfile.getPreferredMotherTongue(),
                        currentProfile.getMotherTongue()
                );

        MatchResult education =
                evaluateTextPreference(
                        currentProfile.getPreferredEducation(),
                        candidateProfile.getHighestEducation(),

                        candidateProfile.getPreferredEducation(),
                        currentProfile.getHighestEducation()
                );

        MatchResult profession =
                evaluateTextPreference(
                        currentProfile.getPreferredProfession(),
                        candidateProfile.getProfession(),

                        candidateProfile.getPreferredProfession(),
                        currentProfile.getProfession()
                );

        MatchResult country =
                evaluateTextPreference(
                        currentProfile.getPreferredCountry(),
                        candidateProfile.getCountry(),

                        candidateProfile.getPreferredCountry(),
                        currentProfile.getCountry()
                );

        MatchResult state =
                evaluateTextPreference(
                        currentProfile.getPreferredState(),
                        candidateProfile.getState(),

                        candidateProfile.getPreferredState(),
                        currentProfile.getState()
                );

        MatchResult city =
                evaluateTextPreference(
                        currentProfile.getPreferredCity(),
                        candidateProfile.getCity(),

                        candidateProfile.getPreferredCity(),
                        currentProfile.getCity()
                );

        MatchResult diet =
                evaluateTextPreference(
                        currentProfile.getPreferredDiet(),
                        candidateProfile.getDiet(),

                        candidateProfile.getPreferredDiet(),
                        currentProfile.getDiet()
                );

        MatchResult smoking =
                evaluateTextPreference(
                        currentProfile.getPreferredSmoking(),
                        candidateProfile.getSmoking(),

                        candidateProfile.getPreferredSmoking(),
                        currentProfile.getSmoking()
                );

        MatchResult drinking =
                evaluateTextPreference(
                        currentProfile.getPreferredDrinking(),
                        candidateProfile.getDrinking(),

                        candidateProfile.getPreferredDrinking(),
                        currentProfile.getDrinking()
                );

        /*
         * preferredFaithCommitment intentionally is not included yet.
         *
         * Profile currently stores preferredFaithCommitment but does
         * not have a corresponding member-side faithCommitment field.
         *
         * We should not fabricate a match from unrelated fields.
         * When the candidate-side field is introduced, this category
         * can be added to the scoring engine.
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
                country,
                COUNTRY_WEIGHT
        );

        weightedScore.add(
                state,
                STATE_WEIGHT
        );

        weightedScore.add(
                city,
                CITY_WEIGHT
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
         * EXISTING FRONTEND BREAKDOWN
         * ========================================================
         *
         * Preserve the current API contract while the overall score
         * becomes substantially richer.
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
     *
     * Used by:
     *
     * Age
     * Height
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
         * No preference supplied.
         */

        if (
                minimum == null
                        && maximum == null
        ) {

            return null;
        }

        /*
         * A preference exists but the candidate has not supplied
         * the value required to evaluate it.
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
     *
     * communityNoBar=true means the member explicitly does not
     * want community to influence recommendations.
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

        /*
         * No preference means this side does not contribute to
         * compatibility for the category.
         */

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

        /*
         * Preference exists but candidate data is unavailable.
         */

        if (normalizedActual == null) {

            return false;
        }

        return normalizedPreference.equals(
                normalizedActual
        );
    }

    /*
     * ============================================================
     * FLEXIBLE "NO PREFERENCE" VALUES
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
                || normalizedValue.equals("any city")
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
     * null / null
     *     Neither member supplied a preference.
     *     The category is NOT_APPLICABLE and does not affect
     *     either numerator or denominator.
     *
     * null / true
     * true / null
     *     Only one member supplied a preference and it matches.
     *
     * null / false
     * false / null
     *     Only one member supplied a preference and it fails.
     *
     * true / true
     *     Both members' preferences are satisfied.
     *
     * Any other combination
     *     Mutual compatibility fails for that category.
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

        return Boolean.TRUE.equals(first)
                && Boolean.TRUE.equals(second)
                ? MatchResult.MATCH
                : MatchResult.MISMATCH;
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
                        .replace('_', ' ')
                        .replace('-', ' ')
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
                .score(0)
                .ageScore(0)
                .denominationScore(0)
                .educationScore(0)
                .ageCompatible(false)
                .denominationCompatible(false)
                .educationCompatible(false)
                .build();
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
