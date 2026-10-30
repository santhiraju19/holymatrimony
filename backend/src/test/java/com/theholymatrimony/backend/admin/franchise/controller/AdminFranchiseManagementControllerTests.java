package com.theholymatrimony.backend.admin.franchise.controller;

import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseStatusResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseTerritoryResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchisePageResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.admin.franchise.dto.CreateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.admin.franchise.dto.UpdateFranchiseStatusRequest;
import com.theholymatrimony.backend.admin.franchise.service.AdminFranchiseManagementService;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;
import com.theholymatrimony.backend.common.response.ApiResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminFranchiseManagementControllerTests {

    private AdminFranchiseManagementService service;

    private AdminFranchiseManagementController controller;

    @BeforeEach
    void setUp() {
        service =
                mock(
                        AdminFranchiseManagementService.class
                );

        controller =
                new AdminFranchiseManagementController(
                        service
                );
    }

    @Test
    void createDistrictFranchiseUsesAuthenticatedAdministratorAndReturnsCreatedEnvelope() {
        String administratorEmail =
                "primary@example.com";

        Authentication authentication =
                authenticated(
                        administratorEmail
                );

        CreateDistrictFranchiseRequest request =
                request();

        AdminFranchiseResponse serviceResponse =
                sampleResponse();

        when(
                service.createDistrictFranchise(
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
                service
        ).createDistrictFranchise(
                administratorEmail,
                request
        );
    }

    @Test
    void createDistrictFranchiseRejectsNullAuthenticationBeforeServiceInvocation() {
        CreateDistrictFranchiseRequest request =
                request();

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                controller.createDistrictFranchise(
                                        null,
                                        request
                                )
                );

        assertEquals(
                "Authenticated administrator not found.",
                exception.getMessage()
        );

        verify(
                service,
                never()
        ).createDistrictFranchise(
                eq("primary@example.com"),
                eq(request)
        );
    }

    @Test
    void createDistrictFranchiseRejectsUnauthenticatedAuthenticationBeforeServiceInvocation() {
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "primary@example.com",
                        "ignored"
                );

        CreateDistrictFranchiseRequest request =
                request();

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                controller.createDistrictFranchise(
                                        authentication,
                                        request
                                )
                );

        assertEquals(
                "Authenticated administrator not found.",
                exception.getMessage()
        );

        verify(
                service,
                never()
        ).createDistrictFranchise(
                eq("primary@example.com"),
                eq(request)
        );
    }

    @Test
    void createDistrictFranchiseRejectsBlankAdministratorIdentityBeforeServiceInvocation() {
        Authentication authentication =
                authenticated(
                        "   "
                );

        CreateDistrictFranchiseRequest request =
                request();

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                controller.createDistrictFranchise(
                                        authentication,
                                        request
                                )
                );

        assertEquals(
                "Authenticated administrator not found.",
                exception.getMessage()
        );

        verify(
                service,
                never()
        ).createDistrictFranchise(
                eq("   "),
                eq(request)
        );
    }

    private Authentication authenticated(
            String email
    ) {
        return new UsernamePasswordAuthenticationToken(
                email,
                "ignored",
                java.util.List.of()
        );
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

    @Test
    void listFranchisesPassesAuthenticatedAdministratorAndFiltersToService() {
        Authentication authentication =
                mock(
                        Authentication.class
                );

        when(
                authentication.isAuthenticated()
        ).thenReturn(
                true
        );

        when(
                authentication.getName()
        ).thenReturn(
                "admin@theholymatrimony.com"
        );

        AdminFranchisePageResponse serviceResponse =
                AdminFranchisePageResponse
                        .builder()
                        .content(
                                java.util.List.of()
                        )
                        .page(
                                2
                        )
                        .size(
                                25
                        )
                        .totalElements(
                                0
                        )
                        .totalPages(
                                0
                        )
                        .first(
                                false
                        )
                        .last(
                                true
                        )
                        .build();

        when(
                service.listFranchises(
                        "admin@theholymatrimony.com",
                        "Guntur",
                        FranchiseStatus.ACTIVE,
                        2,
                        25
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<AdminFranchisePageResponse>> response =
                controller.listFranchises(
                        authentication,
                        "Guntur",
                        FranchiseStatus.ACTIVE,
                        2,
                        25
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        verify(
                service
        ).listFranchises(
                "admin@theholymatrimony.com",
                "Guntur",
                FranchiseStatus.ACTIVE,
                2,
                25
        );

        ApiResponse<AdminFranchisePageResponse> body =
                response.getBody();

        org.junit.jupiter.api.Assertions.assertNotNull(
                body
        );

        try {
            java.lang.reflect.Field dataField =
                    ApiResponse.class.getDeclaredField(
                            "data"
                    );

            dataField.setAccessible(
                    true
            );

            assertSame(
                    serviceResponse,
                    dataField.get(
                            body
                    )
            );
        } catch (
                ReflectiveOperationException exception
        ) {
            throw new AssertionError(
                    "Unable to inspect ApiResponse data field.",
                    exception
            );
        }
    }

    @Test
    void listFranchisesRejectsNullAuthenticationBeforeService() {
        assertThrows(
                IllegalStateException.class,
                () ->
                        controller.listFranchises(
                                null,
                                null,
                                null,
                                0,
                                20
                        )
        );

        verify(
                service,
                never()
        ).listFranchises(
                any(),
                any(),
                any(),
                anyInt(),
                anyInt()
        );
    }

    @Test
    void listFranchisesRejectsUnauthenticatedAuthenticationBeforeService() {
        Authentication authentication =
                mock(
                        Authentication.class
                );

        when(
                authentication.isAuthenticated()
        ).thenReturn(
                false
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        controller.listFranchises(
                                authentication,
                                null,
                                null,
                                0,
                                20
                        )
        );

        verify(
                service,
                never()
        ).listFranchises(
                any(),
                any(),
                any(),
                anyInt(),
                anyInt()
        );
    }

    @Test
    void listFranchisesRejectsBlankAdministratorIdentityBeforeService() {
        Authentication authentication =
                mock(
                        Authentication.class
                );

        when(
                authentication.isAuthenticated()
        ).thenReturn(
                true
        );

        when(
                authentication.getName()
        ).thenReturn(
                "   "
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        controller.listFranchises(
                                authentication,
                                null,
                                null,
                                0,
                                20
                        )
        );

        verify(
                service,
                never()
        ).listFranchises(
                any(),
                any(),
                any(),
                anyInt(),
                anyInt()
        );
    }


    @Test
    void getFranchisePassesAuthenticatedAdministratorAndFranchiseIdToService() {
        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                mock(
                        Authentication.class
                );

        AdminFranchiseResponse serviceResponse =
                mock(
                        AdminFranchiseResponse.class
                );

        when(
                authentication.isAuthenticated()
        ).thenReturn(
                true
        );

        when(
                authentication.getName()
        ).thenReturn(
                "admin@theholymatrimony.com"
        );

        when(
                service.getFranchise(
                        "admin@theholymatrimony.com",
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
                service
        ).getFranchise(
                "admin@theholymatrimony.com",
                franchiseId
        );
    }

    @Test
    void getFranchiseRejectsNullAuthenticationBeforeServiceInvocation() {
        UUID franchiseId =
                UUID.randomUUID();

        assertThrows(
                IllegalStateException.class,
                () ->
                        controller.getFranchise(
                                null,
                                franchiseId
                        )
        );

        verify(
                service,
                never()
        ).getFranchise(
                any(),
                any()
        );
    }

    @Test
    void getFranchiseRejectsUnauthenticatedAuthenticationBeforeServiceInvocation() {
        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                mock(
                        Authentication.class
                );

        when(
                authentication.isAuthenticated()
        ).thenReturn(
                false
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        controller.getFranchise(
                                authentication,
                                franchiseId
                        )
        );

        verify(
                service,
                never()
        ).getFranchise(
                any(),
                any()
        );
    }

    @Test
    void getFranchiseRejectsBlankAdministratorIdentityBeforeServiceInvocation() {
        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                mock(
                        Authentication.class
                );

        when(
                authentication.isAuthenticated()
        ).thenReturn(
                true
        );

        when(
                authentication.getName()
        ).thenReturn(
                "   "
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        controller.getFranchise(
                                authentication,
                                franchiseId
                        )
        );

        verify(
                service,
                never()
        ).getFranchise(
                any(),
                any()
        );
    }


    @Test
    void updateFranchiseStatusUsesAuthenticatedAdministratorAndReturnsOkEnvelope() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                authenticated(
                        administratorEmail
                );

        UpdateFranchiseStatusRequest request =
                new UpdateFranchiseStatusRequest(
                        FranchiseStatus.ACTIVE,
                        "Onboarding completed"
                );

        AdminFranchiseStatusResponse serviceResponse =
                mock(
                        AdminFranchiseStatusResponse.class
                );

        when(
                service.updateFranchiseStatus(
                        administratorEmail,
                        franchiseId,
                        request
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<AdminFranchiseStatusResponse>> result =
                controller.updateFranchiseStatus(
                        authentication,
                        franchiseId,
                        request
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
                service
        ).updateFranchiseStatus(
                administratorEmail,
                franchiseId,
                request
        );
    }


    @Test
    void updateFranchiseStatusRejectsNullAuthenticationBeforeServiceInvocation() {
        UUID franchiseId =
                UUID.randomUUID();

        UpdateFranchiseStatusRequest request =
                new UpdateFranchiseStatusRequest(
                        FranchiseStatus.ACTIVE,
                        "Onboarding completed"
                );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                controller.updateFranchiseStatus(
                                        null,
                                        franchiseId,
                                        request
                                )
                );

        assertEquals(
                "Authenticated administrator identity is required.",
                exception.getMessage()
        );

        verify(
                service,
                never()
        ).updateFranchiseStatus(
                any(),
                any(),
                any()
        );
    }


    @Test
    void createTerritoryUsesAuthenticatedAdministratorAndReturnsCreatedEnvelope() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                authenticated(
                        administratorEmail
                );

        CreateFranchiseTerritoryRequest request =
                new CreateFranchiseTerritoryRequest(
                        "GNT-CITY",
                        "Guntur City",
                        FranchiseTerritoryType.CITY,
                        "Guntur urban coverage"
                );

        AdminFranchiseTerritoryResponse serviceResponse =
                mock(
                        AdminFranchiseTerritoryResponse.class
                );

        when(
                service.createTerritory(
                        administratorEmail,
                        franchiseId,
                        request
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<AdminFranchiseTerritoryResponse>> result =
                controller.createTerritory(
                        authentication,
                        franchiseId,
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
                service
        ).createTerritory(
                administratorEmail,
                franchiseId,
                request
        );
    }

    @Test
    void listTerritoriesUsesAuthenticatedAdministratorAndReturnsOkEnvelope() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        UUID franchiseId =
                UUID.randomUUID();

        Authentication authentication =
                authenticated(
                        administratorEmail
                );

        java.util.List<AdminFranchiseTerritoryResponse> serviceResponse =
                java.util.List.of(
                        mock(
                                AdminFranchiseTerritoryResponse.class
                        )
                );

        when(
                service.listTerritories(
                        administratorEmail,
                        franchiseId
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<java.util.List<AdminFranchiseTerritoryResponse>>> result =
                controller.listTerritories(
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
                service
        ).listTerritories(
                administratorEmail,
                franchiseId
        );
    }

    @Test
    void getTerritoryUsesAuthenticatedAdministratorAndReturnsOkEnvelope() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        UUID franchiseId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        Authentication authentication =
                authenticated(
                        administratorEmail
                );

        AdminFranchiseTerritoryResponse serviceResponse =
                mock(
                        AdminFranchiseTerritoryResponse.class
                );

        when(
                service.getTerritory(
                        administratorEmail,
                        franchiseId,
                        territoryId
                )
        ).thenReturn(
                serviceResponse
        );

        ResponseEntity<ApiResponse<AdminFranchiseTerritoryResponse>> result =
                controller.getTerritory(
                        authentication,
                        franchiseId,
                        territoryId
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
                service
        ).getTerritory(
                administratorEmail,
                franchiseId,
                territoryId
        );
    }

}
