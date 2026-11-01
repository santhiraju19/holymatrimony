package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.exception.GlobalExceptionHandler;
import com.theholymatrimony.backend.franchise.dto.CreateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.dto.FranchiseLeadResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.enums.LeadSource;
import com.theholymatrimony.backend.franchise.enums.LeadStatus;
import com.theholymatrimony.backend.franchise.service.FranchiseLeadService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.MediaType;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FranchiseLeadControllerTests {

    private FranchiseLeadService franchiseLeadService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        franchiseLeadService =
                mock(FranchiseLeadService.class);

        FranchiseLeadController controller =
                new FranchiseLeadController(
                        franchiseLeadService
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
    void leadListUsesAuthenticatedIdentityAndApiEnvelope()
            throws Exception {

        String email =
                "owner@example.com";

        UUID leadId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        FranchiseLeadResponse lead =
                new FranchiseLeadResponse(
                        leadId,
                        "Grace Thomas",
                        "9876543210",
                        "grace@example.com",
                        LeadSource.REFERRAL,
                        LeadStatus.NEW,
                        "Follow up tomorrow",
                        territoryId,
                        "Guntur City",
                        LocalDateTime.of(
                                2026,
                                11,
                                1,
                                10,
                                0
                        ),
                        LocalDateTime.of(
                                2026,
                                11,
                                1,
                                10,
                                0
                        )
                );

        when(
                franchiseLeadService.listLeads(
                        email
                )
        ).thenReturn(
                List.of(
                        lead
                )
        );

        Authentication authentication =
                franchiseAuthentication(
                        email
                );

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/leads"
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
                                .value(1)
                )
                .andExpect(
                        jsonPath("$.data[0].id")
                                .value(
                                        leadId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data[0].fullName")
                                .value(
                                        "Grace Thomas"
                                )
                )
                .andExpect(
                        jsonPath("$.data[0].source")
                                .value(
                                        "REFERRAL"
                                )
                )
                .andExpect(
                        jsonPath("$.data[0].status")
                                .value(
                                        "NEW"
                                )
                )
                .andExpect(
                        jsonPath("$.data[0].territoryId")
                                .value(
                                        territoryId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data[0].territoryName")
                                .value(
                                        "Guntur City"
                                )
                );

        verify(
                franchiseLeadService
        ).listLeads(
                email
        );

        verifyNoMoreInteractions(
                franchiseLeadService
        );
    }

    @Test
    void emptyLeadListUsesSuccessfulEnvelope()
            throws Exception {

        String email =
                "manager@example.com";

        when(
                franchiseLeadService.listLeads(
                        email
                )
        ).thenReturn(
                List.of()
        );

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/leads"
                        )
                                .principal(
                                        franchiseAuthentication(
                                                email
                                        )
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
                franchiseLeadService
        ).listLeads(
                email
        );

        verifyNoMoreInteractions(
                franchiseLeadService
        );
    }

    @Test
    void leadCreateUsesAuthenticatedIdentityAndApiEnvelope()
            throws Exception {

        String email =
                "owner@example.com";

        UUID leadId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        FranchiseLeadResponse response =
                new FranchiseLeadResponse(
                        leadId,
                        "John Peter",
                        "9876543210",
                        "john@example.com",
                        LeadSource.WALK_IN,
                        LeadStatus.NEW,
                        "Walk-in lead",
                        territoryId,
                        "Guntur City",
                        LocalDateTime.of(
                                2026,
                                11,
                                1,
                                11,
                                0
                        ),
                        LocalDateTime.of(
                                2026,
                                11,
                                1,
                                11,
                                0
                        )
                );

        when(
                franchiseLeadService.createLead(
                        eq(email),
                        any(CreateFranchiseLeadRequest.class)
                )
        ).thenReturn(
                response
        );

        String body =
                """
                {
                  "fullName": "John Peter",
                  "mobile": "9876543210",
                  "email": "john@example.com",
                  "source": "WALK_IN",
                  "notes": "Walk-in lead",
                  "territoryId": "%s"
                }
                """.formatted(
                        territoryId
                );

        mockMvc.perform(
                        post(
                                "/api/v1/franchise/leads"
                        )
                                .principal(
                                        franchiseAuthentication(
                                                email
                                        )
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
                        jsonPath("$.success")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Lead created successfully."
                                )
                )
                .andExpect(
                        jsonPath("$.data.id")
                                .value(
                                        leadId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data.fullName")
                                .value(
                                        "John Peter"
                                )
                )
                .andExpect(
                        jsonPath("$.data.source")
                                .value(
                                        "WALK_IN"
                                )
                )
                .andExpect(
                        jsonPath("$.data.status")
                                .value(
                                        "NEW"
                                )
                )
                .andExpect(
                        jsonPath("$.data.territoryId")
                                .value(
                                        territoryId.toString()
                                )
                );

        verify(
                franchiseLeadService
        ).createLead(
                eq(email),
                any(CreateFranchiseLeadRequest.class)
        );

        verifyNoMoreInteractions(
                franchiseLeadService
        );
    }

    @Test
    void leadUpdateUsesAuthenticatedIdentityAndApiEnvelope()
            throws Exception {

        String email =
                "owner@example.com";

        UUID leadId =
                UUID.randomUUID();

        FranchiseLeadResponse response =
                new FranchiseLeadResponse(
                        leadId,
                        "Updated Lead",
                        "9999999999",
                        "updated@example.com",
                        LeadSource.WHATSAPP,
                        LeadStatus.QUALIFIED,
                        "Qualified lead",
                        null,
                        null,
                        LocalDateTime.of(
                                2026,
                                11,
                                1,
                                11,
                                0
                        ),
                        LocalDateTime.of(
                                2026,
                                11,
                                1,
                                12,
                                0
                        )
                );

        when(
                franchiseLeadService.updateLead(
                        eq(email),
                        eq(leadId),
                        any(UpdateFranchiseLeadRequest.class)
                )
        ).thenReturn(
                response
        );

        String body =
                """
                {
                  "fullName": "Updated Lead",
                  "mobile": "9999999999",
                  "email": "updated@example.com",
                  "source": "WHATSAPP",
                  "status": "QUALIFIED",
                  "notes": "Qualified lead",
                  "territoryId": null
                }
                """;

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/leads/{leadId}",
                                leadId
                        )
                                .principal(
                                        franchiseAuthentication(
                                                email
                                        )
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
                        jsonPath("$.success")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Lead updated successfully."
                                )
                )
                .andExpect(
                        jsonPath("$.data.id")
                                .value(
                                        leadId.toString()
                                )
                )
                .andExpect(
                        jsonPath("$.data.fullName")
                                .value(
                                        "Updated Lead"
                                )
                )
                .andExpect(
                        jsonPath("$.data.source")
                                .value(
                                        "WHATSAPP"
                                )
                )
                .andExpect(
                        jsonPath("$.data.status")
                                .value(
                                        "QUALIFIED"
                                )
                );

        verify(
                franchiseLeadService
        ).updateLead(
                eq(email),
                eq(leadId),
                any(UpdateFranchiseLeadRequest.class)
        );

        verifyNoMoreInteractions(
                franchiseLeadService
        );
    }

    @Test
    void blankCreateNameIsRejectedBeforeServiceInvocation()
            throws Exception {

        String body =
                """
                {
                  "fullName": "   ",
                  "mobile": "9876543210",
                  "email": "lead@example.com",
                  "source": "PHONE"
                }
                """;

        mockMvc.perform(
                        post(
                                "/api/v1/franchise/leads"
                        )
                                .principal(
                                        franchiseAuthentication(
                                                "owner@example.com"
                                        )
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
                franchiseLeadService
        );
    }

    @Test
    void missingCreateSourceIsRejectedBeforeServiceInvocation()
            throws Exception {

        String body =
                """
                {
                  "fullName": "Lead One",
                  "mobile": "9876543210",
                  "email": "lead@example.com"
                }
                """;

        mockMvc.perform(
                        post(
                                "/api/v1/franchise/leads"
                        )
                                .principal(
                                        franchiseAuthentication(
                                                "owner@example.com"
                                        )
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
                franchiseLeadService
        );
    }

    @Test
    void missingUpdateStatusIsRejectedBeforeServiceInvocation()
            throws Exception {

        UUID leadId =
                UUID.randomUUID();

        String body =
                """
                {
                  "fullName": "Lead One",
                  "mobile": "9876543210",
                  "email": "lead@example.com",
                  "source": "PHONE"
                }
                """;

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/leads/{leadId}",
                                leadId
                        )
                                .principal(
                                        franchiseAuthentication(
                                                "owner@example.com"
                                        )
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
                franchiseLeadService
        );
    }

    @Test
    void malformedLeadIdIsRejectedBeforeServiceInvocation()
            throws Exception {

        String body =
                """
                {
                  "fullName": "Lead One",
                  "mobile": "9876543210",
                  "email": "lead@example.com",
                  "source": "PHONE",
                  "status": "CONTACTED"
                }
                """;

        mockMvc.perform(
                        patch(
                                "/api/v1/franchise/leads/not-a-uuid"
                        )
                                .principal(
                                        franchiseAuthentication(
                                                "owner@example.com"
                                        )
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
                franchiseLeadService
        );
    }

    private Authentication franchiseAuthentication(
            String email
    ) {

        return new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_FRANCHISE"
                        )
                )
        );
    }
}
