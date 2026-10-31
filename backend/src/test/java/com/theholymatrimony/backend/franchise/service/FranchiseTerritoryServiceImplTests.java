package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.franchise.entity.Franchise;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;
import com.theholymatrimony.backend.franchise.repository.FranchiseTerritoryRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class FranchiseTerritoryServiceImplTests {

    private FranchiseAccessService franchiseAccessService;

    private FranchiseTerritoryRepository territoryRepository;

    private FranchiseTerritoryServiceImpl service;

    @BeforeEach
    void setUp() {

        franchiseAccessService =
                mock(FranchiseAccessService.class);

        territoryRepository =
                mock(FranchiseTerritoryRepository.class);

        service =
                new FranchiseTerritoryServiceImpl(
                        franchiseAccessService,
                        territoryRepository
                );
    }

    @Test
    void activeTerritoriesAreDerivedFromAuthenticatedDistrictAllocation() {

        String email = "owner@example.com";

        UUID franchiseId = UUID.randomUUID();
        UUID allocationId = UUID.randomUUID();

        UUID firstTerritoryId = UUID.randomUUID();
        UUID secondTerritoryId = UUID.randomUUID();

        Franchise franchise =
                Franchise.builder()
                        .id(franchiseId)
                        .build();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(allocationId)
                        .franchise(franchise)
                        .active(true)
                        .build();

        FranchiseTerritory firstTerritory =
                FranchiseTerritory.builder()
                        .id(firstTerritoryId)
                        .districtAllocation(allocation)
                        .territoryCode("GNT-CITY")
                        .name("Guntur City")
                        .territoryType(
                                FranchiseTerritoryType.CITY
                        )
                        .coverageDescription(
                                "Guntur municipal limits"
                        )
                        .active(true)
                        .build();

        FranchiseTerritory secondTerritory =
                FranchiseTerritory.builder()
                        .id(secondTerritoryId)
                        .districtAllocation(allocation)
                        .territoryCode("GNT-PIN-01")
                        .name("Guntur PIN Cluster 01")
                        .territoryType(
                                FranchiseTerritoryType.PIN_CLUSTER
                        )
                        .coverageDescription(
                                "Selected Guntur postal areas"
                        )
                        .active(true)
                        .build();

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        email
                )
        ).thenReturn(
                allocation
        );

        when(
                territoryRepository
                        .findAllByDistrictAllocationIdAndActiveTrueOrderByNameAsc(
                                allocationId
                        )
        ).thenReturn(
                List.of(
                        firstTerritory,
                        secondTerritory
                )
        );

        List<FranchiseTerritoryResponse> response =
                service.listActiveTerritories(
                        email
                );

        assertEquals(
                2,
                response.size()
        );

        FranchiseTerritoryResponse first =
                response.get(0);

        assertEquals(
                firstTerritoryId,
                first.territoryId()
        );

        assertEquals(
                "GNT-CITY",
                first.territoryCode()
        );

        assertEquals(
                "Guntur City",
                first.name()
        );

        assertEquals(
                FranchiseTerritoryType.CITY,
                first.territoryType()
        );

        assertEquals(
                "Guntur municipal limits",
                first.coverageDescription()
        );

        FranchiseTerritoryResponse second =
                response.get(1);

        assertEquals(
                secondTerritoryId,
                second.territoryId()
        );

        assertEquals(
                "GNT-PIN-01",
                second.territoryCode()
        );

        assertEquals(
                FranchiseTerritoryType.PIN_CLUSTER,
                second.territoryType()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_VIEW
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                territoryRepository
        ).findAllByDistrictAllocationIdAndActiveTrueOrderByNameAsc(
                allocationId
        );

        verifyNoMoreInteractions(
                franchiseAccessService,
                territoryRepository
        );
    }

    @Test
    void permissionFailureStopsBeforeDistrictAndTerritoryLookup() {

        String email = "staff@example.com";

        AccessDeniedException denied =
                new AccessDeniedException(
                        "Territory access denied."
                );

        when(
                franchiseAccessService.requirePermission(
                        email,
                        FranchisePermission.TERRITORIES_VIEW
                )
        ).thenThrow(
                denied
        );

        AccessDeniedException result =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.listActiveTerritories(
                                        email
                                )
                );

        assertEquals(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_VIEW
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );

        verifyNoInteractions(
                territoryRepository
        );
    }

    @Test
    void districtScopeFailureStopsBeforeTerritoryLookup() {

        String email = "manager@example.com";

        AccessDeniedException denied =
                new AccessDeniedException(
                        "Active district allocation required."
                );

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        email
                )
        ).thenThrow(
                denied
        );

        AccessDeniedException result =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.listActiveTerritories(
                                        email
                                )
                );

        assertEquals(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_VIEW
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );

        verifyNoInteractions(
                territoryRepository
        );
    }

    @Test
    void emptyScopedTerritorySetReturnsEmptyResponse() {

        String email = "owner@example.com";

        UUID allocationId = UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(allocationId)
                        .active(true)
                        .build();

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        email
                )
        ).thenReturn(
                allocation
        );

        when(
                territoryRepository
                        .findAllByDistrictAllocationIdAndActiveTrueOrderByNameAsc(
                                allocationId
                        )
        ).thenReturn(
                List.of()
        );

        List<FranchiseTerritoryResponse> response =
                service.listActiveTerritories(
                        email
                );

        assertEquals(
                List.of(),
                response
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_VIEW
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                territoryRepository
        ).findAllByDistrictAllocationIdAndActiveTrueOrderByNameAsc(
                allocationId
        );

        verifyNoMoreInteractions(
                franchiseAccessService,
                territoryRepository
        );
    }

    @Test
    void territoryUpdateRequiresManagePermissionBeforeScopeLookup() {

        String email = "staff@example.com";
        UUID territoryId = UUID.randomUUID();

        UpdateFranchiseTerritoryRequest request =
                new UpdateFranchiseTerritoryRequest(
                        "Updated Territory",
                        "Updated coverage"
                );

        AccessDeniedException denied =
                new AccessDeniedException(
                        "Territory management denied."
                );

        when(
                franchiseAccessService.requirePermission(
                        email,
                        FranchisePermission.TERRITORIES_MANAGE
                )
        ).thenThrow(
                denied
        );

        AccessDeniedException result =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.updateTerritory(
                                        email,
                                        territoryId,
                                        request
                                )
                );

        assertEquals(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_MANAGE
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );

        verifyNoInteractions(
                territoryRepository
        );
    }

    @Test
    void territoryScopeFailureStopsBeforeSave() {

        String email = "manager@example.com";
        UUID territoryId = UUID.randomUUID();

        UpdateFranchiseTerritoryRequest request =
                new UpdateFranchiseTerritoryRequest(
                        "Updated Territory",
                        "Updated coverage"
                );

        AccessDeniedException denied =
                new AccessDeniedException(
                        "Territory is outside the franchise scope."
                );

        when(
                franchiseAccessService.requireTerritoryInScope(
                        email,
                        territoryId
                )
        ).thenThrow(
                denied
        );

        AccessDeniedException result =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.updateTerritory(
                                        email,
                                        territoryId,
                                        request
                                )
                );

        assertEquals(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireTerritoryInScope(
                email,
                territoryId
        );

        verifyNoMoreInteractions(
                franchiseAccessService
        );

        verifyNoInteractions(
                territoryRepository
        );
    }

    @Test
    void territoryUpdateChangesOnlyPermittedOperationalFields() {

        String email = "owner@example.com";

        UUID franchiseId = UUID.randomUUID();
        UUID allocationId = UUID.randomUUID();
        UUID territoryId = UUID.randomUUID();

        Franchise franchise =
                Franchise.builder()
                        .id(franchiseId)
                        .build();

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(allocationId)
                        .franchise(franchise)
                        .active(true)
                        .build();

        FranchiseTerritory territory =
                FranchiseTerritory.builder()
                        .id(territoryId)
                        .districtAllocation(allocation)
                        .territoryCode("GNT-CITY")
                        .name("Guntur City")
                        .territoryType(
                                FranchiseTerritoryType.CITY
                        )
                        .coverageDescription(
                                "Original coverage"
                        )
                        .active(true)
                        .build();

        UpdateFranchiseTerritoryRequest request =
                new UpdateFranchiseTerritoryRequest(
                        "  Guntur Urban  ",
                        "  Updated municipal coverage  "
                );

        when(
                franchiseAccessService.requireTerritoryInScope(
                        email,
                        territoryId
                )
        ).thenReturn(
                territory
        );

        when(
                territoryRepository.save(
                        same(territory)
                )
        ).thenReturn(
                territory
        );

        FranchiseTerritoryResponse response =
                service.updateTerritory(
                        email,
                        territoryId,
                        request
                );

        assertEquals(
                territoryId,
                response.territoryId()
        );

        assertEquals(
                "GNT-CITY",
                response.territoryCode()
        );

        assertEquals(
                "Guntur Urban",
                response.name()
        );

        assertEquals(
                FranchiseTerritoryType.CITY,
                response.territoryType()
        );

        assertEquals(
                "Updated municipal coverage",
                response.coverageDescription()
        );

        assertEquals(
                allocation,
                territory.getDistrictAllocation()
        );

        assertEquals(
                "GNT-CITY",
                territory.getTerritoryCode()
        );

        assertEquals(
                FranchiseTerritoryType.CITY,
                territory.getTerritoryType()
        );

        assertEquals(
                true,
                territory.getActive()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireTerritoryInScope(
                email,
                territoryId
        );

        verify(
                territoryRepository
        ).save(
                same(territory)
        );

        verifyNoMoreInteractions(
                franchiseAccessService,
                territoryRepository
        );
    }

    @Test
    void blankCoverageDescriptionIsNormalizedToNull() {

        String email = "owner@example.com";
        UUID territoryId = UUID.randomUUID();

        FranchiseTerritory territory =
                FranchiseTerritory.builder()
                        .id(territoryId)
                        .territoryCode("GNT-CITY")
                        .name("Guntur City")
                        .territoryType(
                                FranchiseTerritoryType.CITY
                        )
                        .coverageDescription(
                                "Original coverage"
                        )
                        .active(true)
                        .build();

        UpdateFranchiseTerritoryRequest request =
                new UpdateFranchiseTerritoryRequest(
                        "Guntur City",
                        "   "
                );

        when(
                franchiseAccessService.requireTerritoryInScope(
                        email,
                        territoryId
                )
        ).thenReturn(
                territory
        );

        when(
                territoryRepository.save(
                        same(territory)
                )
        ).thenReturn(
                territory
        );

        FranchiseTerritoryResponse response =
                service.updateTerritory(
                        email,
                        territoryId,
                        request
                );

        assertEquals(
                null,
                territory.getCoverageDescription()
        );

        assertEquals(
                null,
                response.coverageDescription()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.TERRITORIES_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireTerritoryInScope(
                email,
                territoryId
        );

        verify(
                territoryRepository
        ).save(
                same(territory)
        );

        verifyNoMoreInteractions(
                franchiseAccessService,
                territoryRepository
        );
    }

    @Test
    void nullUpdateRequestFailsBeforeAuthorizationOrPersistence() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateTerritory(
                                        "owner@example.com",
                                        UUID.randomUUID(),
                                        null
                                )
                );

        assertEquals(
                "Territory update request is required.",
                exception.getMessage()
        );

        verifyNoInteractions(
                franchiseAccessService,
                territoryRepository
        );
    }

}
