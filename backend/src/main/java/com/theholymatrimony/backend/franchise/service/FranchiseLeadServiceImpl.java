package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.CreateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.dto.FranchiseLeadResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseLead;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.LeadStatus;
import com.theholymatrimony.backend.franchise.repository.FranchiseLeadRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FranchiseLeadServiceImpl
        implements FranchiseLeadService {

    private final FranchiseAccessService franchiseAccessService;

    private final FranchiseLeadRepository leadRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FranchiseLeadResponse> listLeads(
            String email
    ) {

        /*
         * Authorization order:
         *
         * 1. Require LEADS_VIEW.
         * 2. Derive active district allocation from authenticated identity.
         * 3. Query leads only by that server-derived allocation ID.
         *
         * No client-supplied franchise, district, or allocation identifier
         * participates in authorization.
         */
        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.LEADS_VIEW
        );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        return leadRepository
                .findAllByDistrictAllocationIdOrderByCreatedAtDesc(
                        allocation.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FranchiseLeadResponse createLead(
            String email,
            CreateFranchiseLeadRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Lead create request is required."
            );
        }

        /*
         * Authorization order:
         *
         * 1. Require LEADS_MANAGE.
         * 2. Derive active district allocation from authenticated identity.
         * 3. If territory is supplied, require it to be in authenticated
         *    franchise scope and in the exact active district allocation.
         * 4. Persist the lead using only server-derived ownership.
         */
        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.LEADS_MANAGE
        );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        FranchiseTerritory territory =
                resolveTerritory(
                        email,
                        allocation,
                        request.territoryId()
                );

        FranchiseLead lead =
                new FranchiseLead();

        lead.setDistrictAllocation(
                allocation
        );

        lead.setTerritory(
                territory
        );

        lead.setFullName(
                request.fullName().trim()
        );

        lead.setMobile(
                request.mobile().trim()
        );

        lead.setEmail(
                normalizeOptionalText(
                        request.email()
                )
        );

        lead.setSource(
                request.source()
        );

        lead.setStatus(
                LeadStatus.NEW
        );

        lead.setNotes(
                normalizeOptionalText(
                        request.notes()
                )
        );

        FranchiseLead savedLead =
                leadRepository.save(
                        lead
                );

        return toResponse(
                savedLead
        );
    }

    @Override
    @Transactional
    public FranchiseLeadResponse updateLead(
            String email,
            UUID leadId,
            UpdateFranchiseLeadRequest request
    ) {

        if (leadId == null) {
            throw new IllegalArgumentException(
                    "Lead ID is required."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Lead update request is required."
            );
        }

        /*
         * Authorization order:
         *
         * 1. Require LEADS_MANAGE.
         * 2. Derive active district allocation from authenticated identity.
         * 3. Resolve the lead only inside that allocation.
         * 4. If territory is supplied, validate territory scope.
         * 5. Mutate only operational lead fields.
         *
         * Lead ownership is never reassigned from client input.
         */
        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.LEADS_MANAGE
        );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        FranchiseLead lead =
                leadRepository
                        .findByIdAndDistrictAllocationId(
                                leadId,
                                allocation.getId()
                        )
                        .orElseThrow(
                                () -> new AccessDeniedException(
                                        "Lead is outside the active franchise district scope."
                                )
                        );

        FranchiseTerritory territory =
                resolveTerritory(
                        email,
                        allocation,
                        request.territoryId()
                );

        lead.setTerritory(
                territory
        );

        lead.setFullName(
                request.fullName().trim()
        );

        lead.setMobile(
                request.mobile().trim()
        );

        lead.setEmail(
                normalizeOptionalText(
                        request.email()
                )
        );

        lead.setSource(
                request.source()
        );

        lead.setStatus(
                request.status()
        );

        lead.setNotes(
                normalizeOptionalText(
                        request.notes()
                )
        );

        FranchiseLead savedLead =
                leadRepository.save(
                        lead
                );

        return toResponse(
                savedLead
        );
    }

    private FranchiseTerritory resolveTerritory(
            String email,
            FranchiseDistrictAllocation allocation,
            UUID territoryId
    ) {

        if (territoryId == null) {
            return null;
        }

        FranchiseTerritory territory =
                franchiseAccessService
                        .requireTerritoryInScope(
                                email,
                                territoryId
                        );

        UUID territoryAllocationId =
                territory
                        .getDistrictAllocation()
                        .getId();

        if (!allocation.getId().equals(
                territoryAllocationId
        )) {
            throw new AccessDeniedException(
                    "Territory is outside the active franchise district allocation."
            );
        }

        return territory;
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

    private FranchiseLeadResponse toResponse(
            FranchiseLead lead
    ) {

        FranchiseTerritory territory =
                lead.getTerritory();

        return new FranchiseLeadResponse(
                lead.getId(),
                lead.getFullName(),
                lead.getMobile(),
                lead.getEmail(),
                lead.getSource(),
                lead.getStatus(),
                lead.getNotes(),
                territory == null
                        ? null
                        : territory.getId(),
                territory == null
                        ? null
                        : territory.getName(),
                lead.getCreatedAt(),
                lead.getUpdatedAt()
        );
    }
}
