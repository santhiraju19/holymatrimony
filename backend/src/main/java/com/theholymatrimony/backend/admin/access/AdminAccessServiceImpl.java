package com.theholymatrimony.backend.admin.access;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.security.ActiveAccountValidator;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAccessServiceImpl
        implements AdminAccessService {

    private final ActiveAccountValidator activeAccountValidator;
    private final AdminUserPermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public User requireAdmin(String email) {

        User user =
                activeAccountValidator.requireActiveUser(email);

        if (user.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException(
                    "Administrator access is required."
            );
        }

        if (user.getAdminAccessLevel() == null) {
            throw new AccessDeniedException(
                    "Administrator access level is not configured."
            );
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User requireSuperAdmin(String email) {

        User user = requireAdmin(email);

        if (user.getAdminAccessLevel()
                != AdminAccessLevel.SUPER_ADMIN) {

            throw new AccessDeniedException(
                    "Super administrator access is required."
            );
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User requirePermission(
            String email,
            AdminPermission permission
    ) {

        if (permission == null) {
            throw new IllegalArgumentException(
                    "Admin permission is required."
            );
        }

        User user = requireAdmin(email);

        if (user.getAdminAccessLevel()
                == AdminAccessLevel.SUPER_ADMIN) {

            return user;
        }

        if (user.getAdminAccessLevel()
                != AdminAccessLevel.SUB_ADMIN) {

            throw new AccessDeniedException(
                    "Administrator access level is invalid."
            );
        }

        boolean allowed =
                permissionRepository
                        .existsByUserIdAndPermission(
                                user.getId(),
                                permission
                        );

        if (!allowed) {
            throw new AccessDeniedException(
                    "You do not have permission to access this admin area."
            );
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(
            String email,
            AdminPermission permission
    ) {

        try {
            requirePermission(email, permission);
            return true;
        } catch (AccessDeniedException exception) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Set<AdminPermission> getEffectivePermissions(
            String email
    ) {

        User user = requireAdmin(email);

        if (user.getAdminAccessLevel()
                == AdminAccessLevel.SUPER_ADMIN) {

            return java.util.Collections.unmodifiableSet(
                    java.util.EnumSet.allOf(
                            AdminPermission.class
                    )
            );
        }

        if (user.getAdminAccessLevel()
                != AdminAccessLevel.SUB_ADMIN) {

            throw new AccessDeniedException(
                    "Administrator access level is invalid."
            );
        }

        java.util.EnumSet<AdminPermission> permissions =
                java.util.EnumSet.noneOf(
                        AdminPermission.class
                );

        permissionRepository
                .findAllByUserId(
                        user.getId()
                )
                .stream()
                .map(
                        AdminUserPermission::getPermission
                )
                .filter(
                        java.util.Objects::nonNull
                )
                .forEach(
                        permissions::add
                );

        return java.util.Collections.unmodifiableSet(
                permissions
        );
    }
}
