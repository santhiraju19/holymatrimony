package com.theholymatrimony.backend.compatibility.service;

import com.theholymatrimony.backend.compatibility.dto.CompatibilityScoreResponse;
import com.theholymatrimony.backend.profile.entity.Profile;
import org.springframework.stereotype.Service;

@Service
public class CompatibilityScoreService {

    private static final int AGE_WEIGHT = 40;
    private static final int DENOMINATION_WEIGHT = 35;
    private static final int EDUCATION_WEIGHT = 25;

    public CompatibilityScoreResponse calculate(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        if (currentProfile == null || candidateProfile == null) {
            return emptyScore();
        }

        boolean ageCompatible =
                isAgeCompatible(
                        currentProfile,
                        candidateProfile
                );

        boolean denominationCompatible =
                isDenominationCompatible(
                        currentProfile,
                        candidateProfile
                );

        boolean educationCompatible =
                isEducationCompatible(
                        currentProfile,
                        candidateProfile
                );

        int ageScore =
                ageCompatible
                        ? AGE_WEIGHT
                        : 0;

        int denominationScore =
                denominationCompatible
                        ? DENOMINATION_WEIGHT
                        : 0;

        int educationScore =
                educationCompatible
                        ? EDUCATION_WEIGHT
                        : 0;

        int totalScore =
                ageScore
                        + denominationScore
                        + educationScore;

        return CompatibilityScoreResponse
                .builder()
                .score(totalScore)
                .ageScore(ageScore)
                .denominationScore(
                        denominationScore
                )
                .educationScore(
                        educationScore
                )
                .ageCompatible(
                        ageCompatible
                )
                .denominationCompatible(
                        denominationCompatible
                )
                .educationCompatible(
                        educationCompatible
                )
                .build();
    }

    /*
     * ============================================================
     * AGE
     * ============================================================
     *
     * Compatibility is evaluated in both directions.
     *
     * Example:
     *
     * Member A prefers 25-30.
     * Member B is 27.
     *
     * Member B prefers 28-34.
     * Member A is 31.
     *
     * Both preferences are satisfied.
     */

    private boolean isAgeCompatible(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        Boolean currentAcceptsCandidate =
                matchesAgePreference(
                        currentProfile,
                        candidateProfile.getAge()
                );

        Boolean candidateAcceptsCurrent =
                matchesAgePreference(
                        candidateProfile,
                        currentProfile.getAge()
                );

        return combinePreferenceResults(
                currentAcceptsCandidate,
                candidateAcceptsCurrent
        );
    }

    private Boolean matchesAgePreference(
            Profile owner,
            Integer candidateAge
    ) {

        Integer from =
                owner.getPreferredAgeFrom();

        Integer to =
                owner.getPreferredAgeTo();

        /*
         * No age preference supplied.
         */
        if (from == null && to == null) {
            return null;
        }

        if (candidateAge == null) {
            return false;
        }

        if (
                from != null
                        && candidateAge < from
        ) {
            return false;
        }

        if (
                to != null
                        && candidateAge > to
        ) {
            return false;
        }

        return true;
    }

    /*
     * ============================================================
     * DENOMINATION
     * ============================================================
     */

    private boolean isDenominationCompatible(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        Boolean currentAcceptsCandidate =
                matchesTextPreference(
                        currentProfile
                                .getPreferredDenomination(),
                        candidateProfile
                                .getDenomination()
                );

        Boolean candidateAcceptsCurrent =
                matchesTextPreference(
                        candidateProfile
                                .getPreferredDenomination(),
                        currentProfile
                                .getDenomination()
                );

        return combinePreferenceResults(
                currentAcceptsCandidate,
                candidateAcceptsCurrent
        );
    }

    /*
     * ============================================================
     * EDUCATION
     * ============================================================
     */

    private boolean isEducationCompatible(
            Profile currentProfile,
            Profile candidateProfile
    ) {

        Boolean currentAcceptsCandidate =
                matchesTextPreference(
                        currentProfile
                                .getPreferredEducation(),
                        candidateProfile
                                .getHighestEducation()
                );

        Boolean candidateAcceptsCurrent =
                matchesTextPreference(
                        candidateProfile
                                .getPreferredEducation(),
                        currentProfile
                                .getHighestEducation()
                );

        return combinePreferenceResults(
                currentAcceptsCandidate,
                candidateAcceptsCurrent
        );
    }

    /*
     * ============================================================
     * TEXT PREFERENCE
     * ============================================================
     */

    private Boolean matchesTextPreference(
            String preference,
            String actualValue
    ) {

        String normalizedPreference =
                normalize(preference);

        /*
         * No preference means this side should not
         * influence the compatibility decision.
         */
        if (normalizedPreference == null) {
            return null;
        }

        String normalizedActual =
                normalize(actualValue);

        if (normalizedActual == null) {
            return false;
        }

        /*
         * Support flexible options such as:
         *
         * Any
         * Any Denomination
         * Any Education
         * No Preference
         */

        if (
                normalizedPreference.equals("any")
                        || normalizedPreference.equals(
                                "any denomination"
                        )
                        || normalizedPreference.equals(
                                "any education"
                        )
                        || normalizedPreference.equals(
                                "no preference"
                        )
        ) {
            return true;
        }

        return normalizedPreference.equals(
                normalizedActual
        );
    }

    /*
     * ============================================================
     * MUTUAL RESULT
     * ============================================================
     *
     * null = that member supplied no preference.
     *
     * If both supplied preferences, both must match.
     *
     * If only one supplied a preference, that preference decides.
     *
     * If neither supplied a preference, treat the category as
     * compatible rather than penalizing incomplete preference data.
     */

    private boolean combinePreferenceResults(
            Boolean first,
            Boolean second
    ) {

        if (first == null && second == null) {
            return true;
        }

        if (first == null) {
            return Boolean.TRUE.equals(
                    second
            );
        }

        if (second == null) {
            return Boolean.TRUE.equals(
                    first
            );
        }

        return Boolean.TRUE.equals(first)
                && Boolean.TRUE.equals(second);
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value
                        .trim()
                        .toLowerCase();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

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
}