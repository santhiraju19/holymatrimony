
package com.theholymatrimony.backend.privacy.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.privacy.dto.PrivacySettingsResponse;
import com.theholymatrimony.backend.privacy.dto.UpdatePrivacySettingsRequest;
import com.theholymatrimony.backend.privacy.service.PrivacySettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/privacy")
@RequiredArgsConstructor
public class PrivacySettingsController {

    private final PrivacySettingsService
            privacySettingsService;

    @GetMapping("/me")
    public ResponseEntity<
            ApiResponse<PrivacySettingsResponse>
            > getMyPrivacySettings(
            Authentication authentication
    ) {
        PrivacySettingsResponse response =
                privacySettingsService
                        .getMySettings(
                                getAuthenticatedEmail(
                                        authentication
                                )
                        );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @PutMapping("/me")
    public ResponseEntity<
            ApiResponse<PrivacySettingsResponse>
            > updateMyPrivacySettings(
            Authentication authentication,

            @RequestBody
            UpdatePrivacySettingsRequest request
    ) {
        PrivacySettingsResponse response =
                privacySettingsService
                        .updateMySettings(
                                getAuthenticatedEmail(
                                        authentication
                                ),
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Privacy settings updated successfully",
                        response
                )
        );
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                !StringUtils.hasText(
                        authentication.getName()
                )
        ) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication
                .getName()
                .trim();
    }
}