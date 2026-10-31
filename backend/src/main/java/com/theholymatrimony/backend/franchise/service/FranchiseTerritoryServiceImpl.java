package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.repository.FranchiseTerritoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read operations for the authenticated franchise user's territory scope.
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
