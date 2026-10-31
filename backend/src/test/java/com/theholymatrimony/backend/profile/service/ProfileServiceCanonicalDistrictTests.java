package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceCanonicalDistrictTests {

    private static final String EMAIL =
            "member@example.com";

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private CanonicalProfileDistrictResolver canonicalProfileDistrictResolver;

    private ProfileService profileService;

    private Profile profile;

    @BeforeEach
    void setUp() {

        profileService =
                new ProfileService(
                        profileRepository,
                        userRepository,
                        entityManager,
                        canonicalProfileDistrictResolver
                );

        User user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Test Member")
                        .email(EMAIL)
                        .password("unused")
                        .build();

        profile =
                Profile.builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .build();

        when(
                profileRepository.findByUserEmail(EMAIL)
        ).thenReturn(
                Optional.of(profile)
        );

        when(
                profileRepository.save(any(Profile.class))
        ).thenAnswer(
                invocation -> invocation.getArgument(0)
        );
    }

    @Test
    void saveProfileAssignsResolvedCanonicalDistrict() {

        GeoDistrict canonicalDistrict =
                new GeoDistrict();

        ProfileRequest request =
                locationRequest(
                        " India ",
                        " Andhra Pradesh ",
                        " Kakinada ",
                        " Kakinada "
                );

        when(
                canonicalProfileDistrictResolver.resolve(
                        " India ",
                        " Andhra Pradesh ",
                        " Kakinada "
                )
        ).thenReturn(
                canonicalDistrict
        );

        profileService.saveProfile(
                EMAIL,
                request
        );

        assertSame(
                canonicalDistrict,
                profile.getCanonicalDistrict()
        );

        verify(
                profileRepository
        ).save(
                profile
        );
    }

    @Test
    void saveProfileClearsStaleCanonicalDistrictWhenResolutionFails() {

        profile.setCanonicalDistrict(
                new GeoDistrict()
        );

        ProfileRequest request =
                locationRequest(
                        "India",
                        "Andhra Pradesh",
                        "Unknown District",
                        "Some City"
                );

        when(
                canonicalProfileDistrictResolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Unknown District"
                )
        ).thenReturn(
                null
        );

        profileService.saveProfile(
                EMAIL,
                request
        );

        assertNull(
                profile.getCanonicalDistrict()
        );

        verify(
                profileRepository
        ).save(
                profile
        );
    }

    @Test
    void saveProfileResolvesFromSubmittedCurrentLocation() {

        ProfileRequest request =
                locationRequest(
                        "India",
                        "Telangana",
                        "Hyderabad",
                        "Hyderabad"
                );

        profileService.saveProfile(
                EMAIL,
                request
        );

        verify(
                canonicalProfileDistrictResolver
        ).resolve(
                "India",
                "Telangana",
                "Hyderabad"
        );
    }

    private ProfileRequest locationRequest(
            String country,
            String state,
            String district,
            String city
    ) {

        ProfileRequest request =
                new ProfileRequest();

        request.setCountry(country);
        request.setState(state);
        request.setDistrict(district);
        request.setCity(city);

        return request;
    }
}
