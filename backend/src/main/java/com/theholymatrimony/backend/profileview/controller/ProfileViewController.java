package com.theholymatrimony.backend.profileview.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.profileview.dto.ProfileViewersPageResponse;
import com.theholymatrimony.backend.profileview.service.ProfileViewService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile-views")
@RequiredArgsConstructor
public class ProfileViewController {

    private final ProfileViewService
            profileViewService;

    @GetMapping("/who-viewed-me")
    public ApiResponse<ProfileViewersPageResponse>
    getWhoViewedMe(
            Authentication authentication,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {

        ProfileViewersPageResponse response =
                profileViewService
                        .getWhoViewedMe(
                                authentication.getName(),
                                page,
                                size
                        );

        return ApiResponse.success(
                response
        );
    }
}
