package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.FranchiseUser;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseUserStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FranchiseUserRepository
        extends JpaRepository<FranchiseUser, UUID> {

    @EntityGraph(
            attributePaths = {
                    "user",
                    "franchise"
            }
    )
    Optional<FranchiseUser>
    findByUserIdAndStatus(
            UUID userId,
            FranchiseUserStatus status
    );

    @EntityGraph(
            attributePaths = {
                    "user",
                    "franchise"
            }
    )
    Optional<FranchiseUser>
    findByUserEmailIgnoreCaseAndStatus(
            String email,
            FranchiseUserStatus status
    );

    @EntityGraph(
            attributePaths = {
                    "user",
                    "franchise"
            }
    )
    List<FranchiseUser>
    findAllByFranchiseIdAndStatusOrderByJoinedAtAsc(
            UUID franchiseId,
            FranchiseUserStatus status
    );

    boolean existsByUserIdAndStatus(
            UUID userId,
            FranchiseUserStatus status
    );

    @EntityGraph(
            attributePaths = {
                    "user",
                    "franchise"
            }
    )
    Optional<FranchiseUser>
    findByFranchiseIdAndStaffRoleAndStatus(
            UUID franchiseId,
            FranchiseStaffRole staffRole,
            FranchiseUserStatus status
    );

    boolean existsByFranchiseIdAndStaffRoleAndStatus(
            UUID franchiseId,
            FranchiseStaffRole staffRole,
            FranchiseUserStatus status
    );
}
