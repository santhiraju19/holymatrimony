package com.theholymatrimony.backend.profileview.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import com.theholymatrimony.backend.profileview.dto.ProfileViewersPageResponse;
import com.theholymatrimony.backend.profileview.dto.ProfileViewerResponse;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;
import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;

import com.theholymatrimony.backend.notification.service.NotificationFactory;

import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import com.theholymatrimony.backend.profileview.entity.ProfileView;
import com.theholymatrimony.backend.profileview.repository.ProfileViewRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileViewService {

    /*
     * ============================================================
     * NOTIFICATION POLICY
     * ============================================================
     *
     * Reopening or refreshing the same profile should continue
     * updating the view count and lastViewedAt timestamp.
     *
     * To avoid notification spam, the viewed member receives at
     * most one PROFILE_VIEWED notification from the same viewer
     * during each 24-hour period.
     */

    private static final Duration
            NOTIFICATION_COOLDOWN =
            Duration.ofHours(24);

    private final ProfileViewRepository
            profileViewRepository;

    private final UserRepository
            userRepository;

    private final ProfileRepository
            profileRepository;

    private final ProfilePhotoRepository
            profilePhotoRepository;

    private final NotificationFactory
            notificationFactory;


    private final MembershipEntitlementService
            membershipEntitlementService;
    /*
     * ============================================================
     * RECORD PROFILE VIEW
     * ============================================================
     */

    @Transactional
    public void recordView(
            String viewerEmail,
            UUID viewedUserId
    ) {

        String normalizedViewerEmail =
                normalizeEmail(
                        viewerEmail
                );

        if (viewedUserId == null) {
            return;
        }

        User viewer =
                userRepository
                        .findByEmail(
                                normalizedViewerEmail
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Authenticated user not found"
                                        )
                        );

        /*
         * Defensive self-view protection.
         *
         * BrowseProfileService already prevents a member from
         * opening their own profile through the browse endpoint,
         * but recording protects itself independently too.
         */
        if (
                viewer
                        .getId()
                        .equals(
                                viewedUserId
                        )
        ) {
            return;
        }

        User viewedUser =
                userRepository
                        .findById(
                                viewedUserId
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Viewed user not found"
                                        )
                        );

        LocalDateTime now =
                LocalDateTime.now();

        ProfileView existingView =
                profileViewRepository
                        .findByViewerIdAndViewedId(
                                viewer.getId(),
                                viewedUser.getId()
                        )
                        .orElse(null);

        boolean shouldNotify;

        ProfileView profileView;

        if (existingView == null) {

            /*
             * First recorded visit between these two members.
             */
            profileView =
                    ProfileView
                            .builder()
                            .viewer(viewer)
                            .viewed(viewedUser)
                            .firstViewedAt(now)
                            .lastViewedAt(now)
                            .viewCount(1L)
                            .build();

            shouldNotify =
                    true;

        } else {

            profileView =
                    existingView;

            shouldNotify =
                    notificationAllowed(
                            profileView,
                            now
                    );

            profileView.recordView(
                    now
            );
        }

        ProfileView savedView =
                profileViewRepository
                        .save(
                                profileView
                        );

        /*
         * A repeated view inside the notification cooldown still
         * updates lastViewedAt and viewCount, but stops here.
         */
        if (!shouldNotify) {
            return;
        }

        UUID viewerProfileId =
                resolveProfileId(
                        viewer.getId()
                );

        String viewerPhotoUrl =
                resolvePrimaryPhotoUrl(
                        viewer.getId()
                );

        notificationFactory
                .profileViewed(
                        viewedUser.getEmail(),
                        viewer.getFullName(),
                        viewerProfileId.toString(),
                        viewerPhotoUrl
                );

        savedView.markNotified(
                now
        );

        profileViewRepository
                .save(
                        savedView
                );
    }


    /*
     * ============================================================
     * WHO VIEWED ME
     * ============================================================
     */

    @Transactional(readOnly = true)
    public ProfileViewersPageResponse getWhoViewedMe(
            String authenticatedEmail,
            int page,
            int size
    ) {

        String normalizedEmail =
                normalizeEmail(
                        authenticatedEmail
                );

        User authenticatedUser =
                userRepository
                        .findByEmail(
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Authenticated user not found"
                                        )
                        );

        membershipEntitlementService.requireFeature(
                authenticatedUser.getId(),
                MembershipFeature.WHO_VIEWED_ME
        );

        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                Math.min(
                        Math.max(
                                size,
                                1
                        ),
                        50
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize
                );

        Page<ProfileView> viewPage =
                profileViewRepository
                        .findByViewedIdOrderByLastViewedAtDesc(
                                authenticatedUser.getId(),
                                pageable
                        );

        List<ProfileViewerResponse> viewers =
                viewPage
                        .getContent()
                        .stream()
                        .map(
                                this::mapViewer
                        )
                        .toList();

        return ProfileViewersPageResponse
                .builder()
                .viewers(viewers)
                .page(viewPage.getNumber())
                .size(viewPage.getSize())
                .totalElements(
                        viewPage.getTotalElements()
                )
                .totalPages(
                        viewPage.getTotalPages()
                )
                .first(
                        viewPage.isFirst()
                )
                .last(
                        viewPage.isLast()
                )
                .hasNext(
                        viewPage.hasNext()
                )
                .hasPrevious(
                        viewPage.hasPrevious()
                )
                .build();
    }

    private ProfileViewerResponse mapViewer(
            ProfileView profileView
    ) {

        User viewer =
                profileView.getViewer();

        Profile viewerProfile =
                profileRepository
                        .findByUserId(
                                viewer.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Viewer profile not found"
                                        )
                        );

        String primaryPhotoUrl =
                resolvePrimaryPhotoUrl(
                        viewer.getId()
                );

        return ProfileViewerResponse
                .builder()
                .profileId(
                        viewerProfile.getId()
                )
                .fullName(
                        viewer.getFullName()
                )
                .age(
                        viewerProfile.getAge()
                )
                .city(
                        viewerProfile.getCity()
                )
                .state(
                        viewerProfile.getState()
                )
                .country(
                        viewerProfile.getCountry()
                )
                .primaryPhotoUrl(
                        primaryPhotoUrl
                )
                .firstViewedAt(
                        profileView.getFirstViewedAt()
                )
                .lastViewedAt(
                        profileView.getLastViewedAt()
                )
                .viewCount(
                        profileView.getViewCount()
                )
                .build();
    }

    /*
     * ============================================================
     * NOTIFICATION COOLDOWN
     * ============================================================
     */

    private boolean notificationAllowed(
            ProfileView profileView,
            LocalDateTime now
    ) {

        LocalDateTime lastNotifiedAt =
                profileView
                        .getLastNotifiedAt();

        if (lastNotifiedAt == null) {
            return true;
        }

        LocalDateTime nextAllowedAt =
                lastNotifiedAt.plus(
                        NOTIFICATION_COOLDOWN
                );

        return !now.isBefore(
                nextAllowedAt
        );
    }

    /*
     * ============================================================
     * VIEWER PROFILE
     * ============================================================
     */

    private UUID resolveProfileId(
            UUID userId
    ) {

        Profile profile =
                profileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Viewer profile not found"
                                        )
                        );

        return profile.getId();
    }

    /*
     * ============================================================
     * VIEWER PRIMARY PHOTO
     * ============================================================
     */

    private String resolvePrimaryPhotoUrl(
            UUID userId
    ) {

        return profilePhotoRepository
                .findFirstByUserIdAndPrimaryPhotoTrue(
                        userId
                )
                .map(
                        ProfilePhoto::getImageUrl
                )
                .filter(
                        imageUrl ->
                                imageUrl != null
                                        && !imageUrl.isBlank()
                )
                .map(
                        String::trim
                )
                .orElse(null);
    }

    /*
     * ============================================================
     * EMAIL NORMALIZATION
     * ============================================================
     */

    private String normalizeEmail(
            String email
    ) {

        if (
                email == null
                        || email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user email is required"
            );
        }

        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }
}
