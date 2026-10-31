package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.repository.FranchiseTerritoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Operations for the authenticated franchise user's territory scope.
 */
@Service
@RequiredArgsConstructor
public class FranchiseTerritoryServiceImpl
        implements FranchiseTerritoryService {

    private final FranchiseAccessService franchiseAccessService;

    private final FranchiseTerritoryRepository territoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FranchiseTerritoryResponse> listActiveTerritories(
            String email
    ) {

        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.TERRITORIES_VIEW
        );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        return territoryRepository
                .findAllByDistrictAllocationIdAndActiveTrueOrderByNameAsc(
                        allocation.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FranchiseTerritoryResponse updateTerritory(
            String email,
            UUID territoryId,
            UpdateFranchiseTerritoryRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Territory update request is required."
            );
        }

        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.TERRITORIES_MANAGE
        );

        FranchiseTerritory territory =
                franchiseAccessService
                        .requireTerritoryInScope(
                                email,
                                territoryId
                        );

        territory.setName(
                request.name().trim()
        );

        territory.setCoverageDescription(
                normalizeOptionalText(
                        request.coverageDescription()
                )
        );

        FranchiseTerritory savedTerritory =
                territoryRepository.save(
                        territory
                );

        return toResponse(
                savedTerritory
        );
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

    private FranchiseTerritoryResponse toResponse(
            FranchiseTerritory territory
    ) {

        return new FranchiseTerritoryResponse(
                territory.getId(),
                territory.getTerritoryCode(),
                territory.getName(),
                territory.getTerritoryType(),
                territory.getCoverageDescription()
        );
    }
}
