package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.profile.dto.ProfileBoostResponse;
import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.dto.ProfileResponse;

import com.theholymatrimony.backend.profile.service.ProfileBoostService;
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

    private final ProfileBoostService
            profileBoostService;

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
     * Profile Boost Status
     * ---------------------------------------------------------
     */

    @GetMapping("/boost")
    public ApiResponse<ProfileBoostResponse>
    getProfileBoostStatus(
            Authentication authentication
    ) {

        ProfileBoostResponse response =
                profileBoostService
                        .getStatus(
                                authentication.getName()
                        );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ---------------------------------------------------------
     * Activate Profile Boost
     * ---------------------------------------------------------
     */

    @PostMapping("/boost")
    public ApiResponse<ProfileBoostResponse>
    activateProfileBoost(
            Authentication authentication
    ) {

        ProfileBoostResponse response =
                profileBoostService
                        .activate(
                                authentication.getName()
                        );

        return ApiResponse.success(
                "Profile boost activated successfully.",
                response
        );
    }
}
