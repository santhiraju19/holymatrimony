package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.profile.dto.BrowseProfilesPageResponse;
import com.theholymatrimony.backend.profile.dto.CreateSavedSearchRequest;
import com.theholymatrimony.backend.profile.dto.SavedSearchResponse;
import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;
import com.theholymatrimony.backend.profile.dto.UpdateSavedSearchAlertsRequest;
import com.theholymatrimony.backend.profile.dto.UpdateSavedSearchRequest;
import com.theholymatrimony.backend.profile.service.BrowseProfileService;
import com.theholymatrimony.backend.profile.service.SavedSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/saved-searches")
@RequiredArgsConstructor
public class SavedSearchController {

    private final SavedSearchService
            savedSearchService;

    private final BrowseProfileService
            browseProfileService;

    /*
     * ============================================================
     * CREATE
     * ============================================================
     */

    @PostMapping
    public ApiResponse<SavedSearchResponse>
    create(
            Authentication authentication,

            @Valid
            @RequestBody
            CreateSavedSearchRequest request
    ) {

        SavedSearchResponse response =
                savedSearchService.create(
                        authentication.getName(),
                        request
                );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * LIST
     * ============================================================
     */

    @GetMapping
    public ApiResponse<List<SavedSearchResponse>>
    list(
            Authentication authentication
    ) {

        List<SavedSearchResponse> response =
                savedSearchService.list(
                        authentication.getName()
                );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * GET
     * ============================================================
     */

    @GetMapping("/{savedSearchId}")
    public ApiResponse<SavedSearchResponse>
    get(
            Authentication authentication,

            @PathVariable
            UUID savedSearchId
    ) {

        SavedSearchResponse response =
                savedSearchService.get(
                        authentication.getName(),
                        savedSearchId
                );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * UPDATE
     * ============================================================
     */

    @PutMapping("/{savedSearchId}")
    public ApiResponse<SavedSearchResponse>
    update(
            Authentication authentication,

            @PathVariable
            UUID savedSearchId,

            @Valid
            @RequestBody
            UpdateSavedSearchRequest request
    ) {

        SavedSearchResponse response =
                savedSearchService.update(
                        authentication.getName(),
                        savedSearchId,
                        request
                );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * DELETE
     * ============================================================
     */

    @DeleteMapping("/{savedSearchId}")
    public ApiResponse<Boolean>
    delete(
            Authentication authentication,

            @PathVariable
            UUID savedSearchId
    ) {

        savedSearchService.delete(
                authentication.getName(),
                savedSearchId
        );

        return ApiResponse.success(
                true
        );
    }

    /*
     * ============================================================
     * SET DEFAULT
     * ============================================================
     */

    @PutMapping("/{savedSearchId}/default")
    public ApiResponse<SavedSearchResponse>
    setDefault(
            Authentication authentication,

            @PathVariable
            UUID savedSearchId
    ) {

        SavedSearchResponse response =
                savedSearchService.setDefault(
                        authentication.getName(),
                        savedSearchId
                );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * ALERT SETTINGS
     * ============================================================
     */

    @PutMapping("/{savedSearchId}/alerts")
    public ApiResponse<SavedSearchResponse>
    updateAlerts(
            Authentication authentication,

            @PathVariable
            UUID savedSearchId,

            @Valid
            @RequestBody
            UpdateSavedSearchAlertsRequest request
    ) {

        SavedSearchResponse response =
                savedSearchService.updateAlerts(
                        authentication.getName(),
                        savedSearchId,
                        request
                );

        return ApiResponse.success(
                response
        );
    }

    /*
     * ============================================================
     * RUN SAVED SEARCH
     * ============================================================
     *
     * Reuses the existing BrowseProfileService search pipeline.
     * SavedSearch does not implement a second matching engine.
     * ============================================================
     */

    @GetMapping("/{savedSearchId}/results")
    public ApiResponse<BrowseProfilesPageResponse>
    results(
            Authentication authentication,

            @PathVariable
            UUID savedSearchId,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "12"
            )
            int size
    ) {

        String email =
                authentication.getName();

        SearchProfileRequest request =
                savedSearchService
                        .getSearchRequest(
                                email,
                                savedSearchId
                        );

        BrowseProfilesPageResponse response =
                browseProfileService
                        .searchProfiles(
                                email,
                                request,
                                page,
                                size
                        );

        return ApiResponse.success(
                response
        );
    }
}