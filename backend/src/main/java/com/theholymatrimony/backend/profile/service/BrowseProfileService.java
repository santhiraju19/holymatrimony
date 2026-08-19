package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.profile.dto.BrowseProfileResponse;
import com.theholymatrimony.backend.profile.dto.BrowseProfilesPageResponse;
import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;

import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;
import com.theholymatrimony.backend.profile.dto.ProfileContactResponse;

import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;

import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.profile.repository.ProfileSpecification;

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

import java.util.List;
import java.util.Locale;
import java.util.UUID;

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

        Pageable pageable =
                createPageable(
                        page,
                        size
                );

        Page<Profile> profilePage =
                profileRepository
                        .findByProfileCompletedTrueAndUserEmailNot(
                                authenticatedEmail,
                                pageable
                        );

        return mapPage(
                profilePage
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
                profilePage
        );
    }

    /*
     * ============================================================
     * GET SINGLE PUBLIC PROFILE
     * ============================================================
     */

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

        return map(
                profile
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

    membershipEntitlementService.requireFeature(
            resolveAuthenticatedUserId(
                    authenticatedEmail
            ),
            MembershipFeature.VIEW_CONTACT_DETAILS
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
 * AUTHENTICATED USER RESOLUTION
 * ============================================================
 */

private UUID resolveAuthenticatedUserId(
        String authenticatedEmail
) {

    return profileRepository
            .findByUserEmail(
                    authenticatedEmail
            )
            .map(
                    profile ->
                            profile
                                    .getUser()
                                    .getId()
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
         * TRUST_VERIFIED ordering is supplied directly by
         * ProfileSpecification.
         *
         * The Pageable must therefore remain unsorted so
         * Spring Data does not override the Criteria ORDER BY.
         */
        if (
                SORT_TRUST_VERIFIED.equals(
                        sort
                )
        ) {

            return PageRequest.of(
                    safePage,
                    safeSize
            );
        }

        /*
         * RECOMMENDED / NEWEST / unspecified currently use
         * newest-first ordering.
         *
         * RECOMMENDED can later evolve into matchmaking
         * relevance ranking without changing the API contract.
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
            Page<Profile> profilePage
    ) {

        List<BrowseProfileResponse> profiles =
                profilePage
                        .getContent()
                        .stream()
                        .map(
                                this::map
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
            Profile profile
    ) {

        UUID userId =
                profile
                        .getUser()
                        .getId();

        ProfilePhoto primaryPhoto =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                userId
                        )
                        .orElse(
                                null
                        );

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

        IdentityVerificationDocument
                identityDocument =
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
         *
         * Examples:
         *
         * PASSPORT
         * DRIVING_LICENCE
         * VOTER_ID
         */
        boolean idVerified =
                identityDocument != null
                        && identityDocument
                                .getDocumentType()
                        != IdentityDocumentType.AADHAAR;

        /*
         * Existing compatibility flag.
         *
         * Church verification intentionally remains independent.
         */
        boolean verifiedProfile =
                mobileVerified
                        && identityVerified;

        return BrowseProfileResponse
                .builder()

                .id(
                        profile.getId()
                )

                .userId(
                        userId
                )

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

                .aboutMe(
                        profile
                                .getAboutMe()
                )

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