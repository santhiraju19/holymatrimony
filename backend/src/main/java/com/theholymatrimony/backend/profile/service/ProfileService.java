package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.dto.ProfileResponse;

import com.theholymatrimony.backend.profile.entity.Profile;

import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileService {

    private static final int PROFILE_COMPLETION_THRESHOLD = 100;

    /*
     * Number of required profile-information fields.
     *
     * Photos are intentionally excluded.
     */
    private static final int REQUIRED_PROFILE_FIELDS = 25;

    private final ProfileRepository profileRepository;

    private final UserRepository userRepository;

    /*
     * =========================================================
     * Get current user's profile
     * =========================================================
     */

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(
            String email
    ) {

        Profile profile =
                profileRepository
                        .findByUserEmail(
                                email
                        )
                        .orElse(null);

        if (profile == null) {
            profile =
                    createEmptyProfile(
                            email
                    );
        }

        return map(
                profile
        );
    }

    /*
     * =========================================================
     * Save / update current user's profile
     * =========================================================
     */

    public ProfileResponse saveProfile(
            String email,
            ProfileRequest request
    ) {

        Profile profile =
                profileRepository
                        .findByUserEmail(
                                email
                        )
                        .orElseGet(
                                () ->
                                        createEmptyProfile(
                                                email
                                        )
                        );

        /*
         * =====================================================
         * Basic Information
         * =====================================================
         */

        profile.setMobile(
                request.getMobile()
        );

        profile.setDateOfBirth(
                request.getDateOfBirth()
        );

        profile.setGender(
                request.getGender()
        );

        profile.setAge(
                request.getAge()
        );

        profile.setMaritalStatus(
                request.getMaritalStatus()
        );

        /*
         * =====================================================
         * Church Information
         * =====================================================
         */

        profile.setDenomination(
                request.getDenomination()
        );

        profile.setChurchName(
                request.getChurchName()
        );

        profile.setPastorName(
                request.getPastorName()
        );

        profile.setBaptized(
                request.getBaptized()
        );

        profile.setMembershipId(
                request.getMembershipId()
        );

        profile.setChurchAddress(
                request.getChurchAddress()
        );

        /*
         * =====================================================
         * Education & Career
         * =====================================================
         */

        profile.setHighestEducation(
                request.getHighestEducation()
        );

        profile.setProfession(
                request.getProfession()
        );

        profile.setCompany(
                request.getCompany()
        );

        profile.setAnnualIncome(
                request.getAnnualIncome()
        );

        /*
         * =====================================================
         * Family Information
         * =====================================================
         */

        profile.setFatherName(
                request.getFatherName()
        );

        profile.setMotherName(
                request.getMotherName()
        );

        profile.setSiblings(
                request.getSiblings()
        );

        profile.setFamilyLocation(
                request.getFamilyLocation()
        );

        /*
         * =====================================================
         * Partner Preferences
         * =====================================================
         */

        profile.setPreferredAgeFrom(
                request.getPreferredAgeFrom()
        );

        profile.setPreferredAgeTo(
                request.getPreferredAgeTo()
        );

        profile.setPreferredDenomination(
                request.getPreferredDenomination()
        );

        profile.setPreferredEducation(
                request.getPreferredEducation()
        );

        /*
         * =====================================================
         * Current Location
         * =====================================================
         */

        profile.setCity(
                request.getCity()
        );

        profile.setState(
                request.getState()
        );

        profile.setCountry(
                request.getCountry()
        );

        /*
         * =====================================================
         * About
         * =====================================================
         */

        profile.setAboutMe(
                request.getAboutMe()
        );

        /*
         * =====================================================
         * Profile completion
         * =====================================================
         *
         * The backend is the source of truth.
         *
         * Every profile-information field is required.
         *
         * Photos are NOT included in this calculation.
         */

        int completionPercentage =
                calculateCompletion(
                        profile
                );

        profile.setCompletionPercentage(
                completionPercentage
        );

        profile.setProfileCompleted(
                completionPercentage
                        >= PROFILE_COMPLETION_THRESHOLD
        );

        Profile savedProfile =
                profileRepository
                        .save(
                                profile
                        );

        return map(
                savedProfile
        );
    }

    /*
     * =========================================================
     * Submit profile for administrator verification
     * =========================================================
     *
     * Allowed:
     *
     * NOT_SUBMITTED -> PENDING
     * REJECTED      -> PENDING
     *
     * Not allowed:
     *
     * PENDING
     * APPROVED
     */

    public ProfileResponse submitForVerification(
            String email
    ) {

        Profile profile =
                profileRepository
                        .findByUserEmail(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Complete your profile before submitting it for verification."
                                        )
                        );

        /*
         * Recalculate before verification.
         *
         * This prevents an old/stale completion percentage
         * from incorrectly allowing profile verification.
         */

        int completionPercentage =
                calculateCompletion(
                        profile
                );

        profile.setCompletionPercentage(
                completionPercentage
        );

        profile.setProfileCompleted(
                completionPercentage
                        >= PROFILE_COMPLETION_THRESHOLD
        );

        /*
         * Every required profile-information field
         * must be completed.
         *
         * Photos remain optional.
         */

        if (
                !Boolean.TRUE.equals(
                        profile.getProfileCompleted()
                )
                        ||
                completionPercentage
                        < PROFILE_COMPLETION_THRESHOLD
        ) {

            profileRepository.save(
                    profile
            );

            throw new IllegalStateException(
                    "Please complete all required profile information before submitting for verification. Profile photos are optional."
            );
        }

        ProfileVerificationStatus status =
                profile.getVerificationStatus() == null
                        ? ProfileVerificationStatus.NOT_SUBMITTED
                        : profile.getVerificationStatus();

        /*
         * Already waiting for administrator review.
         */

        if (
                status ==
                        ProfileVerificationStatus.PENDING
        ) {

            throw new IllegalStateException(
                    "Your profile has already been submitted and is waiting for verification."
            );
        }

        /*
         * Already approved.
         */

        if (
                status ==
                        ProfileVerificationStatus.APPROVED
        ) {

            throw new IllegalStateException(
                    "Your profile is already verified."
            );
        }

        /*
         * Handles:
         *
         * NOT_SUBMITTED -> PENDING
         * REJECTED      -> PENDING
         */

        profile.submitForVerification();

        Profile savedProfile =
                profileRepository
                        .save(
                                profile
                        );

        return map(
                savedProfile
        );
    }

    /*
     * =========================================================
     * Create empty profile
     * =========================================================
     */

    private Profile createEmptyProfile(
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "User not found for email: "
                                                        + email
                                        )
                        );

        Profile profile =
                Profile
                        .builder()
                        .user(
                                user
                        )
                        .completionPercentage(
                                0
                        )
                        .profileCompleted(
                                false
                        )
                        .verificationStatus(
                                ProfileVerificationStatus.NOT_SUBMITTED
                        )
                        .build();

        return profileRepository
                .save(
                        profile
                );
    }

    /*
     * =========================================================
     * Profile completion
     * =========================================================
     *
     * FINAL HOLY MATRIMONY RULE
     *
     * Every profile-information field below is required.
     *
     * Photos are optional and therefore intentionally
     * excluded from this calculation.
     *
     * 26 required fields = 100%.
     */

    private int calculateCompletion(
            Profile profile
    ) {

        int completed = 0;

        /*
         * =====================================================
         * Basic Information
         * =====================================================
         */

        if (
                hasText(
                        profile.getMobile()
                )
        ) {
            completed++;
        }

        if (
                profile.getDateOfBirth()
                        != null
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getGender()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getMaritalStatus()
                )
        ) {
            completed++;
        }

        /*
         * =====================================================
         * Current Location
         * =====================================================
         */

        if (
                hasText(
                        profile.getCity()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getState()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getCountry()
                )
        ) {
            completed++;
        }

        /*
         * =====================================================
         * About Me
         * =====================================================
         */

        if (
                hasText(
                        profile.getAboutMe()
                )
        ) {
            completed++;
        }

        /*
         * =====================================================
         * Church Information
         * =====================================================
         */

        if (
                hasText(
                        profile.getDenomination()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getChurchName()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getPastorName()
                )
        ) {
            completed++;
        }

        /*
         * Both:
         *
         * true  = baptized
         * false = not baptized
         *
         * are valid completed answers.
         *
         * Only null means unanswered.
         */

        if (
                profile.getBaptized()
                        != null
        ) {
            completed++;
        }

      

        if (
                hasText(
                        profile.getChurchAddress()
                )
        ) {
            completed++;
        }

        /*
         * =====================================================
         * Education & Career
         * =====================================================
         */

        if (
                hasText(
                        profile.getHighestEducation()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getProfession()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getCompany()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getAnnualIncome()
                )
        ) {
            completed++;
        }

        /*
         * =====================================================
         * Family Information
         * =====================================================
         */

        if (
                hasText(
                        profile.getFatherName()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getMotherName()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getSiblings()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getFamilyLocation()
                )
        ) {
            completed++;
        }

        /*
         * =====================================================
         * Partner Preferences
         * =====================================================
         */

        if (
                profile.getPreferredAgeFrom()
                        != null
        ) {
            completed++;
        }

        if (
                profile.getPreferredAgeTo()
                        != null
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getPreferredDenomination()
                )
        ) {
            completed++;
        }

        if (
                hasText(
                        profile.getPreferredEducation()
                )
        ) {
            completed++;
        }

        /*
         * Integer division is okay here because
         * profileCompleted becomes true only when
         * all 26 required fields are present.
         */

        return (
                completed * 100
        ) / REQUIRED_PROFILE_FIELDS;
    }

    /*
     * =========================================================
     * String helper
     * =========================================================
     */

    private boolean hasText(
            String value
    ) {

        return value != null
                &&
                !value.isBlank();
    }

    /*
     * =========================================================
     * DTO mapping
     * =========================================================
     */

    private ProfileResponse map(
            Profile profile
    ) {

        User user =
                profile.getUser();

        return ProfileResponse
                .builder()

                .id(
                        profile.getId()
                )

                .userId(
                        user.getId()
                )

                /*
                 * ===== User =====
                 */

                .fullName(
                        user.getFullName()
                )

                .email(
                        user.getEmail()
                )

                /*
                 * ===== Basic =====
                 */

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

                /*
                 * ===== Church =====
                 */

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

                /*
                 * ===== Education =====
                 */

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

                /*
                 * ===== Family =====
                 */

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

                /*
                 * ===== Preferences =====
                 */

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

                /*
                 * ===== Current Location =====
                 */

                .city(
                        profile.getCity()
                )

                .state(
                        profile.getState()
                )

                .country(
                        profile.getCountry()
                )

                /*
                 * ===== About =====
                 */

                .aboutMe(
                        profile.getAboutMe()
                )

                /*
                 * ===== Completion =====
                 */

                .completionPercentage(
                        profile.getCompletionPercentage()
                )

                .profileCompleted(
                        Boolean.TRUE.equals(
                                profile.getProfileCompleted()
                        )
                )

                /*
                 * ===== Verification =====
                 */

                .verificationStatus(
                        profile.getVerificationStatus() == null
                                ? ProfileVerificationStatus.NOT_SUBMITTED
                                : profile.getVerificationStatus()
                )

                .verificationSubmittedAt(
                        profile.getVerificationSubmittedAt()
                )

                .verificationReviewedAt(
                        profile.getVerificationReviewedAt()
                )

                .verificationReason(
                        profile.getVerificationReason()
                )

                .build();
    }
}