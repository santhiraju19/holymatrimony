package com.theholymatrimony.backend.admin.franchise.controller;

import com.theholymatrimony.backend.admin.access.AdminAccessService;
import com.theholymatrimony.backend.admin.access.AdminAuthorization;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.admin.franchise.service.AdminFranchiseManagementService;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.common.response.ApiResponse;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Constructor;
import java.lang.reflect.RecordComponent;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminFranchiseManagementMethodSecurityTests {

    private AnnotationConfigApplicationContext context;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();

        if (context != null) {
            context.close();
        }
    }

    @Test
    void createDistrictFranchiseAllowsSuperAdminAndInvokesService() {
        context =
                createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminFranchiseManagementService managementService =
                context.getBean(
                        AdminFranchiseManagementService.class
                );

        AdminFranchiseManagementController controller =
                context.getBean(
                        AdminFranchiseManagementController.class
                );

        String administratorEmail =
                "primary@example.com";

        Authentication authentication =
                authenticate(
                        administratorEmail
                );

        CreateDistrictFranchiseRequest request =
                request();

        AdminFranchiseResponse serviceResponse =
                sampleResponse();

        when(
                accessService.requireSuperAdmin(
                        administratorEmail
                )
        ).thenReturn(
                mock(
                        User.class
                )
        );

        when(
                managementService.createDistrictFranchise(
                        administratorEmail,
                        request
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<AdminFranchiseResponse>> result =
                controller.createDistrictFranchise(
                        authentication,
                        request
                );

        assertEquals(
                HttpStatus.CREATED,
                result.getStatusCode()
        );

        assertNotNull(
                result.getBody()
        );

        assertSame(
                serviceResponse,
                extractEnvelopeData(
                        result.getBody()
                )
        );

        verify(
                accessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                managementService
        ).createDistrictFranchise(
                administratorEmail,
                request
        );
    }

    @Test
    void createDistrictFranchiseDeniesSubAdminBeforeServiceInvocation() {
        context =
                createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminFranchiseManagementService managementService =
                context.getBean(
                        AdminFranchiseManagementService.class
                );

        AdminFranchiseManagementController controller =
                context.getBean(
                        AdminFranchiseManagementController.class
                );

        String administratorEmail =
                "subadmin@example.com";

        Authentication authentication =
                authenticate(
                        administratorEmail
                );

        CreateDistrictFranchiseRequest request =
                request();

        when(
                accessService.requireSuperAdmin(
                        administratorEmail
                )
        ).thenThrow(
                new AccessDeniedException(
                        "Super administrator access is required."
                )
        );

        assertThrows(
                AccessDeniedException.class,
                () ->
                        controller.createDistrictFranchise(
                                authentication,
                                request
                        )
        );

        verify(
                accessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                managementService,
                never()
        ).createDistrictFranchise(
                any(),
                any()
        );
    }

    @Test
    void createDistrictFranchiseDeniesUnauthenticatedInvocationBeforeService() {
        context =
                createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminFranchiseManagementService managementService =
                context.getBean(
                        AdminFranchiseManagementService.class
                );

        AdminFranchiseManagementController controller =
                context.getBean(
                        AdminFranchiseManagementController.class
                );

        CreateDistrictFranchiseRequest request =
                request();

        SecurityContextHolder.clearContext();

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                controller.createDistrictFranchise(
                                        null,
                                        request
                                )
                );

        assertNotNull(
                exception.getCause()
        );

        verify(
                accessService,
                never()
        ).requireSuperAdmin(
                any()
        );

        verify(
                managementService,
                never()
        ).createDistrictFranchise(
                any(),
                any()
        );
    }


    @Test
    void getFranchiseAllowsSuperAdminAndInvokesService() {
        context =
                createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminFranchiseManagementService managementService =
                context.getBean(
                        AdminFranchiseManagementService.class
                );

        AdminFranchiseManagementController controller =
                context.getBean(
                        AdminFranchiseManagementController.class
                );

        String administratorEmail =
                "primary@example.com";

        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                authenticate(
                        administratorEmail
                );

        AdminFranchiseResponse serviceResponse =
                sampleResponse();

        when(
                accessService.requireSuperAdmin(
                        administratorEmail
                )
        ).thenReturn(
                mock(
                        User.class
                )
        );

        when(
                managementService.getFranchise(
                        administratorEmail,
                        franchiseId
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<AdminFranchiseResponse>> result =
                controller.getFranchise(
                        authentication,
                        franchiseId
                );

        assertEquals(
                HttpStatus.OK,
                result.getStatusCode()
        );

        assertNotNull(
                result.getBody()
        );

        assertSame(
                serviceResponse,
                extractEnvelopeData(
                        result.getBody()
                )
        );

        verify(
                accessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                managementService
        ).getFranchise(
                administratorEmail,
                franchiseId
        );
    }

    @Test
    void getFranchiseDeniesSubAdminBeforeServiceInvocation() {
        context =
                createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminFranchiseManagementService managementService =
                context.getBean(
                        AdminFranchiseManagementService.class
                );

        AdminFranchiseManagementController controller =
                context.getBean(
                        AdminFranchiseManagementController.class
                );

        String administratorEmail =
                "subadmin@example.com";

        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                authenticate(
                        administratorEmail
                );

        when(
                accessService.requireSuperAdmin(
                        administratorEmail
                )
        ).thenThrow(
                new AccessDeniedException(
                        "Super administrator access is required."
                )
        );

        assertThrows(
                AccessDeniedException.class,
                () ->
                        controller.getFranchise(
                                authentication,
                                franchiseId
                        )
        );

        verify(
                accessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                managementService,
                never()
        ).getFranchise(
                any(),
                any()
        );
    }

    @Test
    void getFranchiseDeniesUnauthenticatedInvocationBeforeService() {
        context =
                createContext();

        AdminAccessService accessService =
                context.getBean(
                        AdminAccessService.class
                );

        AdminFranchiseManagementService managementService =
                context.getBean(
                        AdminFranchiseManagementService.class
                );

        AdminFranchiseManagementController controller =
                context.getBean(
                        AdminFranchiseManagementController.class
                );

        UUID franchiseId =
                UUID.randomUUID();

        SecurityContextHolder.clearContext();

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                controller.getFranchise(
                                        null,
                                        franchiseId
                                )
                );

        assertNotNull(
                exception.getCause()
        );

        verify(
                accessService,
                never()
        ).requireSuperAdmin(
                any()
        );

        verify(
                managementService,
                never()
        ).getFranchise(
                any(),
                any()
        );
    }

    private AnnotationConfigApplicationContext createContext() {
        AnnotationConfigApplicationContext applicationContext =
                new AnnotationConfigApplicationContext();

        applicationContext.register(
                TestConfiguration.class
        );

        applicationContext.refresh();

        return applicationContext;
    }

    private Authentication authenticate(
            String email
    ) {
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        "ignored",
                        java.util.List.of()
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        authentication
                );

        return authentication;
    }

    private CreateDistrictFranchiseRequest request() {
        return new CreateDistrictFranchiseRequest(
                "HM-GNT-001",
                "Holy Matrimony Guntur",
                UUID.randomUUID(),
                "District Owner",
                "owner@example.com",
                "9876543210"
        );
    }

    private AdminFranchiseResponse sampleResponse() {
        try {
            if (!AdminFranchiseResponse.class.isRecord()) {
                throw new IllegalStateException(
                        "AdminFranchiseResponse must remain a Java record."
                );
            }

            RecordComponent[] components =
                    AdminFranchiseResponse.class
                            .getRecordComponents();

            Class<?>[] parameterTypes =
                    Arrays.stream(
                                    components
                            )
                            .map(
                                    RecordComponent::getType
                            )
                            .toArray(
                                    Class<?>[]::new
                            );

            Constructor<AdminFranchiseResponse> constructor =
                    AdminFranchiseResponse.class
                            .getDeclaredConstructor(
                                    parameterTypes
                            );

            constructor.setAccessible(
                    true
            );

            Object[] arguments =
                    Arrays.stream(
                                    components
                            )
                            .map(
                                    component ->
                                            sampleValue(
                                                    component.getType()
                                            )
                            )
                            .toArray();

            return constructor.newInstance(
                    arguments
            );
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(
                    "Unable to create AdminFranchiseResponse test fixture.",
                    exception
            );
        }
    }

    private Object sampleValue(
            Class<?> type
    ) {
        if (type == String.class) {
            return "test";
        }

        if (type == UUID.class) {
            return UUID.randomUUID();
        }

        if (type == Boolean.class) {
            return Boolean.TRUE;
        }

        if (type == boolean.class) {
            return true;
        }

        if (type == Integer.class) {
            return 1;
        }

        if (type == int.class) {
            return 1;
        }

        if (type == Long.class) {
            return 1L;
        }

        if (type == long.class) {
            return 1L;
        }

        if (type == Instant.class) {
            return Instant.parse(
                    "2026-10-30T00:00:00Z"
            );
        }

        if (type == LocalDate.class) {
            return LocalDate.of(
                    2026,
                    10,
                    30
            );
        }

        if (type == LocalDateTime.class) {
            return LocalDateTime.of(
                    2026,
                    10,
                    30,
                    0,
                    0
            );
        }

        if (type == OffsetDateTime.class) {
            return OffsetDateTime.parse(
                    "2026-10-30T00:00:00Z"
            );
        }

        if (type == ZonedDateTime.class) {
            return ZonedDateTime.parse(
                    "2026-10-30T00:00:00Z"
            );
        }

        if (type.isEnum()) {
            Object[] constants =
                    type.getEnumConstants();

            if (
                    constants == null
                            || constants.length == 0
            ) {
                throw new IllegalStateException(
                        "Enum test fixture has no constants: "
                                + type.getName()
                );
            }

            return constants[0];
        }

        throw new IllegalStateException(
                "Unsupported AdminFranchiseResponse component type: "
                        + type.getName()
        );
    }

    private Object extractEnvelopeData(
            ApiResponse<?> response
    ) {
        try {
            for (
                    String accessorName :
                    java.util.List.of(
                            "data",
                            "getData"
                    )
            ) {
                try {
                    return response
                            .getClass()
                            .getMethod(
                                    accessorName
                            )
                            .invoke(
                                    response
                            );
                } catch (
                        NoSuchMethodException ignored
                ) {
                    // Try the next established accessor convention.
                }
            }

            throw new IllegalStateException(
                    "ApiResponse data accessor not found."
            );
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException(
                    "Unable to inspect ApiResponse test envelope.",
                    exception
            );
        }
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
        AdminFranchiseManagementService
        adminFranchiseManagementService() {
            return mock(
                    AdminFranchiseManagementService.class
            );
        }

        @Bean
        AdminFranchiseManagementController
        adminFranchiseManagementController(
                AdminFranchiseManagementService
                        adminFranchiseManagementService
        ) {
            return new AdminFranchiseManagementController(
                    adminFranchiseManagementService
            );
        }
    }
}
