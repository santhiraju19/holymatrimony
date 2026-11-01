package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.FranchiseLead;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FranchiseLeadRepository
        extends JpaRepository<FranchiseLead, UUID> {

    @EntityGraph(
            attributePaths = {
                    "territory"
            }
    )
    List<FranchiseLead>
    findAllByDistrictAllocationIdOrderByCreatedAtDesc(
            UUID districtAllocationId
    );

    @EntityGraph(
            attributePaths = {
                    "districtAllocation",
                    "territory"
            }
    )
    Optional<FranchiseLead>
    findByIdAndDistrictAllocationId(
            UUID id,
            UUID districtAllocationId
    );
}
