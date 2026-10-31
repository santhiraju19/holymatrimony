package com.theholymatrimony.backend.franchise.repository;

import jakarta.persistence.LockModeType;

import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface FranchiseDistrictAllocationRepository
        extends JpaRepository<FranchiseDistrictAllocation, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT allocation
            FROM FranchiseDistrictAllocation allocation
            WHERE allocation.franchise.id = :franchiseId
              AND allocation.active = true
            """)
    Optional<FranchiseDistrictAllocation> findActiveForUpdateByFranchiseId(
            @Param("franchiseId")
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
    findByFranchiseIdAndActiveTrue(
            UUID franchiseId
    );

    /**
     * HQ historical fallback for franchises whose active district allocation
     * has been closed.
     *
     * The active allocation remains authoritative whenever one exists.
     * This query is only intended as the fallback that preserves HQ visibility
     * after closure by returning the most recently allocated district record.
     */
    @EntityGraph(
            attributePaths = {
                    "franchise",
                    "district",
                    "district.state"
            }
    )
    Optional<FranchiseDistrictAllocation>
    findFirstByFranchiseIdOrderByAllocatedAtDescCreatedAtDesc(
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
