package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;

import com.theholymatrimony.backend.profile.dto.ProfileBoostResponse;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileBoostService {

    private static final Duration BOOST_DURATION =
            Duration.ofHours(24);

    private final ProfileRepository
            profileRepository;

    private final MembershipEntitlementService
            membershipEntitlementService;

    /*
     * ============================================================
     * GET CURRENT BOOST STATUS
     * ============================================================
     */

    @Transactional(readOnly = true)
    public ProfileBoostResponse getStatus(
            String authenticatedEmail
    ) {

        Profile profile =
                findProfile(
                        authenticatedEmail
                );

        LocalDateTime now =
                LocalDateTime.now();

        boolean eligible =
                membershipEntitlementService
                        .hasFeature(
                                profile
                                        .getUser()
                                        .getId(),
                                MembershipFeature
                                        .PROFILE_BOOST
                        );

        boolean active =
                isActive(
                        profile,
                        now
                );

        return buildResponse(
                profile,
                eligible,
                active,
                now
        );
    }

    /*
     * ============================================================
     * ACTIVATE PROFILE BOOST
     * ============================================================
     */

    @Transactional
    public ProfileBoostResponse activate(
            String authenticatedEmail
    ) {

        Profile profile =
                findProfile(
                        authenticatedEmail
                );

        membershipEntitlementService
                .requireFeature(
                        profile
                                .getUser()
                                .getId(),
                        MembershipFeature
                                .PROFILE_BOOST
                );

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * Do not silently extend an existing active boost.
         *
         * This becomes particularly important later when we add
         * monthly boost allowances / purchased boosts.
         */
        if (
                isActive(
                        profile,
                        now
                )
        ) {

            throw new IllegalStateException(
                    "Your profile boost is already active."
            );
        }

        profile.setBoostStartedAt(
                now
        );

        profile.setBoostExpiresAt(
                now.plus(
                        BOOST_DURATION
                )
        );

        Profile savedProfile =
                profileRepository.save(
                        profile
                );

        return buildResponse(
                savedProfile,
                true,
                true,
                now
        );
    }

    /*
     * ============================================================
     * ACTIVE CHECK
     * ============================================================
     */

    private boolean isActive(
            Profile profile,
            LocalDateTime now
    ) {

        return profile.getBoostStartedAt() != null
                && profile.getBoostExpiresAt() != null
                && profile
                        .getBoostExpiresAt()
                        .isAfter(
                                now
                        );
    }

    /*
     * ============================================================
     * RESPONSE
     * ============================================================
     */

    private ProfileBoostResponse buildResponse(
            Profile profile,
            boolean eligible,
            boolean active,
            LocalDateTime now
    ) {

        long remainingMinutes =
                0L;

        if (
                active
                        && profile.getBoostExpiresAt() != null
        ) {

            remainingMinutes =
                    Math.max(
                            0L,
                            Duration
                                    .between(
                                            now,
                                            profile
                                                    .getBoostExpiresAt()
                                    )
                                    .toMinutes()
                    );
        }

        return ProfileBoostResponse
                .builder()

                .eligible(
                        eligible
                )

                .active(
                        active
                )

                .startedAt(
                        profile.getBoostStartedAt()
                )

                .expiresAt(
                        profile.getBoostExpiresAt()
                )

                .remainingMinutes(
                        remainingMinutes
                )

                .build();
    }

    /*
     * ============================================================
     * PROFILE LOOKUP
     * ============================================================
     */

    private Profile findProfile(
            String authenticatedEmail
    ) {

        if (
                authenticatedEmail == null
                        || authenticatedEmail.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        return profileRepository
                .findByUserEmail(
                        authenticatedEmail
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Profile was not found."
                                )
                );
    }
}
