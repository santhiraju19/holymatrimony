package com.theholymatrimony.backend.franchise.access;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.entity.FranchiseUser;
import com.theholymatrimony.backend.franchise.entity.FranchiseUserPermission;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import com.theholymatrimony.backend.franchise.enums.FranchiseUserStatus;
import com.theholymatrimony.backend.franchise.repository.FranchiseDistrictAllocationRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseTerritoryRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseUserPermissionRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseUserRepository;
import com.theholymatrimony.backend.security.ActiveAccountValidator;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FranchiseAccessServiceImpl
        implements FranchiseAccessService {

    private final ActiveAccountValidator activeAccountValidator;

    private final FranchiseUserRepository franchiseUserRepository;

    private final FranchiseUserPermissionRepository
            permissionRepository;

    private final FranchiseDistrictAllocationRepository
            districtAllocationRepository;

    private final FranchiseTerritoryRepository
            territoryRepository;

    @Override
    @Transactional(readOnly = true)
    public FranchiseUser requireFranchiseUser(
            String email
    ) {

        User user =
                activeAccountValidator.requireActiveUser(
                        email
                );

        if (user.getRole() != Role.ROLE_FRANCHISE) {
            throw new AccessDeniedException(
                    "Franchise access is required."
            );
        }

        FranchiseUser franchiseUser =
                franchiseUserRepository
                        .findByUserIdAndStatus(
                                user.getId(),
                                FranchiseUserStatus.ACTIVE
                        )
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "Active franchise membership is required."
                                )
                        );

        if (franchiseUser.getFranchise() == null) {
            throw new AccessDeniedException(
                    "Franchise membership is not configured correctly."
            );
        }

        if (franchiseUser.getFranchise().getStatus()
                != FranchiseStatus.ACTIVE) {

            throw new AccessDeniedException(
                    "This franchise is not currently active."
            );
        }

        return franchiseUser;
    }

    @Override
    @Transactional(readOnly = true)
    public FranchiseDistrictAllocation
    requireActiveDistrictAllocation(
            String email
    ) {

        FranchiseUser franchiseUser =
                requireFranchiseUser(email);

        return districtAllocationRepository
                .findByFranchiseIdAndActiveTrue(
                        franchiseUser
                                .getFranchise()
                                .getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "Active franchise district allocation is required."
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public FranchiseUser requirePermission(
            String email,
            FranchisePermission permission
    ) {

        if (permission == null) {
            throw new IllegalArgumentException(
                    "Franchise permission is required."
            );
        }

        FranchiseUser franchiseUser =
                requireFranchiseUser(email);

        if (franchiseUser.getStaffRole()
                == FranchiseStaffRole.FRANCHISE_OWNER) {

            return franchiseUser;
        }

        boolean allowed =
                permissionRepository
                        .existsByFranchiseUserIdAndPermission(
                                franchiseUser.getId(),
                                permission
                        );

        if (!allowed) {
            throw new AccessDeniedException(
                    "You do not have permission to access this franchise area."
            );
        }

        return franchiseUser;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(
            String email,
            FranchisePermission permission
    ) {

        try {
            requirePermission(
                    email,
                    permission
            );

            return true;

        } catch (AccessDeniedException exception) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Set<FranchisePermission> getEffectivePermissions(
            String email
    ) {

        FranchiseUser franchiseUser =
                requireFranchiseUser(email);

        if (franchiseUser.getStaffRole()
                == FranchiseStaffRole.FRANCHISE_OWNER) {

            return Collections.unmodifiableSet(
                    EnumSet.allOf(
                            FranchisePermission.class
                    )
            );
        }

        EnumSet<FranchisePermission> permissions =
                EnumSet.noneOf(
                        FranchisePermission.class
                );

        permissionRepository
                .findAllByFranchiseUserId(
                        franchiseUser.getId()
                )
                .stream()
                .map(
                        FranchiseUserPermission::getPermission
                )
                .filter(
                        Objects::nonNull
                )
                .forEach(
                        permissions::add
                );

        return Collections.unmodifiableSet(
                permissions
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FranchiseTerritory requireTerritoryInScope(
            String email,
            UUID territoryId
    ) {

        if (territoryId == null) {
            throw new IllegalArgumentException(
                    "Territory ID is required."
            );
        }

        FranchiseDistrictAllocation allocation =
                requireActiveDistrictAllocation(
                        email
                );

        return territoryRepository
                .findActiveTerritoryInFranchiseScope(
                        territoryId,
                        allocation
                                .getFranchise()
                                .getId()
                )
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "The requested territory is outside your franchise scope."
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> getActiveTerritoryIds(
            String email
    ) {

        FranchiseDistrictAllocation allocation =
                requireActiveDistrictAllocation(
                        email
                );

        return List.copyOf(
                territoryRepository
                        .findActiveTerritoryIdsByFranchiseId(
                                allocation
                                        .getFranchise()
                                        .getId()
                        )
        );
    }
}
