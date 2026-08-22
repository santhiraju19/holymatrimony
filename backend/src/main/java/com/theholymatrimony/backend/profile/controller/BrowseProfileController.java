package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.profile.dto.BrowseProfileResponse;
import com.theholymatrimony.backend.profile.dto.BrowseProfilesPageResponse;
import com.theholymatrimony.backend.profile.dto.ProfileContactResponse;
import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;

import com.theholymatrimony.backend.profile.service.BrowseProfileService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
public class BrowseProfileController {

    private final BrowseProfileService
            browseProfileService;

    /*
     * ============================================================
     * BROWSE PROFILES
     * ============================================================
     */

    @GetMapping
    public ApiResponse<BrowseProfilesPageResponse>
    browseProfiles(
            Authentication authentication,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "12")
            int size
    ) {

        BrowseProfilesPageResponse response =
                browseProfileService
                        .browseProfiles(
                                authentication.getName(),
                                page,
                                size
                        );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * SEARCH PROFILES
     * ============================================================
     */

    @GetMapping("/search")
    public ApiResponse<BrowseProfilesPageResponse>
    searchProfiles(
            Authentication authentication,

            @ModelAttribute
            SearchProfileRequest request,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "12")
            int size
    ) {

        BrowseProfilesPageResponse response =
                browseProfileService
                        .searchProfiles(
                                authentication.getName(),
                                request,
                                page,
                                size
                        );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * GET PUBLIC PROFILE
     * ============================================================
     */

    @GetMapping(
            "/{profileId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}"
    )
    public ApiResponse<BrowseProfileResponse>
    getProfile(
            Authentication authentication,

            @PathVariable
            UUID profileId
    ) {

        BrowseProfileResponse response =
                browseProfileService
                        .getProfile(
                                authentication.getName(),
                                profileId
                        );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * GET PROTECTED PROFILE CONTACT DETAILS
     * ============================================================
     */

    @GetMapping(
            "/{profileId:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}/contact"
    )
    public ApiResponse<ProfileContactResponse>
    getProfileContact(
            Authentication authentication,

            @PathVariable
            UUID profileId
    ) {

        ProfileContactResponse response =
                browseProfileService
                        .getProfileContact(
                                authentication.getName(),
                                profileId
                        );

        return ApiResponse.success(
                response
        );
    }
}
