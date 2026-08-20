package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.compatibility.dto.CompatibilityScoreResponse;
import com.theholymatrimony.backend.compatibility.service.CompatibilityScoreService;
import com.theholymatrimony.backend.profile.dto.BrowseProfilePhotoResponse;

import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;

import com.theholymatrimony.backend.profile.dto.BrowseProfileResponse;
import com.theholymatrimony.backend.profile.dto.BrowseProfilesPageResponse;
import com.theholymatrimony.backend.profile.dto.ProfileContactResponse;
import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;

import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;

import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.profile.repository.ProfileSpecification;

import com.theholymatrimony.backend.profileview.service.ProfileViewService;

import com.theholymatrimony.backend.verification.document.IdentityDocumentType;
import com.theholymatrimony.backend.verification.document.IdentityVerificationDocument;
import com.theholymatrimony.backend.verification.document.IdentityVerificationDocumentRepository;

import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import com.theholymatrimony.backend.verification.repository.MemberVerificationRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrowseProfileService {

    private static final int DEFAULT_PAGE_SIZE =
            12;

    private static final int MAXIMUM_PAGE_SIZE =
            24;

    private static final String SORT_RECOMMENDED =
            "RECOMMENDED";

    private static final String SORT_NEWEST =
            "NEWEST";

    private static final String SORT_TRUST_VERIFIED =
            "TRUST_VERIFIED";

    private final MembershipEntitlementService
            membershipEntitlementService;

    private final ProfileRepository
            profileRepository;

    private final IdentityVerificationDocumentRepository
            identityVerificationDocumentRepository;

    private final ProfilePhotoRepository
            profilePhotoRepository;

    private final MemberVerificationRepository
            memberVerificationRepository;

    private final ProfileViewService
            profileViewService;

    private final CompatibilityScoreService
            compatibilityScoreService;

    /*
     * ============================================================
     * BROWSE PROFILES
     * ============================================================
     */

    public BrowseProfilesPageResponse browseProfiles(
            String authenticatedEmail,
            int page,
            int size
    ) {

        /*
         * Resolve the authenticated member once.
         *
         * This profile becomes the source profile used
         * to calculate mutual compatibility with every
         * candidate on the requested page.
         */

        Profile currentProfile =
                resolveAuthenticatedProfile(
                        authenticatedEmail
                );

        boolean includeCompatibility =
                membershipEntitlementService
                        .hasFeature(
                                currentProfile
                                        .getUser()
                                        .getId(),
                                MembershipFeature
                                        .COMPATIBILITY_SCORE
                        );

        Pageable pageable =
                createRecommendedPageable(
                        page,
                        size
                );

        Page<Profile> profilePage =
                profileRepository.findAll(
                        ProfileSpecification.search(
                                null,
                                authenticatedEmail
                        ),
                        pageable
                );

        return mapPage(
                profilePage,
                currentProfile,
                includeCompatibility
        );
    }

    /*
     * ============================================================
     * SEARCH PROFILES
     * ============================================================
     */

    public BrowseProfilesPageResponse searchProfiles(
            String authenticatedEmail,
            SearchProfileRequest request,
            int page,
            int size
    ) {

        /*
         * ============================================================
         * MEMBERSHIP / ADVANCED SEARCH ENTITLEMENT
         * ============================================================
         *
         * Normal profile browsing remains available to all members.
         *
         * Applying search filters is an Advanced Search capability
         * available to SILVER, GOLD and PLATINUM memberships.
         *
         * Keep the entitlement check in the service layer so the
         * restriction cannot be bypassed by calling the API directly.
         */

        Profile currentProfile =
                resolveAuthenticatedProfile(
                        authenticatedEmail
                );

        UUID authenticatedUserId =
                currentProfile
                        .getUser()
                        .getId();

        membershipEntitlementService
                .requireFeature(
                        authenticatedUserId,
                        MembershipFeature.ADVANCED_SEARCH
                );

        boolean includeCompatibility =
                membershipEntitlementService
                        .hasFeature(
                                authenticatedUserId,
                                MembershipFeature
                                        .COMPATIBILITY_SCORE
                        );

        validateSearchRequest(
                request
        );

        Pageable pageable =
                createSearchPageable(
                        page,
                        size,
                        request
                );

        Page<Profile> profilePage =
                profileRepository.findAll(
                        ProfileSpecification.search(
                                request,
                                authenticatedEmail
                        ),
                        pageable
                );

        return mapPage(
                profilePage,
                currentProfile,
                includeCompatibility
        );
    }

    /*
     * ============================================================
     * GET SINGLE PUBLIC PROFILE
     * ============================================================
     */

    @Transactional
    public BrowseProfileResponse getProfile(
            String authenticatedEmail,
            UUID profileId
    ) {

        Profile profile =
                profileRepository
                        .findByIdAndProfileCompletedTrueAndUserEmailNot(
                                profileId,
                                authenticatedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Profile not found"
                                        )
                        );

        /*
         * Record the profile visit before returning
         * the public profile response.
         */

        profileViewService.recordView(
                authenticatedEmail,
                profile
                        .getUser()
                        .getId()
        );

        Profile currentProfile =
                resolveAuthenticatedProfile(
                        authenticatedEmail
                );

        boolean includeCompatibility =
                membershipEntitlementService
                        .hasFeature(
                                currentProfile
                                        .getUser()
                                        .getId(),
                                MembershipFeature
                                        .COMPATIBILITY_SCORE
                        );

        return map(
                profile,
                currentProfile,
                includeCompatibility
        );
    }

    /*
     * ============================================================
     * GET PROTECTED PROFILE CONTACT DETAILS
     * ============================================================
     */

    public ProfileContactResponse getProfileContact(
            String authenticatedEmail,
            UUID profileId
    ) {

        Profile profile =
                profileRepository
                        .findByIdAndProfileCompletedTrueAndUserEmailNot(
                                profileId,
                                authenticatedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Profile not found"
                                        )
                        );

        membershipEntitlementService
                .requireFeature(
                        resolveAuthenticatedUserId(
                                authenticatedEmail
                        ),
                        MembershipFeature
                                .VIEW_CONTACT_DETAILS
                );

        String mobile =
                profile.getMobile();

        if (
                mobile == null
                        || mobile.isBlank()
        ) {

            mobile =
                    profile
                            .getUser()
                            .getMobile();
        }

        boolean mobileVerified =
                isVerificationApproved(
                        profile
                                .getUser()
                                .getId(),
                        VerificationType.MOBILE
                );

        return ProfileContactResponse
                .builder()

                .profileId(
                        profile.getId()
                )

                .fullName(
                        profile
                                .getUser()
                                .getFullName()
                )

                .email(
                        profile
                                .getUser()
                                .getEmail()
                )

                .mobile(
                        mobile
                )

                .mobileVerified(
                        mobileVerified
                )

                .build();
    }

    /*
     * ============================================================
     * AUTHENTICATED PROFILE RESOLUTION
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
     * AUTHENTICATED USER RESOLUTION
     * ============================================================
     */

    private UUID resolveAuthenticatedUserId(
            String authenticatedEmail
    ) {

        return resolveAuthenticatedProfile(
                authenticatedEmail
        )
                .getUser()
                .getId();
    }

    /*
     * ============================================================
     * RECOMMENDED PAGINATION
     * ============================================================
     *
     * Ordering is supplied by ProfileSpecification.
     *
     * This allows boosted profiles / membership priority /
     * recommendation rules to be controlled centrally by the
     * Criteria query.
     * ============================================================
     */

    private Pageable createRecommendedPageable(
            int page,
            int size
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int requestedSize =
                size <= 0
                        ? DEFAULT_PAGE_SIZE
                        : size;

        int safeSize =
                Math.min(
                        requestedSize,
                        MAXIMUM_PAGE_SIZE
                );

        return PageRequest.of(
                safePage,
                safeSize
        );
    }

    /*
     * ============================================================
     * DEFAULT PAGINATION
     * ============================================================
     */

    private Pageable createPageable(
            int page,
            int size
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int requestedSize =
                size <= 0
                        ? DEFAULT_PAGE_SIZE
                        : size;

        int safeSize =
                Math.min(
                        requestedSize,
                        MAXIMUM_PAGE_SIZE
                );

        return PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }

    /*
     * ============================================================
     * SEARCH PAGINATION / SORTING
     * ============================================================
     */

    private Pageable createSearchPageable(
            int page,
            int size,
            SearchProfileRequest request
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int requestedSize =
                size <= 0
                        ? DEFAULT_PAGE_SIZE
                        : size;

        int safeSize =
                Math.min(
                        requestedSize,
                        MAXIMUM_PAGE_SIZE
                );

        String sort =
                request == null
                        ? null
                        : normalizeSort(
                                request.getSort()
                        );

        /*
         * TRUST_VERIFIED and RECOMMENDED ordering is supplied
         * directly by ProfileSpecification.
         *
         * Pageable must therefore remain unsorted so Spring Data
         * does not override the Criteria ORDER BY.
         */

        if (
                SORT_TRUST_VERIFIED.equals(
                        sort
                )
                        || SORT_RECOMMENDED.equals(
                                sort
                        )
                        || sort == null
        ) {

            return PageRequest.of(
                    safePage,
                    safeSize
            );
        }

        /*
         * NEWEST uses explicit newest-first ordering.
         */

        return PageRequest.of(
                safePage,
                safeSize,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }

    /*
     * ============================================================
     * SEARCH VALIDATION
     * ============================================================
     */

    private void validateSearchRequest(
            SearchProfileRequest request
    ) {

        if (request == null) {
            return;
        }

        Integer ageFrom =
                request.getAgeFrom();

        Integer ageTo =
                request.getAgeTo();

        if (
                ageFrom != null
                        && ageFrom < 18
        ) {

            throw new IllegalArgumentException(
                    "Minimum age must be at least 18"
            );
        }

        if (
                ageTo != null
                        && ageTo < 18
        ) {

            throw new IllegalArgumentException(
                    "Maximum age must be at least 18"
            );
        }

        if (
                ageFrom != null
                        && ageTo != null
                        && ageFrom > ageTo
        ) {

            throw new IllegalArgumentException(
                    "Minimum age cannot be greater than maximum age"
            );
        }

        /*
         * Aadhaar Verified and ID Verified are mutually
         * exclusive under the current one-document-per-user
         * identity verification model.
         */

        if (
                Boolean.TRUE.equals(
                        request.getAadhaarVerified()
                )
                        && Boolean.TRUE.equals(
                                request.getIdVerified()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Aadhaar Verified and ID Verified cannot be selected together"
            );
        }

        String sort =
                normalizeSort(
                        request.getSort()
                );

        if (
                sort != null
                        && !SORT_RECOMMENDED.equals(
                                sort
                        )
                        && !SORT_NEWEST.equals(
                                sort
                        )
                        && !SORT_TRUST_VERIFIED.equals(
                                sort
                        )
        ) {

            throw new IllegalArgumentException(
                    "Unsupported profile sort option"
            );
        }
    }

    /*
     * ============================================================
     * PAGE RESPONSE MAPPING
     * ============================================================
     */

    private BrowseProfilesPageResponse mapPage(
            Page<Profile> profilePage,
            Profile currentProfile,
            boolean includeCompatibility
    ) {

        List<BrowseProfileResponse> profiles =
                profilePage
                        .getContent()
                        .stream()
                        .map(
                                profile ->
                                        map(
                                                profile,
                                                currentProfile,
                                                includeCompatibility
                                        )
                        )
                        .toList();

        return BrowseProfilesPageResponse
                .builder()

                .profiles(
                        profiles
                )

                .page(
                        profilePage
                                .getNumber()
                )

                .size(
                        profilePage
                                .getSize()
                )

                .totalElements(
                        profilePage
                                .getTotalElements()
                )

                .totalPages(
                        profilePage
                                .getTotalPages()
                )

                .first(
                        profilePage
                                .isFirst()
                )

                .last(
                        profilePage
                                .isLast()
                )

                .hasNext(
                        profilePage
                                .hasNext()
                )

                .hasPrevious(
                        profilePage
                                .hasPrevious()
                )

                .build();
    }

    /*
     * ============================================================
     * PROFILE RESPONSE MAPPING
     * ============================================================
     */

    private BrowseProfileResponse map(
            Profile profile,
            Profile currentProfile,
            boolean includeCompatibility
    ) {

        UUID userId =
                profile
                        .getUser()
                        .getId();

        /*
         * ========================================================
         * MEMBERSHIP PROFILE FEATURES
         * ========================================================
         */

        boolean highlightedProfile =
                membershipEntitlementService
                        .hasFeature(
                                userId,
                                MembershipFeature
                                        .HIGHLIGHTED_PROFILE
                        );

        boolean verifiedPremiumBadge =
                membershipEntitlementService
                        .hasFeature(
                                userId,
                                MembershipFeature
                                        .VERIFIED_PREMIUM_BADGE
                        );

        /*
         * ========================================================
         * PROFILE BOOST
         * ========================================================
         *
         * A profile is considered actively boosted only when
         * boostExpiresAt exists and is still in the future.
         *
         * This prevents expired boosts from continuing to display
         * the Boosted badge even if the database still contains
         * the historical boost timestamps.
         */

        boolean boostedProfile =
                profile.getBoostExpiresAt() != null
                        && profile
                                .getBoostExpiresAt()
                                .isAfter(
                                        LocalDateTime.now()
                                );

        ProfilePhoto primaryPhoto =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                userId
                        )
                        .orElse(
                                null
                        );

                        List<ProfilePhoto> profilePhotos =
        profilePhotoRepository
                .findAllByUserIdOrderByDisplayOrderAsc(
                        userId
                );

List<BrowseProfilePhotoResponse> photos =
        profilePhotos
                .stream()
                .sorted(
                        Comparator
                                .comparing(
                                        (ProfilePhoto photo) ->
                                                !Boolean.TRUE.equals(
                                                        photo.getPrimaryPhoto()
                                                )
                                )
                                .thenComparing(
                                        photo ->
                                                photo.getDisplayOrder() == null
                                                        ? Integer.MAX_VALUE
                                                        : photo.getDisplayOrder()
                                )
                )
                .map(
                        photo ->
                                BrowseProfilePhotoResponse
                                        .builder()
                                        .id(photo.getId())
                                        .imageUrl(
                                                photo.getImageUrl()
                                        )
                                        .primaryPhoto(
                                                Boolean.TRUE.equals(
                                                        photo.getPrimaryPhoto()
                                                )
                                        )
                                        .displayOrder(
                                                photo.getDisplayOrder()
                                        )
                                        .build()
                )
                .toList();

        /*
         * --------------------------------------------------------
         * Mobile Verification
         * --------------------------------------------------------
         */

        boolean mobileVerified =
                isVerificationApproved(
                        userId,
                        VerificationType.MOBILE
                );

        /*
         * --------------------------------------------------------
         * Church Verification
         * --------------------------------------------------------
         */

        boolean churchVerified =
                isVerificationApproved(
                        userId,
                        VerificationType.CHURCH
                );

        /*
         * --------------------------------------------------------
         * Identity Verification
         * --------------------------------------------------------
         */

        boolean identityVerified =
                isVerificationApproved(
                        userId,
                        VerificationType.IDENTITY
                );

        IdentityVerificationDocument identityDocument =
                identityVerified
                        ? identityVerificationDocumentRepository
                                .findByUserId(
                                        userId
                                )
                                .orElse(
                                        null
                                )
                        : null;

        /*
         * Aadhaar gets its own public verification badge.
         */

        boolean aadhaarVerified =
                identityDocument != null
                        && identityDocument
                                .getDocumentType()
                        == IdentityDocumentType.AADHAAR;

        /*
         * Any approved non-Aadhaar identity document uses the
         * generic ID Verified badge.
         */

        boolean idVerified =
                identityDocument != null
                        && identityDocument
                                .getDocumentType()
                        != IdentityDocumentType.AADHAAR;

        /*
         * Existing verification compatibility flag.
         *
         * Church verification intentionally remains independent.
         */

        boolean verifiedProfile =
                mobileVerified
                        && identityVerified;

        /*
         * ========================================================
         * COMPATIBILITY SCORE
         * ========================================================
         */

        CompatibilityScoreResponse compatibility =
                includeCompatibility
                        ? compatibilityScoreService
                                .calculate(
                                        currentProfile,
                                        profile
                                )
                        : null;

        return BrowseProfileResponse
                .builder()

                .id(
                        profile.getId()
                )

                .userId(
                        userId
                )

                /*
                 * Membership / Premium Presentation
                 */

                .highlightedProfile(
                        highlightedProfile
                )

                .verifiedPremiumBadge(
                        verifiedPremiumBadge
                )

                /*
                 * Profile Boost
                 */

                .boostedProfile(
                        boostedProfile
                )

                /*
                 * Compatibility
                 */

                .compatibilityScore(
                        compatibility == null
                                ? null
                                : compatibility
                                        .getScore()
                )

                .compatibilityAgeScore(
                        compatibility == null
                                ? null
                                : compatibility
                                        .getAgeScore()
                )

                .compatibilityDenominationScore(
                        compatibility == null
                                ? null
                                : compatibility
                                        .getDenominationScore()
                )

                .compatibilityEducationScore(
                        compatibility == null
                                ? null
                                : compatibility
                                        .getEducationScore()
                )

                /*
                 * Basic Profile
                 */

                .fullName(
                        profile
                                .getUser()
                                .getFullName()
                )

                .dateOfBirth(
                        profile
                                .getDateOfBirth()
                )

                .gender(
                        profile
                                .getGender()
                )

                .age(
                        profile
                                .getAge()
                )

                .maritalStatus(
                        profile
                                .getMaritalStatus()
                )

                /*
                 * Church
                 */

                .denomination(
                        profile
                                .getDenomination()
                )

                .churchName(
                        profile
                                .getChurchName()
                )

                .baptized(
                        profile
                                .getBaptized()
                )

                /*
                 * Education / Profession
                 */

                .highestEducation(
                        profile
                                .getHighestEducation()
                )

                .profession(
                        profile
                                .getProfession()
                )

                .company(
                        profile
                                .getCompany()
                )

                .annualIncome(
                        profile
                                .getAnnualIncome()
                )

                /*
                 * Location
                 */

                .city(
                        profile
                                .getCity()
                )

                .state(
                        profile
                                .getState()
                )

                .country(
                        profile
                                .getCountry()
                )

                /*
                 * About
                 */

                .aboutMe(
                        profile
                                .getAboutMe()
                )

                /*
                 * Completion
                 */

                .completionPercentage(
                        profile
                                .getCompletionPercentage()
                )

                .profileCompleted(
                        profile
                                .getProfileCompleted()
                )

                /*
                 * Trust Verification
                 */

                .mobileVerified(
                        mobileVerified
                )

                .churchVerified(
                        churchVerified
                )

                .identityVerified(
                        identityVerified
                )

                .aadhaarVerified(
                        aadhaarVerified
                )

                .idVerified(
                        idVerified
                )

                .verifiedProfile(
                        verifiedProfile
                )

                /*
                 * Primary Profile Photo
                 */

                .primaryPhotoId(
                        primaryPhoto == null
                                ? null
                                : primaryPhoto
                                        .getId()
                )

                .primaryPhotoUrl(
                        primaryPhoto == null
                                ? null
                                : primaryPhoto
                                        .getImageUrl()
                )

                .photos(photos)

                .build();
    }

    /*
     * ============================================================
     * VERIFICATION HELPERS
     * ============================================================
     */

    private boolean isVerificationApproved(
            UUID userId,
            VerificationType verificationType
    ) {

        return memberVerificationRepository
                .existsByUserIdAndVerificationTypeAndVerificationStatus(
                        userId,
                        verificationType,
                        VerificationStatus.APPROVED
                );
    }

    /*
     * ============================================================
     * SORT HELPERS
     * ============================================================
     */

    private String normalizeSort(
            String value
    ) {

        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }
}