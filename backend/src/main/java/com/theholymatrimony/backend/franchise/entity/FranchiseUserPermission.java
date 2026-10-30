package com.theholymatrimony.backend.franchise.entity;

import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
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
 * Explicit permission assigned to a franchise staff membership.
 *
 * FRANCHISE_OWNER does not require permission rows because owner access
 * will be granted implicitly by franchise authorization logic.
 */
@Entity
@Table(name = "franchise_user_permissions")
@IdClass(FranchiseUserPermissionId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FranchiseUserPermission {

    @Id
    @Column(
            name = "franchise_user_id",
            nullable = false
    )
    private UUID franchiseUserId;

    @Id
    @Enumerated(EnumType.STRING)
    @Column(
            name = "permission",
            nullable = false,
            length = 80
    )
    private FranchisePermission permission;
}
