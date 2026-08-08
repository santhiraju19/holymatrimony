package com.theholymatrimony.backend.shortlist.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistCountResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistPageResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistStatusResponse;
import com.theholymatrimony.backend.shortlist.service.ShortlistService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shortlists")
@RequiredArgsConstructor
public class ShortlistController {

    private static final int DEFAULT_PAGE_SIZE = 12;
    private static final int MAX_PAGE_SIZE = 100;

    private final ShortlistService shortlistService;

    @PostMapping("/{profileId}")
    public ResponseEntity<
            ApiResponse<ShortlistResponse>
            > addToShortlist(
            Authentication authentication,
            @PathVariable UUID profileId
    ) {
        ShortlistResponse response =
                shortlistService.addToShortlist(
                        getAuthenticatedEmail(
                                authentication
                        ),
                        profileId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Profile shortlisted successfully",
                                response
                        )
                );
    }

    @DeleteMapping("/{profileId}")
    public ResponseEntity<ApiResponse<Void>>
    removeFromShortlist(
            Authentication authentication,
            @PathVariable UUID profileId
    ) {
        shortlistService.removeFromShortlist(
                getAuthenticatedEmail(
                        authentication
                ),
                profileId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile removed from shortlist",
                        null
                )
        );
    }

    @GetMapping("/{profileId}/status")
    public ResponseEntity<
            ApiResponse<ShortlistStatusResponse>
            > getShortlistStatus(
            Authentication authentication,
            @PathVariable UUID profileId
    ) {
        ShortlistStatusResponse response =
                shortlistService.getStatus(
                        getAuthenticatedEmail(
                                authentication
                        ),
                        profileId
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<ShortlistPageResponse>
            > getShortlists(
            Authentication authentication,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "12"
            )
            int size
    ) {
        Pageable pageable =
                createPageable(
                        page,
                        size
                );

        ShortlistPageResponse response =
                shortlistService.getShortlists(
                        getAuthenticatedEmail(
                                authentication
                        ),
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @GetMapping("/count")
    public ResponseEntity<
            ApiResponse<ShortlistCountResponse>
            > getShortlistCount(
            Authentication authentication
    ) {
        ShortlistCountResponse response =
                shortlistService.getCount(
                        getAuthenticatedEmail(
                                authentication
                        )
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication.getName();
    }

    private Pageable createPageable(
            int page,
            int size
    ) {
        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        int validatedSize =
                size <= 0
                        ? DEFAULT_PAGE_SIZE
                        : Math.min(
                                size,
                                MAX_PAGE_SIZE
                        );

        return PageRequest.of(
                page,
                validatedSize,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );
    }
}