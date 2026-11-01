package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.CreateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.dto.FranchiseLeadResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseLead;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.LeadSource;
import com.theholymatrimony.backend.franchise.enums.LeadStatus;
import com.theholymatrimony.backend.franchise.repository.FranchiseLeadRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class FranchiseLeadServiceImplTests {

    private FranchiseAccessService franchiseAccessService;

    private FranchiseLeadRepository leadRepository;

    private FranchiseLeadServiceImpl service;

    @BeforeEach
    void setUp() {

        franchiseAccessService =
                mock(FranchiseAccessService.class);

        leadRepository =
                mock(FranchiseLeadRepository.class);

        service =
                new FranchiseLeadServiceImpl(
                        franchiseAccessService,
                        leadRepository
                );
    }

    @Test
    void listLeadsFollowsPermissionAllocationRepositoryOrder() {

        String email =
                "owner@example.com";

        UUID allocationId =
                UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                allocation(
                        allocationId
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
                leadRepository
                        .findAllByDistrictAllocationIdOrderByCreatedAtDesc(
                                allocationId
                        )
        ).thenReturn(
                List.of()
        );

        List<FranchiseLeadResponse> response =
                service.listLeads(
                        email
                );

        assertEquals(
                List.of(),
                response
        );

        InOrder inOrder =
                inOrder(
                        franchiseAccessService,
                        leadRepository
                );

        inOrder.verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.LEADS_VIEW
        );

        inOrder.verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        inOrder.verify(
                leadRepository
        ).findAllByDistrictAllocationIdOrderByCreatedAtDesc(
                allocationId
        );

        verifyNoMoreInteractions(
                franchiseAccessService,
                leadRepository
        );
    }

    @Test
    void listPermissionDenialStopsBeforeAllocationAndRepository() {

        String email =
                "staff@example.com";

        AccessDeniedException denied =
                new AccessDeniedException(
                        "Lead access denied."
                );

        when(
                franchiseAccessService.requirePermission(
                        email,
                        FranchisePermission.LEADS_VIEW
                )
        ).thenThrow(
                denied
        );

        AccessDeniedException result =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.listLeads(
                                        email
                                )
                );

        assertSame(
                denied,
                result
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.LEADS_VIEW
        );

        verify(
                franchiseAccessService,
                never()
        ).requireActiveDistrictAllocation(
                email
        );

        verifyNoInteractions(
                leadRepository
        );
    }

    @Test
    void createLeadUsesServerDerivedAllocationAndDefaultsStatusToNew() {

        String email =
                "owner@example.com";

        UUID allocationId =
                UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                allocation(
                        allocationId
                );

        CreateFranchiseLeadRequest request =
                new CreateFranchiseLeadRequest(
                        "  Grace Thomas  ",
                        "  9876543210  ",
                        "  grace@example.com  ",
                        LeadSource.REFERRAL,
                        "  Follow up tomorrow  ",
                        null
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
                leadRepository.save(
                        any(FranchiseLead.class)
                )
        ).thenAnswer(
                invocation ->
                        invocation.getArgument(0)
        );

        FranchiseLeadResponse response =
                service.createLead(
                        email,
                        request
                );

        assertEquals(
                "Grace Thomas",
                response.fullName()
        );

        assertEquals(
                "9876543210",
                response.mobile()
        );

        assertEquals(
                "grace@example.com",
                response.email()
        );

        assertEquals(
                LeadSource.REFERRAL,
                response.source()
        );

        assertEquals(
                LeadStatus.NEW,
                response.status()
        );

        assertEquals(
                "Follow up tomorrow",
                response.notes()
        );

        assertNull(
                response.territoryId()
        );

        assertNull(
                response.territoryName()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.LEADS_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                franchiseAccessService,
                never()
        ).requireTerritoryInScope(
                same(email),
                any(UUID.class)
        );

        verify(
                leadRepository
        ).save(
                any(FranchiseLead.class)
        );
    }

    @Test
    void createLeadValidatesTerritoryAndPreservesServerAllocation() {

        String email =
                "owner@example.com";

        UUID allocationId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                allocation(
                        allocationId
                );

        FranchiseTerritory territory =
                territory(
                        territoryId,
                        allocation,
                        "Guntur City"
                );

        CreateFranchiseLeadRequest request =
                new CreateFranchiseLeadRequest(
                        "John Peter",
                        "9876543210",
                        null,
                        LeadSource.WALK_IN,
                        null,
                        territoryId
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
                        .requireTerritoryInScope(
                                email,
                                territoryId
                        )
        ).thenReturn(
                territory
        );

        when(
                leadRepository.save(
                        any(FranchiseLead.class)
                )
        ).thenAnswer(
                invocation ->
                        invocation.getArgument(0)
        );

        FranchiseLeadResponse response =
                service.createLead(
                        email,
                        request
                );

        assertEquals(
                territoryId,
                response.territoryId()
        );

        assertEquals(
                "Guntur City",
                response.territoryName()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.LEADS_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                franchiseAccessService
        ).requireTerritoryInScope(
                email,
                territoryId
        );

        verify(
                leadRepository
        ).save(
                any(FranchiseLead.class)
        );
    }

    @Test
    void createRejectsTerritoryFromDifferentActiveAllocation() {

        String email =
                "owner@example.com";

        UUID allocationId =
                UUID.randomUUID();

        UUID otherAllocationId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                allocation(
                        allocationId
                );

        FranchiseDistrictAllocation otherAllocation =
                allocation(
                        otherAllocationId
                );

        FranchiseTerritory territory =
                territory(
                        territoryId,
                        otherAllocation,
                        "Outside Territory"
                );

        CreateFranchiseLeadRequest request =
                new CreateFranchiseLeadRequest(
                        "Outside Lead",
                        "9876543210",
                        null,
                        LeadSource.PHONE,
                        null,
                        territoryId
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
                        .requireTerritoryInScope(
                                email,
                                territoryId
                        )
        ).thenReturn(
                territory
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.createLead(
                                        email,
                                        request
                                )
                );

        assertEquals(
                "Territory is outside the active franchise district allocation.",
                exception.getMessage()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.LEADS_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                franchiseAccessService
        ).requireTerritoryInScope(
                email,
                territoryId
        );

        verifyNoInteractions(
                leadRepository
        );
    }

    @Test
    void updateLeadLookupIsConstrainedToServerDerivedAllocation() {

        String email =
                "owner@example.com";

        UUID allocationId =
                UUID.randomUUID();

        UUID leadId =
                UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                allocation(
                        allocationId
                );

        UpdateFranchiseLeadRequest request =
                new UpdateFranchiseLeadRequest(
                        "Updated Lead",
                        "9999999999",
                        null,
                        LeadSource.WHATSAPP,
                        LeadStatus.CONTACTED,
                        null,
                        null
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
                leadRepository
                        .findByIdAndDistrictAllocationId(
                                leadId,
                                allocationId
                        )
        ).thenReturn(
                Optional.empty()
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.updateLead(
                                        email,
                                        leadId,
                                        request
                                )
                );

        assertEquals(
                "Lead is outside the active franchise district scope.",
                exception.getMessage()
        );

        verify(
                franchiseAccessService
        ).requirePermission(
                email,
                FranchisePermission.LEADS_MANAGE
        );

        verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                email
        );

        verify(
                leadRepository
        ).findByIdAndDistrictAllocationId(
                leadId,
                allocationId
        );

        verify(
                leadRepository,
                never()
        ).save(
                any(FranchiseLead.class)
        );

        verify(
                franchiseAccessService,
                never()
        ).requireTerritoryInScope(
                same(email),
                any(UUID.class)
        );
    }

    @Test
    void updateLeadMutatesOperationalFieldsWithoutChangingOwnership() {

        String email =
                "owner@example.com";

        UUID allocationId =
                UUID.randomUUID();

        UUID leadId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        FranchiseDistrictAllocation allocation =
                allocation(
                        allocationId
                );

        FranchiseTerritory territory =
                territory(
                        territoryId,
                        allocation,
                        "Guntur City"
                );

        FranchiseLead lead =
                new FranchiseLead();

        lead.setDistrictAllocation(
                allocation
        );

        lead.setFullName(
                "Old Name"
        );

        lead.setMobile(
                "1111111111"
        );

        lead.setSource(
                LeadSource.PHONE
        );

        lead.setStatus(
                LeadStatus.NEW
        );

        UpdateFranchiseLeadRequest request =
                new UpdateFranchiseLeadRequest(
                        "  Updated Name  ",
                        "  9999999999  ",
                        "  updated@example.com  ",
                        LeadSource.WHATSAPP,
                        LeadStatus.QUALIFIED,
                        "  Qualified lead  ",
                        territoryId
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
                leadRepository
                        .findByIdAndDistrictAllocationId(
                                leadId,
                                allocationId
                        )
        ).thenReturn(
                Optional.of(
                        lead
                )
        );

        when(
                franchiseAccessService
                        .requireTerritoryInScope(
                                email,
                                territoryId
                        )
        ).thenReturn(
                territory
        );

        when(
                leadRepository.save(
                        same(lead)
                )
        ).thenReturn(
                lead
        );

        FranchiseLeadResponse response =
                service.updateLead(
                        email,
                        leadId,
                        request
                );

        assertSame(
                allocation,
                lead.getDistrictAllocation()
        );

        assertSame(
                territory,
                lead.getTerritory()
        );

        assertEquals(
                "Updated Name",
                lead.getFullName()
        );

        assertEquals(
                "9999999999",
                lead.getMobile()
        );

        assertEquals(
                "updated@example.com",
                lead.getEmail()
        );

        assertEquals(
                LeadSource.WHATSAPP,
                lead.getSource()
        );

        assertEquals(
                LeadStatus.QUALIFIED,
                lead.getStatus()
        );

        assertEquals(
                "Qualified lead",
                lead.getNotes()
        );

        assertEquals(
                "Updated Name",
                response.fullName()
        );

        assertEquals(
                LeadStatus.QUALIFIED,
                response.status()
        );

        assertEquals(
                territoryId,
                response.territoryId()
        );

        verify(
                leadRepository
        ).save(
                same(lead)
        );
    }

    @Test
    void nullRequestsFailBeforeAuthorizationOrPersistence() {

        IllegalArgumentException createException =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createLead(
                                        "owner@example.com",
                                        null
                                )
                );

        assertEquals(
                "Lead create request is required.",
                createException.getMessage()
        );

        IllegalArgumentException updateException =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateLead(
                                        "owner@example.com",
                                        UUID.randomUUID(),
                                        null
                                )
                );

        assertEquals(
                "Lead update request is required.",
                updateException.getMessage()
        );

        verifyNoInteractions(
                franchiseAccessService,
                leadRepository
        );
    }

    private FranchiseDistrictAllocation allocation(
            UUID allocationId
    ) {

        return FranchiseDistrictAllocation.builder()
                .id(allocationId)
                .active(true)
                .build();
    }

    private FranchiseTerritory territory(
            UUID territoryId,
            FranchiseDistrictAllocation allocation,
            String name
    ) {

        return FranchiseTerritory.builder()
                .id(territoryId)
                .districtAllocation(allocation)
                .territoryCode(
                        "TEST-" +
                                territoryId
                                        .toString()
                                        .substring(
                                                0,
                                                8
                                        )
                )
                .name(name)
                .active(true)
                .build();
    }
}
