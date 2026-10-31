package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.franchise.dto.FranchiseTerritoryResponse;
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
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

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
}
