package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FranchiseTerritoryRepository
        extends JpaRepository<FranchiseTerritory, UUID> {

    List<FranchiseTerritory>
    findAllByDistrictAllocationIdAndActiveTrueOrderByNameAsc(
            UUID districtAllocationId
    );

    @EntityGraph(
            attributePaths = {
                    "districtAllocation",
                    "districtAllocation.franchise",
                    "districtAllocation.district",
                    "districtAllocation.district.state"
            }
    )
    @Query("""
            SELECT territory
            FROM FranchiseTerritory territory
            WHERE territory.id = :territoryId
              AND territory.active = true
              AND territory.districtAllocation.active = true
              AND territory.districtAllocation.franchise.id = :franchiseId
            """)
    Optional<FranchiseTerritory>
    findActiveTerritoryInFranchiseScope(
            @Param("territoryId")
            UUID territoryId,

            @Param("franchiseId")
            UUID franchiseId
    );

    @Query("""
            SELECT territory.id
            FROM FranchiseTerritory territory
            WHERE territory.active = true
              AND territory.districtAllocation.active = true
              AND territory.districtAllocation.franchise.id = :franchiseId
            ORDER BY territory.name ASC
            """)
    List<UUID> findActiveTerritoryIdsByFranchiseId(
            @Param("franchiseId")
            UUID franchiseId
    );
}
