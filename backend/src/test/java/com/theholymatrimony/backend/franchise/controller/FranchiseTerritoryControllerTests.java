package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
import com.theholymatrimony.backend.common.exception.GlobalExceptionHandler;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;
import com.theholymatrimony.backend.franchise.service.FranchiseTerritoryService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FranchiseTerritoryControllerTests {

    private FranchiseTerritoryService franchiseTerritoryService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        franchiseTerritoryService =
                mock(FranchiseTerritoryService.class);

        FranchiseTerritoryController controller =
                new FranchiseTerritoryController(
                        franchiseTerritoryService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                controller
                        )
                        .setControllerAdvice(
                                new GlobalExceptionHandler()
                        )
                        .build();
    }

    @Test
    void territoryListUsesAuthenticatedIdentityAndApiEnvelope()
            throws Exception {

        String email = "owner@example.com";

        UUID firstTerritoryId = UUID.randomUUID();
        UUID secondTerritoryId = UUID.randomUUID();

        List<FranchiseTerritoryResponse> response =
                List.of(
                        new FranchiseTerritoryResponse(
                                firstTerritoryId,
                                "GNT-CITY",
                                "Guntur City",
                                FranchiseTerritoryType.CITY,
                                "Guntur municipal limits"
                        ),
                        new FranchiseTerritoryResponse(
                                secondTerritoryId,
                                "GNT-PIN-01",
                                "Guntur PIN Cluster 01",
                                FranchiseTerritoryType.PIN_CLUSTER,
                                "Selected Guntur postal areas"
                        )
                );

        when(
                franchiseTerritoryService
                        .listActiveTerritories(
                                email
                        )
        ).thenReturn(
                response
        );

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/territories"
                        )
                                .principal(
                                        authentication
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        content()
                                .contentTypeCompatibleWith(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value("Success")
                )
                .andExpect(
                        jsonPath("$.data.length()")
                                .value(2)
                )
                .andExpect(
                        jsonPath("$.data[0].territoryId")
                                .value(
                                        firstTerritoryId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data[0].territoryCode")
                                .value("GNT-CITY")
                )
                .andExpect(
                        jsonPath("$.data[0].name")
                                .value("Guntur City")
                )
                .andExpect(
                        jsonPath("$.data[0].territoryType")
                                .value("CITY")
                )
                .andExpect(
                        jsonPath("$.data[0].coverageDescription")
                                .value(
                                        "Guntur municipal limits"
                                )
                )
                .andExpect(
                        jsonPath("$.data[1].territoryId")
                                .value(
                                        secondTerritoryId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data[1].territoryCode")
                                .value("GNT-PIN-01")
                )
                .andExpect(
                        jsonPath("$.data[1].territoryType")
                                .value("PIN_CLUSTER")
                );

        verify(
                franchiseTerritoryService
        ).listActiveTerritories(
                email
        );

        verifyNoMoreInteractions(
                franchiseTerritoryService
        );
    }

    @Test
    void emptyTerritoryListUsesSuccessfulEnvelope()
            throws Exception {

        String email = "manager@example.com";

        when(
                franchiseTerritoryService
                        .listActiveTerritories(
                                email
                        )
        ).thenReturn(
                List.of()
        );

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/territories"
                        )
                                .principal(
                                        authentication
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value("Success")
                )
                .andExpect(
                        jsonPath("$.data.length()")
                                .value(0)
                );

        verify(
                franchiseTerritoryService
        ).listActiveTerritories(
                email
        );

        verifyNoMoreInteractions(
                franchiseTerritoryService
        );
    }

    @Test
    void territoryUpdateUsesAuthenticatedIdentityAndApiEnvelope()
            throws Exception {

        String email = "owner@example.com";
        UUID territoryId = UUID.randomUUID();

        UpdateFranchiseTerritoryRequest request =
                new UpdateFranchiseTerritoryRequest(
                        "Guntur Urban",
                        "Updated municipal coverage"
                );

        FranchiseTerritoryResponse response =
                new FranchiseTerritoryResponse(
                        territoryId,
                        "GNT-CITY",
                        "Guntur Urban",
                        FranchiseTerritoryType.CITY,
                        "Updated municipal coverage"
                );

        when(
                franchiseTerritoryService.updateTerritory(
                        email,
                        territoryId,
                        request
                )
        ).thenReturn(
                response
        );

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        String body =
                """
                {
                  "name": "Guntur Urban",
                  "coverageDescription": "Updated municipal coverage"
                }
                """;

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/territories/{territoryId}",
                                territoryId
                        )
                                .principal(
                                        authentication
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        body
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        content()
                                .contentTypeCompatibleWith(
                                        MediaType.APPLICATION_JSON
                                )
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Territory updated successfully."
                                )
                )
                .andExpect(
                        jsonPath("$.data.territoryId")
                                .value(
                                        territoryId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data.territoryCode")
                                .value("GNT-CITY")
                )
                .andExpect(
                        jsonPath("$.data.name")
                                .value("Guntur Urban")
                )
                .andExpect(
                        jsonPath("$.data.territoryType")
                                .value("CITY")
                )
                .andExpect(
                        jsonPath("$.data.coverageDescription")
                                .value(
                                        "Updated municipal coverage"
                                )
                );

        verify(
                franchiseTerritoryService
        ).updateTerritory(
                email,
                territoryId,
                request
        );

        verifyNoMoreInteractions(
                franchiseTerritoryService
        );
    }

    @Test
    void blankTerritoryNameIsRejectedBeforeServiceInvocation()
            throws Exception {

        UUID territoryId = UUID.randomUUID();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "owner@example.com",
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        String body =
                """
                {
                  "name": "   ",
                  "coverageDescription": "Updated coverage"
                }
                """;

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/territories/{territoryId}",
                                territoryId
                        )
                                .principal(
                                        authentication
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        body
                                )
                )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(false)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Territory name is required."
                                )
                );

        verifyNoInteractions(
                franchiseTerritoryService
        );
    }

    @Test
    void oversizedTerritoryNameIsRejectedBeforeServiceInvocation()
            throws Exception {

        UUID territoryId = UUID.randomUUID();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "owner@example.com",
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        String oversizedName =
                "A".repeat(181);

        String body =
                """
                {
                  "name": "%s",
                  "coverageDescription": "Updated coverage"
                }
                """.formatted(
                        oversizedName
                );

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/territories/{territoryId}",
                                territoryId
                        )
                                .principal(
                                        authentication
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        body
                                )
                )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(false)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Territory name must not exceed 180 characters."
                                )
                );

        verifyNoInteractions(
                franchiseTerritoryService
        );
    }

    @Test
    void oversizedCoverageDescriptionIsRejectedBeforeServiceInvocation()
            throws Exception {

        UUID territoryId = UUID.randomUUID();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "owner@example.com",
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        String oversizedCoverage =
                "A".repeat(2001);

        String body =
                """
                {
                  "name": "Guntur City",
                  "coverageDescription": "%s"
                }
                """.formatted(
                        oversizedCoverage
                );

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/territories/{territoryId}",
                                territoryId
                        )
                                .principal(
                                        authentication
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        body
                                )
                )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(false)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Coverage description must not exceed 2000 characters."
                                )
                );

        verifyNoInteractions(
                franchiseTerritoryService
        );
    }

    @Test
    void malformedTerritoryIdIsRejectedBeforeServiceInvocation()
            throws Exception {

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        "owner@example.com",
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        String body =
                """
                {
                  "name": "Guntur City",
                  "coverageDescription": "Updated coverage"
                }
                """;

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/territories/not-a-uuid"
                        )
                                .principal(
                                        authentication
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .accept(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        body
                                )
                )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(false)
                );

        verifyNoInteractions(
                franchiseTerritoryService
        );
    }

}
