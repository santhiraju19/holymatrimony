package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseAccessResponse;
import com.theholymatrimony.backend.franchise.entity.Franchise;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseUser;
import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.entity.GeoState;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class FranchiseProfileServiceImplTests {

    private FranchiseAccessService franchiseAccessService;

    private FranchiseProfileServiceImpl service;

    @BeforeEach
    void setUp() {

        franchiseAccessService =
                mock(FranchiseAccessService.class);

        service =
                new FranchiseProfileServiceImpl(
                        franchiseAccessService
                );
    }

    @Test
    void currentFranchiseAccessIsDerivedFromAuthenticatedContext() {

        String email = "owner@example.com";

        UUID userId = UUID.randomUUID();
        UUID franchiseUserId = UUID.randomUUID();
        UUID franchiseId = UUID.randomUUID();
        UUID stateId = UUID.randomUUID();
        UUID districtId = UUID.randomUUID();

        User user =
                User.builder()
                        .id(userId)
                        .fullName("District Owner")
                        .email(email)
                        .build();

        Franchise franchise =
                Franchise.builder()
                        .id(franchiseId)
                        .franchiseCode("HM-GNT-001")
                        .displayName("Holy Matrimony Guntur")
                        .status(FranchiseStatus.ACTIVE)
                        .build();

        FranchiseUser franchiseUser =
                FranchiseUser.builder()
                        .id(franchiseUserId)
                        .user(user)
                        .franchise(franchise)
                        .staffRole(
                                FranchiseStaffRole.FRANCHISE_OWNER
                        )
                        .build();

        GeoState state =
                GeoState.builder()
                        .id(stateId)
                        .lgdCode(28)
                        .name("Andhra Pradesh")
                        .build();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .state(state)
                        .lgdCode(506)
                        .name("Guntur")
                        .build();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .franchise(franchise)
                        .district(district)
                        .active(true)
                        .build();

        Set<FranchisePermission> permissions =
                EnumSet.of(
                        FranchisePermission.DASHBOARD_VIEW,
                        FranchisePermission.MEMBERS_VIEW,
                        FranchisePermission.REPORTS_VIEW
                );

        when(
                franchiseAccessService.requireFranchiseUser(
                        email
                )
        ).thenReturn(
                franchiseUser
        );

        when(
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        )
        ).thenReturn(
                allocation
        );

        when(
                franchiseAccessService
                        .getEffectivePermissions(
                                email
                        )
        ).thenReturn(
                permissions
        );

        FranchiseAccessResponse response =
                service.getCurrentFranchiseAccess(
                        email
                );

        assertEquals(
                userId,
                response.userId()
        );

        assertEquals(
                "District Owner",
                response.fullName()
        );

        assertEquals(
                email,
                response.email()
        );

        assertEquals(
                franchiseUserId,
                response.franchiseUserId()
        );

        assertEquals(
                FranchiseStaffRole.FRANCHISE_OWNER,
                response.staffRole()
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );

        assertEquals(
                "HM-GNT-001",
                response.franchiseCode()
        );

        assertEquals(
                "Holy Matrimony Guntur",
                response.franchiseName()
        );

        assertEquals(
                FranchiseStatus.ACTIVE,
                response.franchiseStatus()
        );

        assertEquals(
                stateId,
                response.stateId()
        );

        assertEquals(
                28,
                response.stateLgdCode()
        );

        assertEquals(
                "Andhra Pradesh",
                response.stateName()
        );

        assertEquals(
                districtId,
                response.districtId()
        );

        assertEquals(
                506,
                response.districtLgdCode()
        );

        assertEquals(
                "Guntur",
                response.districtName()
        );

        assertEquals(
                permissions,
                response.permissions()
        );

        assertNotSame(
                permissions,
                response.permissions()
        );

        verify(
                franchiseAccessService
        ).requireFranchiseUser(
                email
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                franchiseAccessService
        ).getEffectivePermissions(
                email
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );
    }

    @Test
    void accessFailureStopsBeforeDistrictAndPermissionLookup() {

        String email = "blocked@example.com";

        RuntimeException denied =
                new RuntimeException(
                        "Franchise access denied."
                );

        when(
                franchiseAccessService.requireFranchiseUser(
                        email
                )
        ).thenThrow(
                denied
        );

        RuntimeException result =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                service
                                        .getCurrentFranchiseAccess(
                                                email
                                        )
                );

        assertEquals(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requireFranchiseUser(
                email
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );
    }

    @Test
    void districtScopeFailureStopsBeforePermissionLookup() {

        String email = "manager@example.com";

        User user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Franchise Manager")
                        .email(email)
                        .build();

        Franchise franchise =
                Franchise.builder()
                        .id(UUID.randomUUID())
                        .franchiseCode("HM-TEST-001")
                        .displayName("Test Franchise")
                        .status(FranchiseStatus.ACTIVE)
                        .build();

        FranchiseUser franchiseUser =
                FranchiseUser.builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .franchise(franchise)
                        .staffRole(
                                FranchiseStaffRole.FRANCHISE_MANAGER
                        )
                        .build();

        RuntimeException denied =
                new RuntimeException(
                        "District scope unavailable."
                );

        when(
                franchiseAccessService.requireFranchiseUser(
                        email
                )
        ).thenReturn(
                franchiseUser
        );

        when(
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        )
        ).thenThrow(
                denied
        );

        RuntimeException result =
                assertThrows(
                        RuntimeException.class,
                        () ->
                                service
                                        .getCurrentFranchiseAccess(
                                                email
                                        )
                );

        assertEquals(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requireFranchiseUser(
                email
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );
    }
}
