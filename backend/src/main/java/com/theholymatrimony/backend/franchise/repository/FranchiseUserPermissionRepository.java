package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.FranchiseUserPermission;
import com.theholymatrimony.backend.franchise.entity.FranchiseUserPermissionId;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FranchiseUserPermissionRepository
        extends JpaRepository<
        FranchiseUserPermission,
        FranchiseUserPermissionId
        > {

    List<FranchiseUserPermission>
    findAllByFranchiseUserId(
            UUID franchiseUserId
    );

    boolean existsByFranchiseUserIdAndPermission(
            UUID franchiseUserId,
            FranchisePermission permission
    );

    void deleteAllByFranchiseUserId(
            UUID franchiseUserId
    );
}
