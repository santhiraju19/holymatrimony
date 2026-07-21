package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.profile.dto.ProfileRequest;
import com.theholymatrimony.backend.profile.dto.ProfileResponse;
import com.theholymatrimony.backend.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ApiResponse<ProfileResponse> getMyProfile(Authentication authentication) {

        System.out.println("===== PROFILE REQUEST =====");
        System.out.println("Authentication: " + authentication);

        try {
            ProfileResponse response =
                    profileService.getMyProfile(authentication.getName());

            return ApiResponse.success(response);

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping
    public ApiResponse<ProfileResponse> saveProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request) {

        return ApiResponse.success(
                profileService.saveProfile(authentication.getName(), request)
        );
    }
}