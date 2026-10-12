package com.theholymatrimony.backend.admin.access;

import com.theholymatrimony.backend.admin.adminuser.controller.AdminUserManagementController;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminPageResponse;
import com.theholymatrimony.backend.admin.adminuser.service.SubAdminManagementService;
import com.theholymatrimony.backend.admin.controller.AdminController;
import com.theholymatrimony.backend.admin.service.AdminDashboardService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminMethodSecurityTests {

    private AnnotationConfigApplicationContext context;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();

        if (context != null) {
            context.close();
        }
    }

    @Test
    void dashboardAllowsAdminWhenDashboardPermissionIsGranted() {
        context = createContext();

        AdminAuthorization authorization =
                context.getBean(
                        AdminAuthorization.class
                );

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminController controller =
                context.getBean(
                        AdminController.class
                );

        authenticate(
                "subadmin@example.com"
        );

        when(
                accessService.hasPermission(
                        "subadmin@example.com",
                        AdminPermission.DASHBOARD_VIEW
                )
        ).thenReturn(true);

        assertDoesNotThrow(
                controller::getDashboard
        );

        verify(
                accessService
        ).hasPermission(
                "subadmin@example.com",
                AdminPermission.DASHBOARD_VIEW
        );

        verify(
                context.getBean(
                        AdminDashboardService.class
                )
        ).getDashboard();

        /*
         * Force bean resolution here as an additional assertion
         * that the SpEL bridge is registered under the expected
         * component name in this method-security context.
         */
        assertDoesNotThrow(
                () -> authorization.hasPermission(
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication(),
                        "DASHBOARD_VIEW"
                )
        );
    }

    @Test
    void dashboardDeniesAdminWhenDashboardPermissionIsMissing() {
        context = createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminController controller =
                context.getBean(
                        AdminController.class
                );

        AdminDashboardService dashboardService =
                context.getBean(
                        AdminDashboardService.class
                );

        authenticate(
                "subadmin@example.com"
        );

        when(
                accessService.hasPermission(
                        "subadmin@example.com",
                        AdminPermission.DASHBOARD_VIEW
                )
        ).thenReturn(false);

        assertThrows(
                AccessDeniedException.class,
                controller::getDashboard
        );

        verify(
                dashboardService,
                never()
        ).getDashboard();
    }

    @Test
    void adminUserManagementAllowsSuperAdmin() {
        context = createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminUserManagementController controller =
                context.getBean(
                        AdminUserManagementController.class
                );

        SubAdminManagementService managementService =
                context.getBean(
                        SubAdminManagementService.class
                );

        authenticate(
                "primary@example.com"
        );

        when(
                accessService.requireSuperAdmin(
                        "primary@example.com"
                )
        ).thenReturn(
                mock(
                        com.theholymatrimony.backend.auth.entity.User.class
                )
        );

        when(
                managementService.getSubAdmins(
                        any(),
                        any(),
                        any()
                )
        ).thenReturn(
                new SubAdminPageResponse(
                        List.of(),
                        0,
                        20,
                        0L,
                        0
                )
        );

        assertDoesNotThrow(
                () ->
                        controller.getSubAdmins(
                                0,
                                20,
                                null,
                                null
                        )
        );

        verify(
                accessService
        ).requireSuperAdmin(
                "primary@example.com"
        );

        verify(
                managementService
        ).getSubAdmins(
                eq(null),
                eq(null),
                any()
        );
    }

    @Test
    void adminUserManagementDeniesSubAdminBeforeServiceInvocation() {
        context = createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminUserManagementController controller =
                context.getBean(
                        AdminUserManagementController.class
                );

        SubAdminManagementService managementService =
                context.getBean(
                        SubAdminManagementService.class
                );

        authenticate(
                "subadmin@example.com"
        );

        when(
                accessService.requireSuperAdmin(
                        "subadmin@example.com"
                )
        ).thenThrow(
                new AccessDeniedException(
                        "Super administrator access is required."
                )
        );

        assertThrows(
                AccessDeniedException.class,
                () ->
                        controller.getSubAdmins(
                                0,
                                20,
                                null,
                                null
                        )
        );

        verify(
                managementService,
                never()
        ).getSubAdmins(
                any(),
                any(),
                any()
        );
    }

    private AnnotationConfigApplicationContext
    createContext() {

        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext();

        applicationContext.register(
                TestConfiguration.class
        );

        applicationContext.refresh();

        return applicationContext;
    }

    private void authenticate(
            String email
    ) {
        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                "ignored",
                                List.of()
                        )
                );
    }

    @Configuration
    @EnableMethodSecurity
    static class TestConfiguration {

        @Bean
        AdminAccessService adminAccessService() {
            return mock(
                    AdminAccessService.class
            );
        }

        @Bean
        AdminAuthorization adminAuthorization(
                AdminAccessService adminAccessService
        ) {
            return new AdminAuthorization(
                    adminAccessService
            );
        }

        @Bean
        AdminDashboardService adminDashboardService() {
            return mock(
                    AdminDashboardService.class
            );
        }

        @Bean
        SubAdminManagementService
        subAdminManagementService() {
            return mock(
                    SubAdminManagementService.class
            );
        }

        @Bean
        AdminController adminController(
                AdminDashboardService adminDashboardService
        ) {
            return new AdminController(
                    adminDashboardService
            );
        }

        @Bean
        AdminUserManagementController
        adminUserManagementController(
                SubAdminManagementService
                        subAdminManagementService
        ) {
            return new AdminUserManagementController(
                    subAdminManagementService
            );
        }
    }
}
