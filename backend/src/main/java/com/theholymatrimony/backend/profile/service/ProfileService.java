package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.dto.ProfileResponse;
import com.theholymatrimony.backend.profile.entity.Profile;
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

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile(String email) {

        Profile profile = profileRepository
                .findByUserEmail(email)
                .orElse(null);

        if (profile == null) {
            profile = createEmptyProfile(email);
        }

        return map(profile);
    }

    public ProfileResponse saveProfile(
            String email,
            ProfileRequest request
    ) {

        Profile profile = profileRepository
                .findByUserEmail(email)
                .orElseGet(() -> createEmptyProfile(email));

        // ===== Basic =====
        profile.setMobile(request.getMobile());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setAge(request.getAge());
        profile.setMaritalStatus(
                request.getMaritalStatus()
        );

        // ===== Church =====
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

        // ===== Education =====
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

        // ===== Family =====
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

        // ===== Preferences =====
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

        // ===== Location =====
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());

        // ===== About =====
        profile.setAboutMe(request.getAboutMe());

        /*
         * Calculate and persist profile completion state.
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

        Profile savedProfile =
                profileRepository.save(profile);

        return map(savedProfile);
    }

    private Profile createEmptyProfile(
            String email
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "User not found for email: "
                                        + email
                        )
                );

        Profile profile = Profile.builder()
                .user(user)
                .completionPercentage(0)
                .profileCompleted(false)
                .build();

        return profileRepository.save(profile);
    }

    private int calculateCompletion(
            Profile profile
    ) {

        int total = 20;
        int completed = 0;

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

        if (hasText(profile.getDenomination())) {
            completed++;
        }

        if (hasText(profile.getChurchName())) {
            completed++;
        }

        if (hasText(profile.getPastorName())) {
            completed++;
        }

        if (hasText(profile.getHighestEducation())) {
            completed++;
        }

        if (hasText(profile.getProfession())) {
            completed++;
        }

        if (hasText(profile.getCompany())) {
            completed++;
        }

        if (hasText(profile.getFatherName())) {
            completed++;
        }

        if (hasText(profile.getMotherName())) {
            completed++;
        }

        if (hasText(profile.getFamilyLocation())) {
            completed++;
        }

        if (profile.getPreferredAgeFrom() != null) {
            completed++;
        }

        if (profile.getPreferredAgeTo() != null) {
            completed++;
        }

        if (hasText(profile.getCity())) {
            completed++;
        }

        if (hasText(profile.getState())) {
            completed++;
        }

        if (hasText(profile.getCountry())) {
            completed++;
        }

        if (hasText(profile.getAboutMe())) {
            completed++;
        }

        if (hasText(profile.getAnnualIncome())) {
            completed++;
        }

        return (completed * 100) / total;
    }

    private boolean hasText(String value) {
        return value != null
                && !value.isBlank();
    }

    private ProfileResponse map(
            Profile profile
    ) {

        User user = profile.getUser();

        return ProfileResponse.builder()
        .id(profile.getId())
        .userId(user.getId())

        // ===== User =====
        .fullName(user.getFullName())
        .email(user.getEmail())

        // ===== Basic =====
        .mobile(profile.getMobile())
        .dateOfBirth(profile.getDateOfBirth())
        .gender(profile.getGender())
        .age(profile.getAge())
        .maritalStatus(profile.getMaritalStatus())

        // ===== Church =====
        .denomination(profile.getDenomination())
        .churchName(profile.getChurchName())
        .pastorName(profile.getPastorName())
        .baptized(profile.getBaptized())
        .membershipId(profile.getMembershipId())
        .churchAddress(profile.getChurchAddress())

        // ===== Education =====
        .highestEducation(profile.getHighestEducation())
        .profession(profile.getProfession())
        .company(profile.getCompany())
        .annualIncome(profile.getAnnualIncome())

        // ===== Family =====
        .fatherName(profile.getFatherName())
        .motherName(profile.getMotherName())
        .siblings(profile.getSiblings())
        .familyLocation(profile.getFamilyLocation())

        // ===== Preferences =====
        .preferredAgeFrom(profile.getPreferredAgeFrom())
        .preferredAgeTo(profile.getPreferredAgeTo())
        .preferredDenomination(profile.getPreferredDenomination())
        .preferredEducation(profile.getPreferredEducation())

        // ===== Location =====
        .city(profile.getCity())
        .state(profile.getState())
        .country(profile.getCountry())

        // ===== About =====
        .aboutMe(profile.getAboutMe())

        // ===== Completion =====
        .completionPercentage(profile.getCompletionPercentage())
        .profileCompleted(
                Boolean.TRUE.equals(
                        profile.getProfileCompleted()
                )
        )
        .build();
    }
}