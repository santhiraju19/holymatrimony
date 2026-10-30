package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FranchiseDistrictAllocationRepository
        extends JpaRepository<FranchiseDistrictAllocation, UUID> {

    @EntityGraph(
            attributePaths = {
                    "franchise",
                    "district",
                    "district.state"
            }
    )
    Optional<FranchiseDistrictAllocation>
    findByFranchiseIdAndActiveTrue(
            UUID franchiseId
    );

    @EntityGraph(
            attributePaths = {
                    "franchise",
                    "district",
                    "district.state"
            }
    )
    Optional<FranchiseDistrictAllocation>
    findByDistrictIdAndActiveTrue(
            UUID districtId
    );

    boolean existsByFranchiseIdAndActiveTrue(
            UUID franchiseId
    );

    boolean existsByDistrictIdAndActiveTrue(
            UUID districtId
    );
}
