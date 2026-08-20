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
             * Public profile rules
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
             *
             * Do not return early when request is null.
             *
             * A missing request means:
             *
             * - no optional filters
             * - RECOMMENDED ordering
             *
             * This allows Platinum Top Search Placement to work
             * even when the user has not selected any filters.
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
                 * Basic information
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
                 * Church information
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

                /*
                 * Profession remains contains-based so older
                 * free-text profile values remain searchable.
                 */

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
             * Don't add ORDER BY to Spring Data's COUNT query.
             */

            if (!isCountQuery(query)) {

                /*
                 * TRUST_VERIFIED
                 *
                 * Trust remains the primary ranking signal.
                 * Platinum placement is only a tie-breaker
                 * within the same trust level.
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
                 * Active Platinum members receive Top Search
                 * Placement before normal profiles.
                 *
                 * No explicit sort is also treated as RECOMMENDED.
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
     * RECOMMENDED / TOP SEARCH PLACEMENT
     * ============================================================
     *
     * Platinum TOP_SEARCH_PLACEMENT is implemented here at the
     * database-query level so ranking happens before pagination.
     *
     * Ranking:
     *
     * 1. Active, unexpired Platinum profiles
     * 2. Everyone else
     * 3. Newest within each group
     */

    private static void applyRecommendedOrdering(
            Root<Profile> profileRoot,
            CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder
    ) {

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

        query.orderBy(
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
     * TRUST RANKING
     * ============================================================
     *
     * Ranking:
     *
     * Aadhaar + Church = 500
     * ID + Church      = 400
     * Aadhaar          = 300
     * ID               = 200
     * Church           = 100
     * Unverified       = 0
     *
     * Within each trust level:
     *
     * 1. Platinum Top Search Placement
     * 2. Newest profile
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

        Expression<Integer> trustScore =
                criteriaBuilder
                        .<Integer>selectCase()

                        /*
                         * Strongest public trust combination.
                         */

                        .when(
                                criteriaBuilder.and(
                                        aadhaarVerified,
                                        churchVerified
                                ),
                                500
                        )

                        /*
                         * Non-Aadhaar government ID + Church.
                         */

                        .when(
                                criteriaBuilder.and(
                                        idVerified,
                                        churchVerified
                                ),
                                400
                        )

                        /*
                         * Aadhaar only.
                         */

                        .when(
                                aadhaarVerified,
                                300
                        )

                        /*
                         * Other approved government ID.
                         */

                        .when(
                                idVerified,
                                200
                        )

                        /*
                         * Church only.
                         */

                        .when(
                                churchVerified,
                                100
                        )

                        .otherwise(
                                0
                        );

        /*
         * Platinum must never override the trust hierarchy.
         *
         * It only receives priority among profiles with the
         * same trust score.
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

        query.orderBy(

                /*
                 * Primary:
                 * public trust level.
                 */

                criteriaBuilder.desc(
                        trustScore
                ),

                /*
                 * Secondary:
                 * Platinum Top Search Placement.
                 */

                criteriaBuilder.desc(
                        placementScore
                ),

                /*
                 * Final tie-break:
                 * newest profile.
                 */

                criteriaBuilder.desc(
                        profileRoot.get(
                                "createdAt"
                        )
                )
        );
    }

    /*
     * ============================================================
     * ACTIVE PLATINUM MEMBERSHIP
     * ============================================================
     *
     * Matches the effective-membership semantics used by
     * MembershipEntitlementService:
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

                        /*
                         * Same candidate user.
                         */

                        criteriaBuilder.equal(
                                membershipRoot
                                        .get("user")
                                        .get("id"),
                                profileRoot
                                        .get("user")
                                        .get("id")
                        ),

                        /*
                         * Platinum only.
                         */

                        criteriaBuilder.equal(
                                membershipRoot
                                        .get("plan"),
                                MembershipPlan.PLATINUM
                        ),

                        /*
                         * Must still be ACTIVE.
                         */

                        criteriaBuilder.equal(
                                membershipRoot
                                        .get("status"),
                                MembershipStatus.ACTIVE
                        ),

                        /*
                         * Must not be expired.
                         */

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
         * No explicit sort is the default RECOMMENDED mode.
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
