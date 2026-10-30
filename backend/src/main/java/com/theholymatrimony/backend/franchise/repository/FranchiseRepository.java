package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.Franchise;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

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

    /**
     * HQ franchise search.
     *
     * Search is intentionally limited to franchise-owned fields.
     * Geographic filtering will be introduced separately through the
     * allocation/geography relationship rather than trusting client scope.
     */
    @Query("""
            SELECT f
            FROM Franchise f
            WHERE
                (:status IS NULL OR f.status = :status)
                AND (
                    :search IS NULL
                    OR LOWER(f.franchiseCode)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(f.legalName)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(f.displayName)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(f.contactName, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(f.contactEmail, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(f.contactMobile, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<Franchise> searchAdminFranchises(
            @Param("search")
            String search,

            @Param("status")
            FranchiseStatus status,

            Pageable pageable
    );
}
