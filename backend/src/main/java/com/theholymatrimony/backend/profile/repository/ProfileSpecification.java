package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.verification.document.IdentityDocumentType;
import com.theholymatrimony.backend.verification.document.IdentityVerificationDocument;
import com.theholymatrimony.backend.verification.entity.MemberVerification;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;

import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class ProfileSpecification {

    private ProfileSpecification() {
    }

    public static Specification<Profile> search(
            SearchProfileRequest request,
            String authenticatedEmail
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates =
                    new ArrayList<>();

            /*
             * Only completed/public profiles may appear.
             */
            predicates.add(
                    criteriaBuilder.isTrue(
                            root.get("profileCompleted")
                    )
            );

            /*
             * Exclude the authenticated user's own profile.
             */
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

            if (request == null) {
                return criteriaBuilder.and(
                        predicates.toArray(
                                new Predicate[0]
                        )
                );
            }

            /*
             * Age
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
             * Basic information
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
             * Church information
             */
            addCaseInsensitiveEquals(
                    predicates,
                    criteriaBuilder,
                    root.get("denomination"),
                    request.getDenomination()
            );

            /*
             * Current location
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
             * Education & career
             */
            addCaseInsensitiveEquals(
                    predicates,
                    criteriaBuilder,
                    root.get("highestEducation"),
                    request.getHighestEducation()
            );

            /*
             * Profession remains contains-based so that
             * older profile values still remain searchable.
             */
            addCaseInsensitiveContains(
                    predicates,
                    criteriaBuilder,
                    root.get("profession"),
                    request.getProfession()
            );

            /*
             * Baptism status
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
             * =====================================================
             * Verification filters
             * =====================================================
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

            return criteriaBuilder.and(
                    predicates.toArray(
                            new Predicate[0]
                    )
            );
        };
    }

    private static Predicate approvedVerificationExists(
            Root<Profile> profileRoot,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
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
                criteriaBuilder.literal(1)
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

    private static Predicate approvedIdentityDocumentExists(
            Root<Profile> profileRoot,
            jakarta.persistence.criteria.CriteriaQuery<?> query,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
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
                criteriaBuilder.literal(1)
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

    private static void addCaseInsensitiveEquals(
            List<Predicate> predicates,
            jakarta.persistence.criteria.CriteriaBuilder
                    criteriaBuilder,
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
            jakarta.persistence.criteria.CriteriaBuilder
                    criteriaBuilder,
            Expression<String> field,
            String value
    ) {

        if (!hasText(value)) {
            return;
        }

        String pattern =
                "%"
                        + value.trim()
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