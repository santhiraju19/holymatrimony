package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.profile.dto.PublicFeaturedProfileResponse;
import com.theholymatrimony.backend.profile.service.PublicFeaturedProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(
        "/api/v1/public/featured-profiles"
)
@RequiredArgsConstructor
public class PublicFeaturedProfileController {

    private final PublicFeaturedProfileService
            publicFeaturedProfileService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<
                    List<PublicFeaturedProfileResponse>
            >
    > getFeaturedProfiles() {

        List<PublicFeaturedProfileResponse> profiles =
                publicFeaturedProfileService
                        .getFeaturedProfiles();

        return ResponseEntity.ok(
                ApiResponse.success(profiles)
        );
    }
}
