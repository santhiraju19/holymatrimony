package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.Franchise;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FranchiseRepository
        extends JpaRepository<Franchise, UUID> {

    Optional<Franchise> findByFranchiseCode(
            String franchiseCode
    );

    boolean existsByFranchiseCode(
            String franchiseCode
    );

    List<Franchise> findAllByStatusOrderByCreatedAtDesc(
            FranchiseStatus status
    );
}
