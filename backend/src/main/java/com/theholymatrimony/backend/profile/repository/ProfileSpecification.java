package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;

import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;
import com.theholymatrimony.backend.profile.entity.Profile;

import com.theholymatrimony.backend.verification.document.IdentityDocumentType;
import com.theholymatrimony.backend.verification.document.IdentityVerificationDocument;

import com.theholymatrimony.backend.verification.entity.MemberVerification;

import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class ProfileSpecification {

    private static final String SORT_RECOMMENDED =
            "RECOMMENDED";

    private static final String SORT_TRUST_VERIFIED =
            "TRUST_VERIFIED";

    private ProfileSpecification() {
    }

    /*
     * ============================================================
     * PROFILE SEARCH
     * ============================================================
     */

    public static Specification<Profile> search(
            SearchProfileRequest request,
            String authenticatedEmail
    ) {

        return (
                root,
                query,
                criteriaBuilder
        ) -> {

            List<Predicate> predicates =
                    new ArrayList<>();

            /*
             * =====================================================
             * Public Profile Rules
             * =====================================================
             */

            predicates.add(
                    criteriaBuilder.isTrue(
                            root.get(
                                    "profileCompleted"
                            )
                    )
            );

            predicates.add(
                    criteriaBuilder.notEqual(
                            criteriaBuilder.lower(
                                    root.get("user")
                                            .get("email")
                            ),
                            authenticatedEmail
                                    .trim()
                                    .toLowerCase(
                                            Locale.ROOT
                                    )
                    )
            );

            /*
             * =====================================================
             * Optional Search Filters
             * =====================================================
             */

            if (request != null) {

                /*
                 * =================================================
                 * Age
                 * =================================================
                 */

                if (
                        request.getAgeFrom()
                                != null
                ) {

                    predicates.add(
                            criteriaBuilder
                                    .greaterThanOrEqualTo(
                                            root.get("age"),
                                            request.getAgeFrom()
                                    )
                    );
                }

                if (
                        request.getAgeTo()
                                != null
                ) {

                    predicates.add(
                            criteriaBuilder
                                    .lessThanOrEqualTo(
                                            root.get("age"),
                                            request.getAgeTo()
                                    )
                    );
                }

                /*
                 * =================================================
                 * Basic Information
                 * =================================================
                 */

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("gender"),
                        request.getGender()
                );

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("maritalStatus"),
                        request.getMaritalStatus()
                );

                /*
                 * =================================================
                 * Church Information
                 * =================================================
                 */

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("denomination"),
                        request.getDenomination()
                );

                /*
                 * =================================================
                 * Location
                 * =================================================
                 */

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("country"),
                        request.getCountry()
                );

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("state"),
                        request.getState()
                );

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("city"),
                        request.getCity()
                );

                /*
                 * =================================================
                 * Education & Career
                 * =================================================
                 */

                addCaseInsensitiveEquals(
                        predicates,
                        criteriaBuilder,
                        root.get("highestEducation"),
                        request.getHighestEducation()
                );

                addCaseInsensitiveContains(
                        predicates,
                        criteriaBuilder,
                        root.get("profession"),
                        request.getProfession()
                );

                /*
                 * =================================================
                 * Baptism
                 * =================================================
                 */

                if (
                        request.getBaptized()
                                != null
                ) {

                    predicates.add(
                            criteriaBuilder.equal(
                                    root.get("baptized"),
                                    request.getBaptized()
                            )
                    );
                }

                /*
                 * =================================================
                 * Verification Filters
                 * =================================================
                 */

                if (
                        Boolean.TRUE.equals(
                                request.getChurchVerified()
                        )
                ) {

                    predicates.add(
                            approvedVerificationExists(
                                    root,
                                    query,
                                    criteriaBuilder,
                                    VerificationType.CHURCH
                            )
                    );
                }

                if (
                        Boolean.TRUE.equals(
                                request.getAadhaarVerified()
                        )
                ) {

                    predicates.add(
                            approvedIdentityDocumentExists(
                                    root,
                                    query,
                                    criteriaBuilder,
                                    true
                            )
                    );
                }

                if (
                        Boolean.TRUE.equals(
                                request.getIdVerified()
                        )
                ) {

                    predicates.add(
                            approvedIdentityDocumentExists(
                                    root,
                                    query,
                                    criteriaBuilder,
                                    false
                            )
                    );
                }
            }

            /*
             * =====================================================
             * Result Ordering
             * =====================================================
             *
             * Never add ORDER BY to Spring Data's COUNT query.
             */

            if (!isCountQuery(query)) {

                /*
                 * TRUST_VERIFIED
                 *
                 * Trust remains the strongest signal.
                 *
                 * Within the same trust level:
                 *
                 * 1. Active Profile Boost
                 * 2. Platinum Top Search Placement
                 * 3. Newest
                 */

                if (
                        isTrustVerifiedSort(
                                request
                        )
                ) {

                    applyTrustVerifiedOrdering(
                            root,
                            query,
                            criteriaBuilder
                    );

                /*
                 * RECOMMENDED
                 *
                 * 1. Active Profile Boost
                 * 2. Platinum Top Search Placement
                 * 3. Newest
                 */

                } else if (
                        isRecommendedSort(
                                request
                        )
                ) {

                    applyRecommendedOrdering(
                            root,
                            query,
                            criteriaBuilder
                    );
                }
            }

            return criteriaBuilder.and(
                    predicates.toArray(
                            new Predicate[0]
                    )
            );
        };
    }

    /*
     * ============================================================
     * RECOMMENDED RANKING
     * ============================================================
     *
     * Profile Boost is temporary and receives the strongest
     * Recommended visibility signal.
     *
     * Ranking:
     *
     * 1. Active Profile Boost
     * 2. Active Platinum Top Search Placement
     * 3. Newest
     */

    private static void applyRecommendedOrdering(
            Root<Profile> profileRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder
    ) {

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * --------------------------------------------------------
         * Active Profile Boost
         * --------------------------------------------------------
         */

        Predicate activeBoost =
                activeProfileBoost(
                        profileRoot,
                        criteriaBuilder,
                        now
                );

        Expression<Integer> boostScore =
                criteriaBuilder
                        .<Integer>selectCase()
                        .when(
                                activeBoost,
                                1
                        )
                        .otherwise(
                                0
                        );

        /*
         * --------------------------------------------------------
         * Platinum Top Search Placement
         * --------------------------------------------------------
         */

        Predicate topSearchPlacement =
                activePlatinumMembershipExists(
                        profileRoot,
                        query,
                        criteriaBuilder
                );

        Expression<Integer> placementScore =
                criteriaBuilder
                        .<Integer>selectCase()
                        .when(
                                topSearchPlacement,
                                1
                        )
                        .otherwise(
                                0
                        );

        /*
         * --------------------------------------------------------
         * Final Recommended Ordering
         * --------------------------------------------------------
         */

        query.orderBy(

                criteriaBuilder.desc(
                        boostScore
                ),

                criteriaBuilder.desc(
                        placementScore
                ),

                criteriaBuilder.desc(
                        profileRoot.get(
                                "createdAt"
                        )
                )
        );
    }

    /*
     * ============================================================
     * TRUST VERIFIED RANKING
     * ============================================================
     *
     * Trust hierarchy:
     *
     * Aadhaar + Church = 500
     * ID + Church      = 400
     * Aadhaar          = 300
     * ID               = 200
     * Church           = 100
     * Unverified       = 0
     *
     * Within the same trust level:
     *
     * 1. Active Profile Boost
     * 2. Platinum Top Search Placement
     * 3. Newest
     */

    private static void applyTrustVerifiedOrdering(
            Root<Profile> profileRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder
    ) {

        Predicate churchVerified =
                approvedVerificationExists(
                        profileRoot,
                        query,
                        criteriaBuilder,
                        VerificationType.CHURCH
                );

        Predicate aadhaarVerified =
                approvedIdentityDocumentExists(
                        profileRoot,
                        query,
                        criteriaBuilder,
                        true
                );

        Predicate idVerified =
                approvedIdentityDocumentExists(
                        profileRoot,
                        query,
                        criteriaBuilder,
                        false
                );

        /*
         * --------------------------------------------------------
         * Trust Score
         * --------------------------------------------------------
         */

        Expression<Integer> trustScore =
                criteriaBuilder
                        .<Integer>selectCase()

                        .when(
                                criteriaBuilder.and(
                                        aadhaarVerified,
                                        churchVerified
                                ),
                                500
                        )

                        .when(
                                criteriaBuilder.and(
                                        idVerified,
                                        churchVerified
                                ),
                                400
                        )

                        .when(
                                aadhaarVerified,
                                300
                        )

                        .when(
                                idVerified,
                                200
                        )

                        .when(
                                churchVerified,
                                100
                        )

                        .otherwise(
                                0
                        );

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * --------------------------------------------------------
         * Active Boost
         * --------------------------------------------------------
         */

        Predicate activeBoost =
                activeProfileBoost(
                        profileRoot,
                        criteriaBuilder,
                        now
                );

        Expression<Integer> boostScore =
                criteriaBuilder
                        .<Integer>selectCase()
                        .when(
                                activeBoost,
                                1
                        )
                        .otherwise(
                                0
                        );

        /*
         * --------------------------------------------------------
         * Platinum Top Search Placement
         * --------------------------------------------------------
         */

        Predicate topSearchPlacement =
                activePlatinumMembershipExists(
                        profileRoot,
                        query,
                        criteriaBuilder
                );

        Expression<Integer> placementScore =
                criteriaBuilder
                        .<Integer>selectCase()
                        .when(
                                topSearchPlacement,
                                1
                        )
                        .otherwise(
                                0
                        );

        /*
         * --------------------------------------------------------
         * Final Trust Ordering
         * --------------------------------------------------------
         *
         * Payment/boost must never override the trust hierarchy.
         */

        query.orderBy(

                criteriaBuilder.desc(
                        trustScore
                ),

                criteriaBuilder.desc(
                        boostScore
                ),

                criteriaBuilder.desc(
                        placementScore
                ),

                criteriaBuilder.desc(
                        profileRoot.get(
                                "createdAt"
                        )
                )
        );
    }

    /*
     * ============================================================
     * ACTIVE PROFILE BOOST
     * ============================================================
     */

    private static Predicate activeProfileBoost(
            Root<Profile> profileRoot,
            CriteriaBuilder criteriaBuilder,
            LocalDateTime now
    ) {

        return criteriaBuilder.and(

                criteriaBuilder.isNotNull(
                        profileRoot.get(
                                "boostExpiresAt"
                        )
                ),

                criteriaBuilder.greaterThan(
                        profileRoot
                                .<LocalDateTime>get(
                                        "boostExpiresAt"
                                ),
                        now
                )
        );
    }

    /*
     * ============================================================
     * ACTIVE PLATINUM MEMBERSHIP
     * ============================================================
     *
     * Matches effective membership behavior:
     *
     * - plan must be PLATINUM
     * - status must be ACTIVE
     * - expiry must be in the future
     */

    private static Predicate activePlatinumMembershipExists(
            Root<Profile> profileRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder
    ) {

        Subquery<Integer> subquery =
                query.subquery(
                        Integer.class
                );

        Root<Membership> membershipRoot =
                subquery.from(
                        Membership.class
                );

        subquery.select(
                criteriaBuilder.literal(
                        1
                )
        );

        LocalDateTime now =
                LocalDateTime.now();

        subquery.where(
                criteriaBuilder.and(

                        criteriaBuilder.equal(
                                membershipRoot
                                        .get("user")
                                        .get("id"),
                                profileRoot
                                        .get("user")
                                        .get("id")
                        ),

                        criteriaBuilder.equal(
                                membershipRoot
                                        .get("plan"),
                                MembershipPlan.PLATINUM
                        ),

                        criteriaBuilder.equal(
                                membershipRoot
                                        .get("status"),
                                MembershipStatus.ACTIVE
                        ),

                        criteriaBuilder.greaterThan(
                                membershipRoot
                                        .<LocalDateTime>get(
                                                "expiryDate"
                                        ),
                                now
                        )
                )
        );

        return criteriaBuilder.exists(
                subquery
        );
    }

    /*
     * ============================================================
     * SORT HELPERS
     * ============================================================
     */

    private static boolean isRecommendedSort(
            SearchProfileRequest request
    ) {

        /*
         * Missing explicit sort is RECOMMENDED.
         */

        if (
                request == null
                        || !hasText(
                                request.getSort()
                        )
        ) {

            return true;
        }

        return SORT_RECOMMENDED.equals(
                request
                        .getSort()
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        )
        );
    }

    private static boolean isTrustVerifiedSort(
            SearchProfileRequest request
    ) {

        if (
                request == null
                        || !hasText(
                                request.getSort()
                        )
        ) {

            return false;
        }

        return SORT_TRUST_VERIFIED.equals(
                request
                        .getSort()
                        .trim()
                        .toUpperCase(
                                Locale.ROOT
                        )
        );
    }

    private static boolean isCountQuery(
            CriteriaQuery<?> query
    ) {

        Class<?> resultType =
                query.getResultType();

        return resultType == Long.class
                || resultType == long.class;
    }

    /*
     * ============================================================
     * APPROVED VERIFICATION EXISTS
     * ============================================================
     */

    private static Predicate approvedVerificationExists(
            Root<Profile> profileRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder,
            VerificationType verificationType
    ) {

        Subquery<Integer> subquery =
                query.subquery(
                        Integer.class
                );

        Root<MemberVerification> verificationRoot =
                subquery.from(
                        MemberVerification.class
                );

        subquery.select(
                criteriaBuilder.literal(
                        1
                )
        );

        subquery.where(
                criteriaBuilder.and(

                        criteriaBuilder.equal(
                                verificationRoot
                                        .get("user")
                                        .get("id"),
                                profileRoot
                                        .get("user")
                                        .get("id")
                        ),

                        criteriaBuilder.equal(
                                verificationRoot
                                        .get("verificationType"),
                                verificationType
                        ),

                        criteriaBuilder.equal(
                                verificationRoot
                                        .get("verificationStatus"),
                                VerificationStatus.APPROVED
                        )
                )
        );

        return criteriaBuilder.exists(
                subquery
        );
    }

    /*
     * ============================================================
     * APPROVED IDENTITY DOCUMENT EXISTS
     * ============================================================
     */

    private static Predicate approvedIdentityDocumentExists(
            Root<Profile> profileRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder,
            boolean aadhaarOnly
    ) {

        Subquery<Integer> subquery =
                query.subquery(
                        Integer.class
                );

        Root<IdentityVerificationDocument> documentRoot =
                subquery.from(
                        IdentityVerificationDocument.class
                );

        subquery.select(
                criteriaBuilder.literal(
                        1
                )
        );

        Predicate sameUser =
                criteriaBuilder.equal(
                        documentRoot
                                .get("user")
                                .get("id"),
                        profileRoot
                                .get("user")
                                .get("id")
                );

        Predicate approvedIdentity =
                criteriaBuilder.and(

                        criteriaBuilder.equal(
                                documentRoot
                                        .get("verification")
                                        .get("verificationType"),
                                VerificationType.IDENTITY
                        ),

                        criteriaBuilder.equal(
                                documentRoot
                                        .get("verification")
                                        .get("verificationStatus"),
                                VerificationStatus.APPROVED
                        )
                );

        Predicate documentTypePredicate;

        if (aadhaarOnly) {

            documentTypePredicate =
                    criteriaBuilder.equal(
                            documentRoot
                                    .get("documentType"),
                            IdentityDocumentType.AADHAAR
                    );

        } else {

            documentTypePredicate =
                    criteriaBuilder.notEqual(
                            documentRoot
                                    .get("documentType"),
                            IdentityDocumentType.AADHAAR
                    );
        }

        subquery.where(
                criteriaBuilder.and(
                        sameUser,
                        approvedIdentity,
                        documentTypePredicate
                )
        );

        return criteriaBuilder.exists(
                subquery
        );
    }

    /*
     * ============================================================
     * STRING FILTER HELPERS
     * ============================================================
     */

    private static void addCaseInsensitiveEquals(
            List<Predicate> predicates,
            CriteriaBuilder criteriaBuilder,
            Expression<String> field,
            String value
    ) {

        if (!hasText(value)) {
            return;
        }

        predicates.add(
                criteriaBuilder.equal(
                        criteriaBuilder.lower(
                                field
                        ),
                        value.trim()
                                .toLowerCase(
                                        Locale.ROOT
                                )
                )
        );
    }

    private static void addCaseInsensitiveContains(
            List<Predicate> predicates,
            CriteriaBuilder criteriaBuilder,
            Expression<String> field,
            String value
    ) {

        if (!hasText(value)) {
            return;
        }

        String pattern =
                "%"
                        + value
                                .trim()
                                .toLowerCase(
                                        Locale.ROOT
                                )
                        + "%";

        predicates.add(
                criteriaBuilder.like(
                        criteriaBuilder.lower(
                                field
                        ),
                        pattern
                )
        );
    }

    private static boolean hasText(
            String value
    ) {

        return value != null
                && !value.isBlank();
    }
}
