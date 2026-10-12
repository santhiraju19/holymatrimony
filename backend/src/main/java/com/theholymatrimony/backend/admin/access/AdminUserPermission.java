package com.theholymatrimony.backend.admin.access;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Permission explicitly assigned to a SUB_ADMIN.
 *
 * SUPER_ADMIN accounts do not require permission rows because
 * they implicitly have access to every administrative area.
 */
@Entity
@Table(name = "admin_user_permissions")
@IdClass(AdminUserPermissionId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserPermission {

    @Id
    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(
            name = "permission",
            nullable = false,
            length = 80
    )
    private AdminPermission permission;
}
