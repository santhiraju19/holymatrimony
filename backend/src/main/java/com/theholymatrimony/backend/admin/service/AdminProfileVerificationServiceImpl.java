package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminProfileDetailResponse;
import com.theholymatrimony.backend.admin.dto.AdminProfilePageResponse;
import com.theholymatrimony.backend.admin.dto.AdminProfileResponse;
import com.theholymatrimony.backend.admin.dto.UpdateProfileVerificationRequest;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.profile.dto.PhotoResponse;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;
import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminProfileVerificationServiceImpl
        implements AdminProfileVerificationService {

    private static final int DEFAULT_PAGE_SIZE = 20;

    private static final int MAX_PAGE_SIZE = 100;

    private final ProfileRepository
            profileRepository;

    private final ProfilePhotoRepository
            profilePhotoRepository;

    private final UserRepository
            userRepository;

    @Override
    public AdminProfilePageResponse getProfiles(
            int page,
            int size,
            String search,
            ProfileVerificationStatus status
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                normalizePageSize(
                        size
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "verificationSubmittedAt"
                        ).and(
                                Sort.by(
                                        Sort.Direction.DESC,
                                        "createdAt"
                                )
                        )
                );

        Page<Profile> profiles =
                profileRepository
                        .searchAdminProfiles(
                                normalizeSearch(
                                        search
                                ),
                                status,
                                pageable
                        );

        List<AdminProfileResponse> content =
                profiles
                        .getContent()
                        .stream()
                        .map(
                                this::toListResponse
                        )
                        .toList();

        return AdminProfilePageResponse
                .builder()
                .content(content)
                .page(
                        profiles.getNumber()
                )
                .size(
                        profiles.getSize()
                )
                .totalElements(
                        profiles.getTotalElements()
                )
                .totalPages(
                        profiles.getTotalPages()
                )
                .first(
                        profiles.isFirst()
                )
                .last(
                        profiles.isLast()
                )
                .build();
    }

    @Override
    public AdminProfileDetailResponse getProfile(
            UUID profileId
    ) {

        Profile profile =
                findProfile(
                        profileId
                );

        return toDetailResponse(
                profile
        );
    }

    @Override
    @Transactional
    public AdminProfileDetailResponse updateVerification(
            UUID profileId,
            UpdateProfileVerificationRequest request
    ) {

        Profile profile =
                findProfile(
                        profileId
                );

        User currentAdmin =
                getCurrentAdmin();

        ProfileVerificationStatus requestedStatus =
                request.getStatus();

        if (
                requestedStatus !=
                        ProfileVerificationStatus.APPROVED
                        &&
                requestedStatus !=
                        ProfileVerificationStatus.REJECTED
        ) {

            throw new IllegalArgumentException(
                    "Admin verification status must be APPROVED or REJECTED."
            );
        }

        /*
         * Only submitted profiles should be reviewed.
         */
        if (
                profile.getVerificationStatus() !=
                        ProfileVerificationStatus.PENDING
        ) {

            throw new IllegalStateException(
                    "Only profiles pending verification can be reviewed."
            );
        }

        /*
         * Rejecting a profile should always explain
         * what the member needs to correct.
         */
        if (
                requestedStatus ==
                        ProfileVerificationStatus.REJECTED
                        &&
                (
                        request.getReason() == null
                        ||
                        request.getReason()
                                .isBlank()
                )
        ) {

            throw new IllegalArgumentException(
                    "A rejection reason is required."
            );
        }

        if (
                requestedStatus ==
                        ProfileVerificationStatus.APPROVED
        ) {

            profile.approveVerification(
                    currentAdmin.getId(),
                    request.getReason()
            );

        } else {

            profile.rejectVerification(
                    currentAdmin.getId(),
                    request.getReason()
            );
        }

        Profile saved =
                profileRepository.save(
                        profile
                );

        return toDetailResponse(
                saved
        );
    }

    private Profile findProfile(
            UUID profileId
    ) {

        return profileRepository
                .findAdminProfileById(
                        profileId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Profile not found: " +
                                                profileId
                                )
                );
    }

    private User getCurrentAdmin() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                ||
                !authentication.isAuthenticated()
        ) {

            throw new IllegalStateException(
                    "Authenticated administrator not found."
            );
        }

        return userRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Administrator account not found."
                                )
                );
    }

    private AdminProfileResponse toListResponse(
            Profile profile
    ) {

        User user =
                profile.getUser();

        String primaryPhotoUrl =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                user.getId()
                        )
                        .map(
                                ProfilePhoto::getImageUrl
                        )
                        .orElse(null);

        return AdminProfileResponse
                .builder()
                .profileId(
                        profile.getId()
                )
                .userId(
                        user.getId()
                )
                .fullName(
                        user.getFullName()
                )
                .email(
                        user.getEmail()
                )
                .mobile(
                        profile.getMobile()
                )
                .gender(
                        profile.getGender()
                )
                .age(
                        profile.getAge()
                )
                .denomination(
                        profile.getDenomination()
                )
                .churchName(
                        profile.getChurchName()
                )
                .city(
                        profile.getCity()
                )
                .state(
                        profile.getState()
                )
                .country(
                        profile.getCountry()
                )
                .completionPercentage(
                        safeCompletion(
                                profile.getCompletionPercentage()
                        )
                )
                .profileCompleted(
                        Boolean.TRUE.equals(
                                profile.getProfileCompleted()
                        )
                )
                .verificationStatus(
                        resolveVerificationStatus(
                                profile
                        )
                )
                .verificationSubmittedAt(
                        profile.getVerificationSubmittedAt()
                )
                .verificationReviewedAt(
                        profile.getVerificationReviewedAt()
                )
                .primaryPhotoUrl(
                        primaryPhotoUrl
                )
                .createdAt(
                        profile.getCreatedAt()
                )
                .build();
    }

    private AdminProfileDetailResponse toDetailResponse(
            Profile profile
    ) {

        User user =
                profile.getUser();

        List<PhotoResponse> photos =
                profilePhotoRepository
                        .findAllByUserIdOrderByDisplayOrderAsc(
                                user.getId()
                        )
                        .stream()
                        .map(
                                this::toPhotoResponse
                        )
                        .toList();

        return AdminProfileDetailResponse
                .builder()

                .profileId(
                        profile.getId()
                )
                .userId(
                        user.getId()
                )

                .fullName(
                        user.getFullName()
                )
                .email(
                        user.getEmail()
                )

                .mobile(
                        profile.getMobile()
                )
                .dateOfBirth(
                        profile.getDateOfBirth()
                )
                .gender(
                        profile.getGender()
                )
                .age(
                        profile.getAge()
                )
                .maritalStatus(
                        profile.getMaritalStatus()
                )

                .denomination(
                        profile.getDenomination()
                )
                .churchName(
                        profile.getChurchName()
                )
                .pastorName(
                        profile.getPastorName()
                )
                .baptized(
                        profile.getBaptized()
                )
                .membershipId(
                        profile.getMembershipId()
                )
                .churchAddress(
                        profile.getChurchAddress()
                )

                .highestEducation(
                        profile.getHighestEducation()
                )
                .profession(
                        profile.getProfession()
                )
                .company(
                        profile.getCompany()
                )
                .annualIncome(
                        profile.getAnnualIncome()
                )

                .fatherName(
                        profile.getFatherName()
                )
                .motherName(
                        profile.getMotherName()
                )
                .siblings(
                        profile.getSiblings()
                )
                .familyLocation(
                        profile.getFamilyLocation()
                )

                .preferredAgeFrom(
                        profile.getPreferredAgeFrom()
                )
                .preferredAgeTo(
                        profile.getPreferredAgeTo()
                )
                .preferredDenomination(
                        profile.getPreferredDenomination()
                )
                .preferredEducation(
                        profile.getPreferredEducation()
                )

                .city(
                        profile.getCity()
                )
                .state(
                        profile.getState()
                )
                .country(
                        profile.getCountry()
                )

                .aboutMe(
                        profile.getAboutMe()
                )

                .completionPercentage(
                        safeCompletion(
                                profile.getCompletionPercentage()
                        )
                )
                .profileCompleted(
                        Boolean.TRUE.equals(
                                profile.getProfileCompleted()
                        )
                )

                .verificationStatus(
                        resolveVerificationStatus(
                                profile
                        )
                )
                .verificationSubmittedAt(
                        profile.getVerificationSubmittedAt()
                )
                .verificationReviewedAt(
                        profile.getVerificationReviewedAt()
                )
                .verificationReviewedBy(
                        profile.getVerificationReviewedBy()
                )
                .verificationReason(
                        profile.getVerificationReason()
                )

                .photos(
                        photos
                )

                .createdAt(
                        profile.getCreatedAt()
                )
                .updatedAt(
                        profile.getUpdatedAt()
                )

                .build();
    }

    private PhotoResponse toPhotoResponse(
            ProfilePhoto photo
    ) {

        return PhotoResponse
                .builder()
                .id(
                        photo.getId()
                )
                .fileName(
                        photo.getFileName()
                )
                .imageUrl(
                        photo.getImageUrl()
                )
                .contentType(
                        photo.getContentType()
                )
                .fileSize(
                        photo.getFileSize()
                )
                .primaryPhoto(
                        photo.getPrimaryPhoto()
                )
                .displayOrder(
                        photo.getDisplayOrder()
                )
                .createdAt(
                        photo.getCreatedAt()
                )
                .build();
    }

    private ProfileVerificationStatus
    resolveVerificationStatus(
            Profile profile
    ) {

        return profile.getVerificationStatus() == null
                ? ProfileVerificationStatus.NOT_SUBMITTED
                : profile.getVerificationStatus();
    }

    private int normalizePageSize(
            int size
    ) {

        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }

    private String normalizeSearch(
            String search
    ) {

        if (search == null) {
            return null;
        }

        String normalized =
                search.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

    private Integer safeCompletion(
            Integer completion
    ) {

        if (completion == null) {
            return 0;
        }

        return Math.max(
                0,
                Math.min(
                        completion,
                        100
                )
        );
    }
}