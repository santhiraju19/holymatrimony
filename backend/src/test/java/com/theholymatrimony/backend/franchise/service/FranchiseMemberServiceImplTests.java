package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseMemberResponse;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class FranchiseMemberServiceImplTests {

    private FranchiseAccessService franchiseAccessService;

    private ProfileRepository profileRepository;

    private FranchiseMemberServiceImpl service;

    @BeforeEach
    void setUp() {

        franchiseAccessService =
                mock(FranchiseAccessService.class);

        profileRepository =
                mock(ProfileRepository.class);

        service =
                new FranchiseMemberServiceImpl(
                        franchiseAccessService,
                        profileRepository
                );
    }

    @Test
    void listMembersUsesServerDerivedCanonicalDistrictId() {

        String email =
                "franchise@example.com";

        UUID districtId =
                UUID.randomUUID();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .name("Kakinada")
                        .active(true)
                        .build();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .district(district)
                        .active(true)
                        .build();

        when(
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        )
        ).thenReturn(
                allocation
        );

        when(
                profileRepository
                        .findAllByCanonicalDistrictIdOrderByCreatedAtDesc(
                                districtId
                        )
        ).thenReturn(
                List.of()
        );

        List<FranchiseMemberResponse> result =
                service.listMembers(
                        email
                );

        assertEquals(
                0,
                result.size()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.MEMBERS_VIEW
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                profileRepository
        ).findAllByCanonicalDistrictIdOrderByCreatedAtDesc(
                districtId
        );
    }

    @Test
    void listMembersFollowsAuthorizationOrder() {

        String email =
                "franchise@example.com";

        UUID districtId =
                UUID.randomUUID();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .name("Kakinada")
                        .active(true)
                        .build();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .district(district)
                        .active(true)
                        .build();

        when(
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        )
        ).thenReturn(
                allocation
        );

        when(
                profileRepository
                        .findAllByCanonicalDistrictIdOrderByCreatedAtDesc(
                                districtId
                        )
        ).thenReturn(
                List.of()
        );

        service.listMembers(
                email
        );

        InOrder inOrder =
                inOrder(
                        franchiseAccessService,
                        profileRepository
                );

        inOrder.verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.MEMBERS_VIEW
        );

        inOrder.verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        inOrder.verify(
                profileRepository
        ).findAllByCanonicalDistrictIdOrderByCreatedAtDesc(
                districtId
        );
    }

    @Test
    void permissionDenialStopsBeforeAllocationAndRepository() {

        String email =
                "franchise@example.com";

        RuntimeException denied =
                new RuntimeException(
                        "Permission denied."
                );

        when(
                franchiseAccessService.requirePermission(
                        email,
                        FranchisePermission.MEMBERS_VIEW
                )
        ).thenThrow(
                denied
        );

        RuntimeException thrown =
                assertThrows(
                        RuntimeException.class,
                        () -> service.listMembers(
                                email
                        )
                );

        assertEquals(
                denied,
                thrown
        );

        verify(
                franchiseAccessService,
                never()
        ).requireActiveDistrictAllocation(
                email
        );

        verifyNoInteractions(
                profileRepository
        );
    }

    @Test
    void allocationFailureStopsBeforeRepository() {

        String email =
                "franchise@example.com";

        RuntimeException noAllocation =
                new RuntimeException(
                        "No active district allocation."
                );

        when(
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        )
        ).thenThrow(
                noAllocation
        );

        RuntimeException thrown =
                assertThrows(
                        RuntimeException.class,
                        () -> service.listMembers(
                                email
                        )
                );

        assertEquals(
                noAllocation,
                thrown
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.MEMBERS_VIEW
        );

        verifyNoInteractions(
                profileRepository
        );
    }

    @Test
    void listMembersMapsResponseAndPreservesRepositoryOrder() {

        String email =
                "franchise@example.com";

        UUID districtId =
                UUID.randomUUID();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .name("Kakinada")
                        .active(true)
                        .build();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .district(district)
                        .active(true)
                        .build();

        User firstUser =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("First Member")
                        .email("first@example.com")
                        .build();

        Profile firstProfile =
                Profile.builder()
                        .id(UUID.randomUUID())
                        .user(firstUser)
                        .memberId("HM-000011")
                        .dateOfBirth(
                                LocalDate.of(
                                        1990,
                                        5,
                                        10
                                )
                        )
                        .gender("MALE")
                        .denomination("Catholic")
                        .churchName("First Church")
                        .city("Kakinada")
                        .district("Kakinada")
                        .state("Andhra Pradesh")
                        .country("India")
                        .canonicalDistrict(district)
                        .profileCompleted(true)
                        .profileLive(true)
                        .build();

        User secondUser =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Second Member")
                        .email("second@example.com")
                        .build();

        Profile secondProfile =
                Profile.builder()
                        .id(UUID.randomUUID())
                        .user(secondUser)
                        .memberId("HM-000010")
                        .dateOfBirth(
                                LocalDate.of(
                                        1992,
                                        8,
                                        20
                                )
                        )
                        .gender("FEMALE")
                        .denomination("Baptist")
                        .churchName("Second Church")
                        .city("Kakinada")
                        .district("Kakinada")
                        .state("Andhra Pradesh")
                        .country("India")
                        .canonicalDistrict(district)
                        .profileCompleted(false)
                        .profileLive(false)
                        .build();

        when(
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        )
        ).thenReturn(
                allocation
        );

        when(
                profileRepository
                        .findAllByCanonicalDistrictIdOrderByCreatedAtDesc(
                                districtId
                        )
        ).thenReturn(
                List.of(
                        firstProfile,
                        secondProfile
                )
        );

        List<FranchiseMemberResponse> result =
                service.listMembers(
                        email
                );

        assertEquals(
                2,
                result.size()
        );

        FranchiseMemberResponse first =
                result.get(0);

        assertEquals(
                firstProfile.getId(),
                first.profileId()
        );

        assertEquals(
                "HM-000011",
                first.memberId()
        );

        assertEquals(
                "First Member",
                first.fullName()
        );

        assertEquals(
                "first@example.com",
                first.email()
        );

        assertEquals(
                LocalDate.of(
                        1990,
                        5,
                        10
                ),
                first.dateOfBirth()
        );

        assertEquals(
                "MALE",
                first.gender()
        );

        assertEquals(
                "Catholic",
                first.denomination()
        );

        assertEquals(
                "First Church",
                first.churchName()
        );

        assertEquals(
                "Kakinada",
                first.city()
        );

        assertEquals(
                "Kakinada",
                first.district()
        );

        assertEquals(
                "Andhra Pradesh",
                first.state()
        );

        assertEquals(
                "India",
                first.country()
        );

        assertEquals(
                true,
                first.profileCompleted()
        );

        assertEquals(
                true,
                first.profileLive()
        );

        FranchiseMemberResponse second =
                result.get(1);

        assertEquals(
                secondProfile.getId(),
                second.profileId()
        );

        assertEquals(
                "HM-000010",
                second.memberId()
        );

        assertEquals(
                "Second Member",
                second.fullName()
        );

        assertEquals(
                "second@example.com",
                second.email()
        );

        assertEquals(
                false,
                second.profileCompleted()
        );

        assertEquals(
                false,
                second.profileLive()
        );
    }
}
