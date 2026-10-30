package com.theholymatrimony.backend.franchise.access;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.franchise.entity.Franchise;
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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.DisabledException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class FranchiseAccessServiceImplTests {

    private UserRepository userRepository;
    private FranchiseUserRepository franchiseUserRepository;
    private FranchiseUserPermissionRepository permissionRepository;
    private FranchiseDistrictAllocationRepository districtAllocationRepository;
    private FranchiseTerritoryRepository territoryRepository;

    private FranchiseAccessServiceImpl service;

    @BeforeEach
    void setUp() {
        userRepository =
                mock(UserRepository.class);

        franchiseUserRepository =
                mock(FranchiseUserRepository.class);

        permissionRepository =
                mock(FranchiseUserPermissionRepository.class);

        districtAllocationRepository =
                mock(FranchiseDistrictAllocationRepository.class);

        territoryRepository =
                mock(FranchiseTerritoryRepository.class);

        ActiveAccountValidator activeAccountValidator =
                new ActiveAccountValidator(
                        userRepository
                );

        service =
                new FranchiseAccessServiceImpl(
                        activeAccountValidator,
                        franchiseUserRepository,
                        permissionRepository,
                        districtAllocationRepository,
                        territoryRepository
                );
    }

    @Test
    void activeFranchiseOwnerIsAccepted() {
        FranchiseUser franchiseUser =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(franchiseUser);

        FranchiseUser result =
                service.requireFranchiseUser(
                        franchiseUser.getUser().getEmail()
                );

        assertSame(
                franchiseUser,
                result
        );
    }

    @Test
    void normalMemberCannotUseFranchiseAccessService() {
        User member =
                activeUser(
                        Role.ROLE_USER
                );

        when(
                userRepository.findByEmail(
                        member.getEmail()
                )
        ).thenReturn(
                Optional.of(member)
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requireFranchiseUser(
                                        member.getEmail()
                                )
                );

        assertEquals(
                "Franchise access is required.",
                exception.getMessage()
        );

        verifyNoInteractions(
                franchiseUserRepository
        );
    }

    @Test
    void disabledFranchiseAccountIsRejectedBeforeMembershipLookup() {
        User user =
                activeUser(
                        Role.ROLE_FRANCHISE
                );

        user.changeStatus(
                UserStatus.DEACTIVATED,
                "Disabled for test",
                UUID.randomUUID()
        );

        when(
                userRepository.findByEmail(
                        user.getEmail()
                )
        ).thenReturn(
                Optional.of(user)
        );

        assertThrows(
                DisabledException.class,
                () ->
                        service.requireFranchiseUser(
                                user.getEmail()
                        )
        );

        verifyNoInteractions(
                franchiseUserRepository
        );
    }

    @Test
    void franchiseRoleWithoutActiveMembershipIsDenied() {
        User user =
                activeUser(
                        Role.ROLE_FRANCHISE
                );

        when(
                userRepository.findByEmail(
                        user.getEmail()
                )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                franchiseUserRepository
                        .findByUserIdAndStatus(
                                user.getId(),
                                FranchiseUserStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.empty()
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requireFranchiseUser(
                                        user.getEmail()
                                )
                );

        assertEquals(
                "Active franchise membership is required.",
                exception.getMessage()
        );
    }

    @Test
    void inactiveFranchiseLifecycleIsDenied() {
        FranchiseUser franchiseUser =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        franchiseUser
                .getFranchise()
                .setStatus(
                        FranchiseStatus.SUSPENDED
                );

        allowActiveAccountAndMembership(
                franchiseUser
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requireFranchiseUser(
                                        franchiseUser
                                                .getUser()
                                                .getEmail()
                                )
                );

        assertEquals(
                "This franchise is not currently active.",
                exception.getMessage()
        );
    }

    @Test
    void ownerImplicitlyHasEveryPermission() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        FranchiseUser result =
                service.requirePermission(
                        owner.getUser().getEmail(),
                        FranchisePermission.STAFF_MANAGE
                );

        assertSame(
                owner,
                result
        );

        verify(
                permissionRepository,
                never()
        ).existsByFranchiseUserIdAndPermission(
                owner.getId(),
                FranchisePermission.STAFF_MANAGE
        );
    }

    @Test
    void staffWithAssignedPermissionIsAllowed() {
        FranchiseUser manager =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_MANAGER
                );

        allowActiveAccountAndMembership(manager);

        when(
                permissionRepository
                        .existsByFranchiseUserIdAndPermission(
                                manager.getId(),
                                FranchisePermission.MEMBERS_VIEW
                        )
        ).thenReturn(true);

        FranchiseUser result =
                service.requirePermission(
                        manager.getUser().getEmail(),
                        FranchisePermission.MEMBERS_VIEW
                );

        assertSame(
                manager,
                result
        );
    }

    @Test
    void staffWithoutAssignedPermissionIsDenied() {
        FranchiseUser manager =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_MANAGER
                );

        allowActiveAccountAndMembership(manager);

        when(
                permissionRepository
                        .existsByFranchiseUserIdAndPermission(
                                manager.getId(),
                                FranchisePermission.PAYMENTS_VIEW
                        )
        ).thenReturn(false);

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requirePermission(
                                        manager.getUser().getEmail(),
                                        FranchisePermission.PAYMENTS_VIEW
                                )
                );

        assertEquals(
                "You do not have permission to access this franchise area.",
                exception.getMessage()
        );
    }

    @Test
    void nullPermissionIsRejectedBeforeAccountLookup() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.requirePermission(
                                "franchise@example.com",
                                null
                        )
        );

        verifyNoInteractions(
                userRepository,
                franchiseUserRepository,
                permissionRepository
        );
    }

    @Test
    void ownerEffectivePermissionsContainEveryPermission() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        Set<FranchisePermission> permissions =
                service.getEffectivePermissions(
                        owner.getUser().getEmail()
                );

        assertEquals(
                Set.of(
                        FranchisePermission.values()
                ),
                permissions
        );

        verify(
                permissionRepository,
                never()
        ).findAllByFranchiseUserId(
                owner.getId()
        );
    }

    @Test
    void staffEffectivePermissionsComeFromDatabase() {
        FranchiseUser manager =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_MANAGER
                );

        allowActiveAccountAndMembership(manager);

        when(
                permissionRepository
                        .findAllByFranchiseUserId(
                                manager.getId()
                        )
        ).thenReturn(
                List.of(
                        FranchiseUserPermission.builder()
                                .franchiseUserId(
                                        manager.getId()
                                )
                                .permission(
                                        FranchisePermission.DASHBOARD_VIEW
                                )
                                .build(),
                        FranchiseUserPermission.builder()
                                .franchiseUserId(
                                        manager.getId()
                                )
                                .permission(
                                        FranchisePermission.MEMBERS_VIEW
                                )
                                .build()
                )
        );

        Set<FranchisePermission> permissions =
                service.getEffectivePermissions(
                        manager.getUser().getEmail()
                );

        assertEquals(
                Set.of(
                        FranchisePermission.DASHBOARD_VIEW,
                        FranchisePermission.MEMBERS_VIEW
                ),
                permissions
        );
    }

    @Test
    void permissionRevocationTakesEffectOnNextAuthorizationCheck() {
        FranchiseUser manager =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_MANAGER
                );

        allowActiveAccountAndMembership(manager);

        when(
                permissionRepository
                        .existsByFranchiseUserIdAndPermission(
                                manager.getId(),
                                FranchisePermission.LEADS_MANAGE
                        )
        ).thenReturn(
                true,
                false
        );

        assertTrue(
                service.hasPermission(
                        manager.getUser().getEmail(),
                        FranchisePermission.LEADS_MANAGE
                )
        );

        assertFalse(
                service.hasPermission(
                        manager.getUser().getEmail(),
                        FranchisePermission.LEADS_MANAGE
                )
        );

        verify(
                permissionRepository,
                org.mockito.Mockito.times(2)
        ).existsByFranchiseUserIdAndPermission(
                manager.getId(),
                FranchisePermission.LEADS_MANAGE
        );
    }

    @Test
    void activeDistrictAllocationIsDerivedFromAuthenticatedFranchise() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(UUID.randomUUID())
                        .franchise(owner.getFranchise())
                        .active(true)
                        .build();

        when(
                districtAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.of(allocation)
        );

        FranchiseDistrictAllocation result =
                service.requireActiveDistrictAllocation(
                        owner.getUser().getEmail()
                );

        assertSame(
                allocation,
                result
        );

        verify(
                districtAllocationRepository
        ).findByFranchiseIdAndActiveTrue(
                owner.getFranchise().getId()
        );
    }

    @Test
    void missingActiveDistrictAllocationIsDenied() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        when(
                districtAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.empty()
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requireActiveDistrictAllocation(
                                        owner.getUser().getEmail()
                                )
                );

        assertEquals(
                "Active franchise district allocation is required.",
                exception.getMessage()
        );
    }

    @Test
    void territoryLookupUsesAuthenticatedFranchiseScope() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(UUID.randomUUID())
                        .franchise(owner.getFranchise())
                        .active(true)
                        .build();

        UUID territoryId =
                UUID.randomUUID();

        FranchiseTerritory territory =
                FranchiseTerritory.builder()
                        .id(territoryId)
                        .districtAllocation(allocation)
                        .name("Guntur City")
                        .active(true)
                        .build();

        when(
                districtAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                territoryRepository
                        .findActiveTerritoryInFranchiseScope(
                                territoryId,
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.of(territory)
        );

        FranchiseTerritory result =
                service.requireTerritoryInScope(
                        owner.getUser().getEmail(),
                        territoryId
                );

        assertSame(
                territory,
                result
        );

        verify(
                territoryRepository
        ).findActiveTerritoryInFranchiseScope(
                territoryId,
                owner.getFranchise().getId()
        );
    }

    @Test
    void outOfScopeTerritoryIsDenied() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(UUID.randomUUID())
                        .franchise(owner.getFranchise())
                        .active(true)
                        .build();

        UUID territoryId =
                UUID.randomUUID();

        when(
                districtAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                territoryRepository
                        .findActiveTerritoryInFranchiseScope(
                                territoryId,
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.empty()
        );

        AccessDeniedException exception =
                assertThrows(
                        AccessDeniedException.class,
                        () ->
                                service.requireTerritoryInScope(
                                        owner.getUser().getEmail(),
                                        territoryId
                                )
                );

        assertEquals(
                "The requested territory is outside your franchise scope.",
                exception.getMessage()
        );
    }

    @Test
    void nullTerritoryIdIsRejectedBeforeAccountLookup() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.requireTerritoryInScope(
                                "franchise@example.com",
                                null
                        )
        );

        verifyNoInteractions(
                userRepository,
                franchiseUserRepository,
                districtAllocationRepository,
                territoryRepository
        );
    }

    @Test
    void activeTerritoryIdsAreDerivedFromAuthenticatedFranchise() {
        FranchiseUser owner =
                activeFranchiseUser(
                        FranchiseStaffRole.FRANCHISE_OWNER
                );

        allowActiveAccountAndMembership(owner);

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation.builder()
                        .id(UUID.randomUUID())
                        .franchise(owner.getFranchise())
                        .active(true)
                        .build();

        UUID first =
                UUID.randomUUID();

        UUID second =
                UUID.randomUUID();

        when(
                districtAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                territoryRepository
                        .findActiveTerritoryIdsByFranchiseId(
                                owner.getFranchise().getId()
                        )
        ).thenReturn(
                List.of(
                        first,
                        second
                )
        );

        List<UUID> result =
                service.getActiveTerritoryIds(
                        owner.getUser().getEmail()
                );

        assertEquals(
                List.of(
                        first,
                        second
                ),
                result
        );

        verify(
                territoryRepository
        ).findActiveTerritoryIdsByFranchiseId(
                owner.getFranchise().getId()
        );
    }

    private void allowActiveAccountAndMembership(
            FranchiseUser franchiseUser
    ) {
        when(
                userRepository.findByEmail(
                        franchiseUser
                                .getUser()
                                .getEmail()
                )
        ).thenReturn(
                Optional.of(
                        franchiseUser.getUser()
                )
        );

        when(
                franchiseUserRepository
                        .findByUserIdAndStatus(
                                franchiseUser
                                        .getUser()
                                        .getId(),
                                FranchiseUserStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.of(franchiseUser)
        );
    }

    private FranchiseUser activeFranchiseUser(
            FranchiseStaffRole staffRole
    ) {
        User user =
                activeUser(
                        Role.ROLE_FRANCHISE
                );

        Franchise franchise =
                Franchise.builder()
                        .id(UUID.randomUUID())
                        .franchiseCode(
                                "FR-"
                                        + UUID.randomUUID()
                                                .toString()
                                                .substring(0, 8)
                                                .toUpperCase()
                        )
                        .legalName("Test Franchise")
                        .displayName("Test Franchise")
                        .status(FranchiseStatus.ACTIVE)
                        .build();

        return FranchiseUser.builder()
                .id(UUID.randomUUID())
                .franchise(franchise)
                .user(user)
                .staffRole(staffRole)
                .status(FranchiseUserStatus.ACTIVE)
                .build();
    }

    private User activeUser(
            Role role
    ) {
        UUID id =
                UUID.randomUUID();

        return User.builder()
                .id(id)
                .fullName("Franchise User")
                .email(id + "@example.com")
                .password("encoded-password")
                .emailVerified(true)
                .enabled(true)
                .status(UserStatus.ACTIVE)
                .role(role)
                .build();
    }
}
