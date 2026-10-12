package com.theholymatrimony.backend.admin.access;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdminUserPermissionRepository
        extends JpaRepository<AdminUserPermission, AdminUserPermissionId> {

    List<AdminUserPermission> findAllByUserId(
            UUID userId
    );

    boolean existsByUserIdAndPermission(
            UUID userId,
            AdminPermission permission
    );

    void deleteAllByUserId(
            UUID userId
    );
}
