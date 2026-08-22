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
     * Core profile fields used for profile completion.
     *
     * Optional/sensitive preference fields are intentionally
     * excluded so members are never forced to disclose them.
     *
     * Photos are also excluded.
     */
private static final int REQUIRED_PROFILE_FIELDS = 26;

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    // =========================================================
    // Get current user's profile
    // =========================================================

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(
            String email
    ) {

        Profile profile =
                profileRepository
                        .findByUserEmail(email)
                        .orElse(null);

        if (profile == null) {
            profile =
                    createEmptyProfile(email);
        }

        return map(profile);
    }

    // =========================================================
    // Save / update current user's profile
    // =========================================================

    public ProfileResponse saveProfile(
            String email,
            ProfileRequest request
    ) {

        Profile profile =
                profileRepository
                        .findByUserEmail(email)
                        .orElseGet(
                                () -> createEmptyProfile(email)
                        );

        // =====================================================
        // Basic Information
        // =====================================================

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

        // =====================================================
        // Personal Information
        // =====================================================

        profile.setHeightCm(
                request.getHeightCm()
        );

        profile.setWeightKg(
                request.getWeightKg()
        );

        profile.setComplexion(
                request.getComplexion()
        );

        profile.setBodyType(
                request.getBodyType()
        );

        profile.setMotherTongue(
                request.getMotherTongue()
        );

        profile.setReligion(
                request.getReligion()
        );

        profile.setCommunity(
                request.getCommunity()
        );

        profile.setSubCommunity(
                request.getSubCommunity()
        );

        profile.setFaithBackground(
                request.getFaithBackground()
        );

        profile.setPhysicalStatus(
                request.getPhysicalStatus()
        );

        profile.setDiet(
                request.getDiet()
        );

        profile.setSmoking(
                request.getSmoking()
        );

        profile.setDrinking(
                request.getDrinking()
        );

        // =====================================================
        // Church Information
        // =====================================================

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

        // =====================================================
        // Education & Career
        // =====================================================

        profile.setHighestEducation(
                request.getHighestEducation()
        );

        profile.setEducationField(
                request.getEducationField()
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

        // =====================================================
        // Family Information
        // =====================================================

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

        profile.setFamilyType(
                request.getFamilyType()
        );

        profile.setFamilyValues(
                request.getFamilyValues()
        );

        // =====================================================
        // Partner Preferences
        // =====================================================

        profile.setPreferredAgeFrom(
                request.getPreferredAgeFrom()
        );

        profile.setPreferredAgeTo(
                request.getPreferredAgeTo()
        );

        profile.setPreferredHeightFromCm(
                request.getPreferredHeightFromCm()
        );

        profile.setPreferredHeightToCm(
                request.getPreferredHeightToCm()
        );

        profile.setPreferredReligion(
                request.getPreferredReligion()
        );

        profile.setPreferredDenomination(
                request.getPreferredDenomination()
        );

        profile.setPreferredMaritalStatus(
                request.getPreferredMaritalStatus()
        );

        profile.setPreferredCommunity(
                request.getPreferredCommunity()
        );

        /*
         * Existing members and older frontend clients may not
         * send communityNoBar yet.
         *
         * Preserve the existing value when it is omitted.
         */
        if (request.getCommunityNoBar() != null) {
            profile.setCommunityNoBar(
                    request.getCommunityNoBar()
            );
        } else if (profile.getCommunityNoBar() == null) {
            profile.setCommunityNoBar(true);
        }

        profile.setPreferredMotherTongue(
                request.getPreferredMotherTongue()
        );

        profile.setPreferredEducation(
                request.getPreferredEducation()
        );

        profile.setPreferredProfession(
                request.getPreferredProfession()
        );

        profile.setPreferredCountry(
                request.getPreferredCountry()
        );

        profile.setPreferredState(
                request.getPreferredState()
        );

        profile.setPreferredCity(
                request.getPreferredCity()
        );

        profile.setPreferredDiet(
                request.getPreferredDiet()
        );

        profile.setPreferredSmoking(
                request.getPreferredSmoking()
        );

        profile.setPreferredDrinking(
                request.getPreferredDrinking()
        );

        profile.setPreferredFaithCommitment(
                request.getPreferredFaithCommitment()
        );

        // =====================================================
        // Current Location
        // =====================================================

        profile.setCity(
                request.getCity()
        );

        profile.setState(
                request.getState()
        );

        profile.setCountry(
                request.getCountry()
        );

        // =====================================================
        // About
        // =====================================================

        profile.setAboutMe(
                request.getAboutMe()
        );

        // =====================================================
        // Profile completion
        // =====================================================

        int completionPercentage =
                calculateCompletion(profile);

        profile.setCompletionPercentage(
                completionPercentage
        );

        profile.setProfileCompleted(
                completionPercentage
                        >= PROFILE_COMPLETION_THRESHOLD
        );

        Profile savedProfile =
                profileRepository.save(profile);

        return map(savedProfile);
    }

    // =========================================================
    // Submit profile for administrator verification
    // =========================================================

    public ProfileResponse submitForVerification(
            String email
    ) {

        Profile profile =
                profileRepository
                        .findByUserEmail(email)
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Complete your profile before submitting it for verification."
                                        )
                        );

        /*
         * Recalculate before verification so an old completion
         * percentage can never incorrectly allow submission.
         */
        int completionPercentage =
                calculateCompletion(profile);

        profile.setCompletionPercentage(
                completionPercentage
        );

        profile.setProfileCompleted(
                completionPercentage
                        >= PROFILE_COMPLETION_THRESHOLD
        );

        if (
                !Boolean.TRUE.equals(
                        profile.getProfileCompleted()
                )
                        ||
                completionPercentage
                        < PROFILE_COMPLETION_THRESHOLD
        ) {

            profileRepository.save(profile);

            throw new IllegalStateException(
                    "Please complete all required profile information before submitting for verification. Profile photos and optional personal fields are not required."
            );
        }

        ProfileVerificationStatus status =
                profile.getVerificationStatus() == null
                        ? ProfileVerificationStatus.NOT_SUBMITTED
                        : profile.getVerificationStatus();

        if (
                status ==
                        ProfileVerificationStatus.PENDING
        ) {

            throw new IllegalStateException(
                    "Your profile has already been submitted and is waiting for verification."
            );
        }

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
                profileRepository.save(profile);

        return map(savedProfile);
    }

    // =========================================================
    // Create empty profile
    // =========================================================

    private Profile createEmptyProfile(
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
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
                        .user(user)
                        .completionPercentage(0)
                        .profileCompleted(false)
                        .communityNoBar(true)
                        .verificationStatus(
                                ProfileVerificationStatus.NOT_SUBMITTED
                        )
                        .build();

        return profileRepository.save(profile);
    }

    // =========================================================
    // Profile completion
    // =========================================================

   /*
 * Profile completion intentionally measures only the
 * core information needed to create a useful matrimonial
 * profile.
 *
 * Church information is optional and does not affect
 * profile completion or eligibility to submit a profile
 * for administrator verification.
 *
 * Denomination remains part of the core personal profile.
 *
 * Optional/sensitive information such as:
 *
 * - weight
 * - complexion
 * - body type
 * - community
 * - sub-community
 * - faith background
 * - physical status
 * - diet
 * - smoking
 * - drinking
 * - church name
 * - pastor name
 * - baptism status
 * - church membership ID
 * - church address
 * - most partner lifestyle preferences
 *
 * does NOT prevent a member from reaching 100%.
 */
    private int calculateCompletion(
            Profile profile
    ) {

        int completed = 0;

        // =====================================================
        // Basic — 4
        // =====================================================

        if (hasText(profile.getMobile())) {
            completed++;
        }

        if (profile.getDateOfBirth() != null) {
            completed++;
        }

        if (hasText(profile.getGender())) {
            completed++;
        }

        if (hasText(profile.getMaritalStatus())) {
            completed++;
        }

        // =====================================================
        // Personal — 4
        // =====================================================

        if (profile.getHeightCm() != null) {
            completed++;
        }

        if (hasText(profile.getMotherTongue())) {
            completed++;
        }

        if (hasText(profile.getReligion())) {
            completed++;
        }

        if (hasText(profile.getDenomination())) {
            completed++;
        }

        // =====================================================
        // Location — 3
        // =====================================================

        if (hasText(profile.getCity())) {
            completed++;
        }

        if (hasText(profile.getState())) {
            completed++;
        }

        if (hasText(profile.getCountry())) {
            completed++;
        }

        // =====================================================
        // About — 1
        // =====================================================

        if (hasText(profile.getAboutMe())) {
            completed++;
        }



        // =====================================================
        // Education & Career — 4
        // =====================================================

        if (hasText(profile.getHighestEducation())) {
            completed++;
        }

        if (hasText(profile.getEducationField())) {
            completed++;
        }

        if (hasText(profile.getProfession())) {
            completed++;
        }

        if (hasText(profile.getAnnualIncome())) {
            completed++;
        }

        // =====================================================
        // Family — 4
        // =====================================================

        if (hasText(profile.getFatherName())) {
            completed++;
        }

        if (hasText(profile.getMotherName())) {
            completed++;
        }

        if (hasText(profile.getFamilyLocation())) {
            completed++;
        }

        if (hasText(profile.getFamilyType())) {
            completed++;
        }

        // =====================================================
        // Core Partner Preferences — 6
        // =====================================================

        if (profile.getPreferredAgeFrom() != null) {
            completed++;
        }

        if (profile.getPreferredAgeTo() != null) {
            completed++;
        }

        if (profile.getPreferredHeightFromCm() != null) {
            completed++;
        }

        if (profile.getPreferredHeightToCm() != null) {
            completed++;
        }

        if (hasText(profile.getPreferredReligion())) {
            completed++;
        }

        if (hasText(profile.getPreferredEducation())) {
            completed++;
        }

        /*
         * REQUIRED_PROFILE_FIELDS is deliberately kept in one
         * constant so future profile expansion cannot silently
         * change the completion denominator.
         */
        return Math.min(
                100,
                (completed * 100)
                        / REQUIRED_PROFILE_FIELDS
        );
    }

    // =========================================================
    // String helper
    // =========================================================

    private boolean hasText(
            String value
    ) {

        return value != null
                &&
                !value.isBlank();
    }

    // =========================================================
    // DTO mapping
    // =========================================================

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

                // ===== User =====

                .fullName(
                        user.getFullName()
                )

                .email(
                        user.getEmail()
                )

                // ===== Basic =====

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

                // ===== Personal =====

                .heightCm(
                        profile.getHeightCm()
                )

                .weightKg(
                        profile.getWeightKg()
                )

                .complexion(
                        profile.getComplexion()
                )

                .bodyType(
                        profile.getBodyType()
                )

                .motherTongue(
                        profile.getMotherTongue()
                )

                .religion(
                        profile.getReligion()
                )

                .community(
                        profile.getCommunity()
                )

                .subCommunity(
                        profile.getSubCommunity()
                )

                .faithBackground(
                        profile.getFaithBackground()
                )

                .physicalStatus(
                        profile.getPhysicalStatus()
                )

                .diet(
                        profile.getDiet()
                )

                .smoking(
                        profile.getSmoking()
                )

                .drinking(
                        profile.getDrinking()
                )

                // ===== Church =====

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

                // ===== Education =====

                .highestEducation(
                        profile.getHighestEducation()
                )

                .educationField(
                        profile.getEducationField()
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

                // ===== Family =====

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

                .familyType(
                        profile.getFamilyType()
                )

                .familyValues(
                        profile.getFamilyValues()
                )

                // ===== Preferences =====

                .preferredAgeFrom(
                        profile.getPreferredAgeFrom()
                )

                .preferredAgeTo(
                        profile.getPreferredAgeTo()
                )

                .preferredHeightFromCm(
                        profile.getPreferredHeightFromCm()
                )

                .preferredHeightToCm(
                        profile.getPreferredHeightToCm()
                )

                .preferredReligion(
                        profile.getPreferredReligion()
                )

                .preferredDenomination(
                        profile.getPreferredDenomination()
                )

                .preferredMaritalStatus(
                        profile.getPreferredMaritalStatus()
                )

                .preferredCommunity(
                        profile.getPreferredCommunity()
                )

                .communityNoBar(
                        Boolean.TRUE.equals(
                                profile.getCommunityNoBar()
                        )
                )

                .preferredMotherTongue(
                        profile.getPreferredMotherTongue()
                )

                .preferredEducation(
                        profile.getPreferredEducation()
                )

                .preferredProfession(
                        profile.getPreferredProfession()
                )

                .preferredCountry(
                        profile.getPreferredCountry()
                )

                .preferredState(
                        profile.getPreferredState()
                )

                .preferredCity(
                        profile.getPreferredCity()
                )

                .preferredDiet(
                        profile.getPreferredDiet()
                )

                .preferredSmoking(
                        profile.getPreferredSmoking()
                )

                .preferredDrinking(
                        profile.getPreferredDrinking()
                )

                .preferredFaithCommitment(
                        profile.getPreferredFaithCommitment()
                )

                // ===== Current Location =====

                .city(
                        profile.getCity()
                )

                .state(
                        profile.getState()
                )

                .country(
                        profile.getCountry()
                )

                // ===== About =====

                .aboutMe(
                        profile.getAboutMe()
                )

                // ===== Completion =====

                .completionPercentage(
                        profile.getCompletionPercentage()
                )

                .profileCompleted(
                        Boolean.TRUE.equals(
                                profile.getProfileCompleted()
                        )
                )

                // ===== Verification =====

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
