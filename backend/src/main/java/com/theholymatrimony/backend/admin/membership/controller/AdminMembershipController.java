package com.theholymatrimony.backend.admin.membership.controller;

import com.theholymatrimony.backend.admin.membership.dto.AdminMembershipPageResponse;
import com.theholymatrimony.backend.admin.membership.dto.AdminMembershipResponse;
import com.theholymatrimony.backend.admin.membership.service.AdminMembershipService;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(
        "/api/v1/admin/memberships"
)
@RequiredArgsConstructor
public class AdminMembershipController {

    private final AdminMembershipService
            adminMembershipService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<AdminMembershipPageResponse>
            >
    getMemberships(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size,

            @RequestParam(
                    required = false
            )
            String search,

            @RequestParam(
                    required = false
            )
            MembershipStatus status,

            @RequestParam(
                    required = false
            )
            MembershipPlan plan

    ) {

        AdminMembershipPageResponse response =
                adminMembershipService
                        .getMemberships(
                                page,
                                size,
                                search,
                                status,
                                plan
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @GetMapping("/{membershipId}")
    public ResponseEntity<
            ApiResponse<AdminMembershipResponse>
            >
    getMembership(

            @PathVariable
            UUID membershipId

    ) {

        AdminMembershipResponse response =
                adminMembershipService
                        .getMembership(
                                membershipId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }
}