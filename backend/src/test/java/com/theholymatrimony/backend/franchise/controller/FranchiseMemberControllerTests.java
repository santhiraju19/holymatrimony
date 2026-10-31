package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchiseMemberResponse;
import com.theholymatrimony.backend.franchise.service.FranchiseMemberService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FranchiseMemberControllerTests {

    private FranchiseMemberService franchiseMemberService;

    private Authentication authentication;

    private FranchiseMemberController controller;

    @BeforeEach
    void setUp() {

        franchiseMemberService =
                mock(FranchiseMemberService.class);

        authentication =
                mock(Authentication.class);

        controller =
                new FranchiseMemberController(
                        franchiseMemberService
                );
    }

    @Test
    void listMembersUsesAuthenticatedEmailAndWrapsResponse() {

        String email =
                "franchise@example.com";

        FranchiseMemberResponse member =
                new FranchiseMemberResponse(
                        UUID.randomUUID(),
                        "HM-000011",
                        "Member One",
                        "member@example.com",
                        LocalDate.of(
                                1990,
                                5,
                                10
                        ),
                        "MALE",
                        "Catholic",
                        "Member Church",
                        "Kakinada",
                        "Kakinada",
                        "Andhra Pradesh",
                        "India",
                        true,
                        true
                );

        List<FranchiseMemberResponse> members =
                List.of(
                        member
                );

        when(
                authentication.getName()
        ).thenReturn(
                email
        );

        when(
                franchiseMemberService.listMembers(
                        email
                )
        ).thenReturn(
                members
        );

        ApiResponse<List<FranchiseMemberResponse>> response =
                controller.listMembers(
                        authentication
                );

        verify(
                authentication
        ).getName();

        verify(
                franchiseMemberService
        ).listMembers(
                email
        );

        assertEquals(
                members,
                response.getData()
        );

        assertEquals(
                1,
                response.getData().size()
        );

        assertEquals(
                "HM-000011",
                response.getData()
                        .get(0)
                        .memberId()
        );
    }

    @Test
    void listMembersWrapsEmptyServiceResult() {

        String email =
                "franchise@example.com";

        when(
                authentication.getName()
        ).thenReturn(
                email
        );

        when(
                franchiseMemberService.listMembers(
                        email
                )
        ).thenReturn(
                List.of()
        );

        ApiResponse<List<FranchiseMemberResponse>> response =
                controller.listMembers(
                        authentication
                );

        verify(
                franchiseMemberService
        ).listMembers(
                email
        );

        assertEquals(
                0,
                response.getData().size()
        );
    }
}
