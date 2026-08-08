package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.dto.ProfileResponse;

import com.theholymatrimony.backend.profile.service.ProfileService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService
            profileService;

    /*
     * ---------------------------------------------------------
     * Current user's profile
     * ---------------------------------------------------------
     */

    @GetMapping
    public ApiResponse<ProfileResponse>
    getMyProfile(
            Authentication authentication
    ) {

        ProfileResponse response =
                profileService
                        .getMyProfile(
                                authentication.getName()
                        );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ---------------------------------------------------------
     * Save/update current user's profile
     * ---------------------------------------------------------
     */

    @PutMapping
    public ApiResponse<ProfileResponse>
    saveProfile(

            Authentication authentication,

            @Valid
            @RequestBody
            ProfileRequest request

    ) {

        ProfileResponse response =
                profileService
                        .saveProfile(
                                authentication.getName(),
                                request
                        );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ---------------------------------------------------------
     * Submit profile for administrator verification
     * ---------------------------------------------------------
     *
     * Allowed:
     *
     * NOT_SUBMITTED -> PENDING
     * REJECTED      -> PENDING
     *
     * Not allowed:
     *
     * PENDING
     * APPROVED
     */
    @PostMapping(
            "/verification/submit"
    )
    public ApiResponse<ProfileResponse>
    submitForVerification(
            Authentication authentication
    ) {

        ProfileResponse response =
                profileService
                        .submitForVerification(
                                authentication.getName()
                        );

        return ApiResponse.success(
                "Profile submitted for verification successfully.",
                response
        );
    }
}