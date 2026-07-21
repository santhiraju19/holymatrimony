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

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getMyProfile(String email) {

        Profile profile = profileRepository.findByUserEmail(email)
                .orElseGet(() -> createEmptyProfile(email));

        return map(profile);
    }

    public ProfileResponse saveProfile(String email, ProfileRequest request) {

        Profile profile = profileRepository.findByUserEmail(email)
                .orElseGet(() -> createEmptyProfile(email));

        // ===== Basic =====
        profile.setMobile(request.getMobile());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setAge(request.getAge());
        profile.setMaritalStatus(request.getMaritalStatus());

        // ===== Church =====
        profile.setDenomination(request.getDenomination());
        profile.setChurchName(request.getChurchName());
        profile.setPastorName(request.getPastorName());
        profile.setBaptized(request.getBaptized());
        profile.setMembershipId(request.getMembershipId());
        profile.setChurchAddress(request.getChurchAddress());

        // ===== Education =====
        profile.setHighestEducation(request.getHighestEducation());
        profile.setProfession(request.getProfession());
        profile.setCompany(request.getCompany());
        profile.setAnnualIncome(request.getAnnualIncome());

        // ===== Family =====
        profile.setFatherName(request.getFatherName());
        profile.setMotherName(request.getMotherName());
        profile.setSiblings(request.getSiblings());
        profile.setFamilyLocation(request.getFamilyLocation());

        // ===== Preferences =====
        profile.setPreferredAgeFrom(request.getPreferredAgeFrom());
        profile.setPreferredAgeTo(request.getPreferredAgeTo());
        profile.setPreferredDenomination(request.getPreferredDenomination());
        profile.setPreferredEducation(request.getPreferredEducation());

        // ===== Location =====
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setCountry(request.getCountry());

        // ===== About =====
        profile.setAboutMe(request.getAboutMe());

        profile.setCompletionPercentage(calculateCompletion(profile));

        profile = profileRepository.save(profile);

        return map(profile);
    }

    private Profile createEmptyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Profile profile = Profile.builder()
                .user(user)
                .completionPercentage(0)
                .build();

        return profileRepository.save(profile);
    }

    private int calculateCompletion(Profile profile) {

        int total = 20;
        int completed = 0;

        if (profile.getMobile() != null && !profile.getMobile().isBlank()) completed++;
        if (profile.getDateOfBirth() != null) completed++;
        if (profile.getGender() != null && !profile.getGender().isBlank()) completed++;
        if (profile.getMaritalStatus() != null && !profile.getMaritalStatus().isBlank()) completed++;
        if (profile.getDenomination() != null && !profile.getDenomination().isBlank()) completed++;
        if (profile.getChurchName() != null && !profile.getChurchName().isBlank()) completed++;
        if (profile.getPastorName() != null && !profile.getPastorName().isBlank()) completed++;
        if (profile.getHighestEducation() != null && !profile.getHighestEducation().isBlank()) completed++;
        if (profile.getProfession() != null && !profile.getProfession().isBlank()) completed++;
        if (profile.getCompany() != null && !profile.getCompany().isBlank()) completed++;
        if (profile.getFatherName() != null && !profile.getFatherName().isBlank()) completed++;
        if (profile.getMotherName() != null && !profile.getMotherName().isBlank()) completed++;
        if (profile.getFamilyLocation() != null && !profile.getFamilyLocation().isBlank()) completed++;
        if (profile.getPreferredAgeFrom() != null) completed++;
        if (profile.getPreferredAgeTo() != null) completed++;
        if (profile.getCity() != null && !profile.getCity().isBlank()) completed++;
        if (profile.getState() != null && !profile.getState().isBlank()) completed++;
        if (profile.getCountry() != null && !profile.getCountry().isBlank()) completed++;
        if (profile.getAboutMe() != null && !profile.getAboutMe().isBlank()) completed++;
        if (profile.getAnnualIncome() != null && !profile.getAnnualIncome().isBlank()) completed++;

        return (completed * 100) / total;
    }

    private ProfileResponse map(Profile profile) {

        return ProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getUser().getFullName())
                .email(profile.getUser().getEmail())

                .mobile(profile.getMobile())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .age(profile.getAge())
                .maritalStatus(profile.getMaritalStatus())

                .denomination(profile.getDenomination())
                .churchName(profile.getChurchName())
                .pastorName(profile.getPastorName())
                .baptized(profile.getBaptized())
                .membershipId(profile.getMembershipId())
                .churchAddress(profile.getChurchAddress())

                .highestEducation(profile.getHighestEducation())
                .profession(profile.getProfession())
                .company(profile.getCompany())
                .annualIncome(profile.getAnnualIncome())

                .fatherName(profile.getFatherName())
                .motherName(profile.getMotherName())
                .siblings(profile.getSiblings())
                .familyLocation(profile.getFamilyLocation())

                .preferredAgeFrom(profile.getPreferredAgeFrom())
                .preferredAgeTo(profile.getPreferredAgeTo())
                .preferredDenomination(profile.getPreferredDenomination())
                .preferredEducation(profile.getPreferredEducation())

                .city(profile.getCity())
                .state(profile.getState())
                .country(profile.getCountry())

                .aboutMe(profile.getAboutMe())
                .completionPercentage(profile.getCompletionPercentage())
                .build();
    }
}