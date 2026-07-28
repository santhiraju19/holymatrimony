package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;
import com.theholymatrimony.backend.profile.entity.Profile;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
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
             * Only public, completed profiles may appear.
             */
            predicates.add(
                    criteriaBuilder.isTrue(
                            root.get("profileCompleted")
                    )
            );

            /*
             * Exclude the currently authenticated user's profile.
             */
            predicates.add(
                    criteriaBuilder.notEqual(
                            criteriaBuilder.lower(
                                    root.get("user")
                                            .get("email")
                            ),
                            authenticatedEmail
                                    .trim()
                                    .toLowerCase(Locale.ROOT)
                    )
            );

            if (request == null) {
                return criteriaBuilder.and(
                        predicates.toArray(
                                new Predicate[0]
                        )
                );
            }

            if (request.getAgeFrom() != null) {
                predicates.add(
                        criteriaBuilder.greaterThanOrEqualTo(
                                root.get("age"),
                                request.getAgeFrom()
                        )
                );
            }

            if (request.getAgeTo() != null) {
                predicates.add(
                        criteriaBuilder.lessThanOrEqualTo(
                                root.get("age"),
                                request.getAgeTo()
                        )
                );
            }

            addCaseInsensitiveEquals(
                    predicates,
                    criteriaBuilder,
                    root.get("gender"),
                    request.getGender()
            );

            addCaseInsensitiveEquals(
                    predicates,
                    criteriaBuilder,
                    root.get("denomination"),
                    request.getDenomination()
            );

            addCaseInsensitiveEquals(
                    predicates,
                    criteriaBuilder,
                    root.get("maritalStatus"),
                    request.getMaritalStatus()
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

            if (request.getBaptized() != null) {
                predicates.add(
                        criteriaBuilder.equal(
                                root.get("baptized"),
                                request.getBaptized()
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
                        criteriaBuilder.lower(field),
                        value.trim()
                                .toLowerCase(Locale.ROOT)
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
                        .toLowerCase(Locale.ROOT)
                        + "%";

        predicates.add(
                criteriaBuilder.like(
                        criteriaBuilder.lower(field),
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