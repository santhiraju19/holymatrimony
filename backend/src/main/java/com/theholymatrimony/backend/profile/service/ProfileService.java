package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.profile.dto.PreferredLocationDto;
import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.dto.ProfileResponse;
import com.theholymatrimony.backend.profile.entity.PreferredLocation;
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
     * Church information, partner preferences, photos and other
     * optional/sensitive fields are intentionally excluded.
     */
    private static final int REQUIRED_PROFILE_FIELDS = 20;

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
            profile = createEmptyProfile(email);
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

        // =====================================================
        // Lifestyle
        // =====================================================

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
        //
        // Completely optional for profile completion and
        // administrator verification submission.
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

        profile.setChurchCountry(
                request.getChurchCountry()
        );

        profile.setChurchState(
                request.getChurchState()
        );

        profile.setChurchDistrict(
                request.getChurchDistrict()
        );

        profile.setChurchCity(
                request.getChurchCity()
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

        profile.setFamilyCountry(
                request.getFamilyCountry()
        );

        profile.setFamilyState(
                request.getFamilyState()
        );

        profile.setFamilyDistrict(
                request.getFamilyDistrict()
        );

        profile.setFamilyCity(
                request.getFamilyCity()
        );

        profile.setFamilyType(
                request.getFamilyType()
        );

        profile.setFamilyValues(
                request.getFamilyValues()
        );

        // =====================================================
        // Partner Preferences
        //
        // Optional. These improve search/recommendation quality
        // but do not affect profile completion.
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
         * Preserve the existing value when omitted.
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

        /*
         * =====================================================
         * Preferred Locations
         * =====================================================
         *
         * preferredLocations is the new source of truth.
         *
         * null:
         *   Older client did not send the collection, so preserve
         *   any existing collection and continue supporting the
         *   legacy scalar fields.
         *
         * empty list:
         *   Member intentionally selected no preferred locations.
         *
         * populated list:
         *   Replace the collection with the submitted structured
         *   locations.
         */
        if (request.getPreferredLocations() != null) {

            profile.getPreferredLocations().clear();

            int sortOrder = 0;

            for (
                    PreferredLocationDto location :
                    request.getPreferredLocations()
            ) {

                if (location == null) {
                    continue;
                }

                boolean completelyBlank =
                        isBlank(location.getCountry())
                                &&
                        isBlank(location.getState())
                                &&
                        isBlank(location.getDistrict())
                                &&
                        isBlank(location.getCity());

                if (completelyBlank) {
                    continue;
                }

                PreferredLocation preferredLocation =
                        PreferredLocation.builder()
                                .profile(profile)
                                .sortOrder(sortOrder++)
                                .country(
                                        normalizeOptionalText(
                                                location.getCountry()
                                        )
                                )
                                .state(
                                        normalizeOptionalText(
                                                location.getState()
                                        )
                                )
                                .district(
                                        normalizeOptionalText(
                                                location.getDistrict()
                                        )
                                )
                                .city(
                                        normalizeOptionalText(
                                                location.getCity()
                                        )
                                )
                                .build();

                profile.getPreferredLocations().add(
                        preferredLocation
                );
            }

            /*
             * Maintain legacy scalar columns from the first
             * preferred location for compatibility with existing
             * browse/search/matching code.
             */
            if (profile.getPreferredLocations().isEmpty()) {

                profile.setPreferredCountry(null);
                profile.setPreferredState(null);
                profile.setPreferredDistrict(null);
                profile.setPreferredCity(null);

            } else {

                PreferredLocation first =
                        profile.getPreferredLocations().get(0);

                profile.setPreferredCountry(
                        first.getCountry()
                );

                profile.setPreferredState(
                        first.getState()
                );

                profile.setPreferredDistrict(
                        first.getDistrict()
                );

                profile.setPreferredCity(
                        first.getCity()
                );
            }

        } else {

            /*
             * Legacy-client compatibility.
             */
            profile.setPreferredCountry(
                    request.getPreferredCountry()
            );

            profile.setPreferredState(
                    request.getPreferredState()
            );

            profile.setPreferredDistrict(
                    request.getPreferredDistrict()
            );

            profile.setPreferredCity(
                    request.getPreferredCity()
            );
        }

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

        profile.setCountry(
                request.getCountry()
        );

        profile.setState(
                request.getState()
        );

        profile.setDistrict(
                request.getDistrict()
        );

        profile.setCity(
                request.getCity()
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
         * Always recalculate so a stale completion percentage
         * cannot incorrectly allow verification submission.
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
                    "Please complete all required profile information before submitting for verification. Church information, partner preferences, profile photos and optional personal fields are not required."
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
     * Completion measures only the core information required
     * to create a useful matrimonial profile.
     *
     * Church Information:
     * OPTIONAL
     *
     * Partner Preferences:
     * OPTIONAL
     *
     * Photos:
     * OPTIONAL
     *
     * District:
     * Captured for search/matching but intentionally not added
     * as a new completion requirement so existing completed
     * profiles do not suddenly lose their 100% status.
     *
     * Denomination remains part of the core personal profile.
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
        // Current Location — 3
        //
        // District is captured but is not currently required.
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

        /*
         * Keep the legacy familyLocation as the current required
         * completion field until existing profiles are migrated.
         *
         * Structured family country/state/district/city can be
         * collected independently without changing completion.
         */
        if (hasText(profile.getFamilyLocation())) {
            completed++;
        }

        if (hasText(profile.getFamilyType())) {
            completed++;
        }

        /*
         * Church fields and all Partner Preference fields are
         * intentionally excluded from this calculation.
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


    private boolean isBlank(
            String value
    ) {

        return value == null
                ||
                value.isBlank();
    }

    private String normalizeOptionalText(
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

                // ===== Identity =====

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

                // ===== Lifestyle =====

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

                .churchCountry(
                        profile.getChurchCountry()
                )

                .churchState(
                        profile.getChurchState()
                )

                .churchDistrict(
                        profile.getChurchDistrict()
                )

                .churchCity(
                        profile.getChurchCity()
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

                .familyCountry(
                        profile.getFamilyCountry()
                )

                .familyState(
                        profile.getFamilyState()
                )

                .familyDistrict(
                        profile.getFamilyDistrict()
                )

                .familyCity(
                        profile.getFamilyCity()
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

                .preferredDistrict(
                        profile.getPreferredDistrict()
                )

                .preferredCity(
                        profile.getPreferredCity()
                )


                .preferredLocations(
                        profile.getPreferredLocations() == null
                                ? java.util.List.of()
                                : profile.getPreferredLocations()
                                        .stream()
                                        .map(
                                                location ->
                                                        PreferredLocationDto
                                                                .builder()
                                                                .country(
                                                                        location.getCountry()
                                                                )
                                                                .state(
                                                                        location.getState()
                                                                )
                                                                .district(
                                                                        location.getDistrict()
                                                                )
                                                                .city(
                                                                        location.getCity()
                                                                )
                                                                .build()
                                        )
                                        .toList()
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

                .country(
                        profile.getCountry()
                )

                .state(
                        profile.getState()
                )

                .district(
                        profile.getDistrict()
                )

                .city(
                        profile.getCity()
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
