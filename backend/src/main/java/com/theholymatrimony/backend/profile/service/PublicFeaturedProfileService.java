package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.dto.PublicFeaturedProfileResponse;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;
import com.theholymatrimony.backend.verification.repository.MemberVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicFeaturedProfileService {

    private static final int MAX_FEATURED_PROFILES = 12;

    private final ProfileRepository profileRepository;
    private final ProfilePhotoRepository profilePhotoRepository;
    private final MemberVerificationRepository memberVerificationRepository;

    public List<PublicFeaturedProfileResponse> getFeaturedProfiles() {
        return profileRepository
                .findPublicHomepageFeaturedProfiles(
                        PageRequest.of(
                                0,
                                MAX_FEATURED_PROFILES
                        )
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PublicFeaturedProfileResponse toResponse(
            Profile profile
    ) {
        User user = profile.getUser();
        UUID userId = user.getId();

        ProfilePhoto primaryPhoto =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                userId
                        )
                        .orElse(null);

        boolean mobileVerified =
                isVerificationApproved(
                        userId,
                        VerificationType.MOBILE
                );

        boolean churchVerified =
                isVerificationApproved(
                        userId,
                        VerificationType.CHURCH
                );

        boolean identityVerified =
                isVerificationApproved(
                        userId,
                        VerificationType.IDENTITY
                );

        boolean verifiedProfile =
                mobileVerified ||
                churchVerified ||
                identityVerified;

        return PublicFeaturedProfileResponse
                .builder()
                .id(profile.getId())
                .firstName(
                        firstName(
                                user.getFullName()
                        )
                )
                .age(
                        calculateAge(
                                profile.getDateOfBirth()
                        )
                )
                .denomination(
                        clean(
                                profile.getDenomination()
                        )
                )
                .profession(
                        clean(
                                profile.getProfession()
                        )
                )
                .city(
                        clean(
                                profile.getCity()
                        )
                )
                .state(
                        clean(
                                profile.getState()
                        )
                )
                .country(
                        clean(
                                profile.getCountry()
                        )
                )
                .completionPercentage(
                        profile.getCompletionPercentage()
                )
                .mobileVerified(
                        mobileVerified
                )
                .churchVerified(
                        churchVerified
                )
                .identityVerified(
                        identityVerified
                )
                .verifiedProfile(
                        verifiedProfile
                )
                .primaryPhotoUrl(
                        primaryPhoto == null
                                ? null
                                : clean(
                                        primaryPhoto
                                                .getImageUrl()
                                )
                )
                .build();
    }

    private boolean isVerificationApproved(
            UUID userId,
            VerificationType type
    ) {
        return memberVerificationRepository
                .existsByUserIdAndVerificationTypeAndVerificationStatus(
                        userId,
                        type,
                        VerificationStatus.APPROVED
                );
    }

    private Integer calculateAge(
            LocalDate dateOfBirth
    ) {
        if (dateOfBirth == null) {
            return null;
        }

        LocalDate today = LocalDate.now();

        if (dateOfBirth.isAfter(today)) {
            return null;
        }

        return Period.between(
                dateOfBirth,
                today
        ).getYears();
    }

    private String firstName(
            String fullName
    ) {
        String normalized =
                clean(fullName);

        if (normalized == null) {
            return "Member";
        }

        String[] parts =
                normalized.split("\\s+");

        if (
                parts.length == 0 ||
                parts[0].isBlank()
        ) {
            return "Member";
        }

        /*
         * Preserve the member's stored capitalization.
         * Only the first whitespace-delimited name is
         * exposed publicly.
         */
        return parts[0];
    }

    private String clean(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}
