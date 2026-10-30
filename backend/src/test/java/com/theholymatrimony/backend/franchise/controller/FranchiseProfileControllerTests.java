package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.franchise.dto.FranchiseAccessResponse;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import com.theholymatrimony.backend.franchise.service.FranchiseProfileService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.EnumSet;
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

class FranchiseProfileControllerTests {

    private FranchiseProfileService franchiseProfileService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        franchiseProfileService =
                mock(FranchiseProfileService.class);

        FranchiseProfileController controller =
                new FranchiseProfileController(
                        franchiseProfileService
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(
                                controller
                        )
                        .build();
    }

    @Test
    void currentFranchiseAccessUsesAuthenticatedIdentityAndEnvelope()
            throws Exception {

        String email = "owner@example.com";

        UUID userId = UUID.randomUUID();
        UUID franchiseUserId = UUID.randomUUID();
        UUID franchiseId = UUID.randomUUID();
        UUID stateId = UUID.randomUUID();
        UUID districtId = UUID.randomUUID();

        FranchiseAccessResponse response =
                new FranchiseAccessResponse(
                        userId,
                        "District Owner",
                        email,

                        franchiseUserId,
                        FranchiseStaffRole.FRANCHISE_OWNER,

                        franchiseId,
                        "HM-GNT-001",
                        "Holy Matrimony Guntur",
                        FranchiseStatus.ACTIVE,

                        stateId,
                        28,
                        "Andhra Pradesh",

                        districtId,
                        506,
                        "Guntur",

                        EnumSet.of(
                                FranchisePermission.DASHBOARD_VIEW,
                                FranchisePermission.MEMBERS_VIEW,
                                FranchisePermission.REPORTS_VIEW
                        )
                );

        when(
                franchiseProfileService
                        .getCurrentFranchiseAccess(
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
                                "/api/v1/franchise/me"
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
                        jsonPath("$.data.userId")
                                .value(userId.toString())
                )
                .andExpect(
                        jsonPath("$.data.fullName")
                                .value("District Owner")
                )
                .andExpect(
                        jsonPath("$.data.email")
                                .value(email)
                )
                .andExpect(
                        jsonPath("$.data.franchiseUserId")
                                .value(
                                        franchiseUserId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data.staffRole")
                                .value("FRANCHISE_OWNER")
                )
                .andExpect(
                        jsonPath("$.data.franchiseId")
                                .value(franchiseId.toString())
                )
                .andExpect(
                        jsonPath("$.data.franchiseCode")
                                .value("HM-GNT-001")
                )
                .andExpect(
                        jsonPath("$.data.franchiseName")
                                .value("Holy Matrimony Guntur")
                )
                .andExpect(
                        jsonPath("$.data.franchiseStatus")
                                .value("ACTIVE")
                )
                .andExpect(
                        jsonPath("$.data.stateId")
                                .value(stateId.toString())
                )
                .andExpect(
                        jsonPath("$.data.stateLgdCode")
                                .value(28)
                )
                .andExpect(
                        jsonPath("$.data.stateName")
                                .value("Andhra Pradesh")
                )
                .andExpect(
                        jsonPath("$.data.districtId")
                                .value(districtId.toString())
                )
                .andExpect(
                        jsonPath("$.data.districtLgdCode")
                                .value(506)
                )
                .andExpect(
                        jsonPath("$.data.districtName")
                                .value("Guntur")
                )
                .andExpect(
                        jsonPath("$.data.permissions.length()")
                                .value(3)
                )
                .andExpect(
                        jsonPath(
                                "$.data.permissions[?(@ == 'DASHBOARD_VIEW')]"
                        ).exists()
                )
                .andExpect(
                        jsonPath(
                                "$.data.permissions[?(@ == 'MEMBERS_VIEW')]"
                        ).exists()
                )
                .andExpect(
                        jsonPath(
                                "$.data.permissions[?(@ == 'REPORTS_VIEW')]"
                        ).exists()
                );

        verify(
                franchiseProfileService
        ).getCurrentFranchiseAccess(
                email
        );

        verifyNoMoreInteractions(
                franchiseProfileService
        );
    }

    @Test
    void authenticatedPrincipalNameIsTheOnlyIdentityPassedToService()
            throws Exception {

        String authenticatedEmail =
                "manager@example.com";

        FranchiseAccessResponse response =
                new FranchiseAccessResponse(
                        UUID.randomUUID(),
                        "Franchise Manager",
                        authenticatedEmail,

                        UUID.randomUUID(),
                        FranchiseStaffRole.FRANCHISE_MANAGER,

                        UUID.randomUUID(),
                        "HM-KRI-001",
                        "Holy Matrimony Krishna",
                        FranchiseStatus.ACTIVE,

                        UUID.randomUUID(),
                        28,
                        "Andhra Pradesh",

                        UUID.randomUUID(),
                        510,
                        "Krishna",

                        EnumSet.of(
                                FranchisePermission.DASHBOARD_VIEW
                        )
                );

        when(
                franchiseProfileService
                        .getCurrentFranchiseAccess(
                                authenticatedEmail
                        )
        ).thenReturn(
                response
        );

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        authenticatedEmail,
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_FRANCHISE"
                                )
                        )
                );

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/me"
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
                        jsonPath("$.data.email")
                                .value(authenticatedEmail)
                )
                .andExpect(
                        jsonPath("$.data.districtName")
                                .value("Krishna")
                );

        verify(
                franchiseProfileService
        ).getCurrentFranchiseAccess(
                authenticatedEmail
        );

        verifyNoMoreInteractions(
                franchiseProfileService
        );
    }
}
