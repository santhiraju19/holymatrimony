package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.profile.dto.RecommendedMatchResponse;

import com.theholymatrimony.backend.profile.service.RecommendedMatchService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendedMatchController {

    private final RecommendedMatchService
            recommendedMatchService;

    /*
     * ============================================================
     * DASHBOARD RECOMMENDED MATCHES
     * ============================================================
     */

    @GetMapping
    public ApiResponse<List<RecommendedMatchResponse>>
    getRecommendedMatches(
            Authentication authentication,

            @RequestParam(defaultValue = "6")
            int limit
    ) {

        List<RecommendedMatchResponse> response =
                recommendedMatchService
                        .getRecommendedMatches(
                                authentication.getName(),
                                limit
                        );

        return ApiResponse.success(
                response
        );
    }
}
