
package com.theholymatrimony.backend.interest.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.interest.dto.InterestCountResponse;
import com.theholymatrimony.backend.interest.dto.InterestPageResponse;
import com.theholymatrimony.backend.interest.dto.InterestResponse;
import com.theholymatrimony.backend.interest.dto.SendInterestRequest;
import com.theholymatrimony.backend.interest.enums.InterestStatus;
import com.theholymatrimony.backend.interest.service.InterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interests")
@RequiredArgsConstructor
public class InterestController {

    private static final int DEFAULT_PAGE_SIZE = 12;
    private static final int MAX_PAGE_SIZE = 100;

    private final InterestService interestService;

    /*
     * ============================================================
     * Send interest
     * POST /api/v1/interests
     * ============================================================
     */

    @PostMapping
    public ResponseEntity<ApiResponse<InterestResponse>> sendInterest(
            Authentication authentication,
            @Valid @RequestBody SendInterestRequest request
    ) {

        InterestResponse response =
                interestService.sendInterest(
                        getAuthenticatedEmail(authentication),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Interest sent successfully",
                                response
                        )
                );
    }

    /*
     * ============================================================
     * Get sent interests
     * GET /api/v1/interests/sent
     * ============================================================
     */

    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<InterestPageResponse>>
    getSentInterests(
            Authentication authentication,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "12"
            )
            int size,

            @RequestParam(
                    required = false
            )
            InterestStatus status
    ) {

        Pageable pageable =
                createPageable(page, size);

        InterestPageResponse response =
                interestService.getSentInterests(
                        getAuthenticatedEmail(authentication),
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    /*
     * ============================================================
     * Get received interests
     * GET /api/v1/interests/received
     * ============================================================
     */

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<InterestPageResponse>>
    getReceivedInterests(
            Authentication authentication,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "12"
            )
            int size,

            @RequestParam(
                    required = false
            )
            InterestStatus status
    ) {

        Pageable pageable =
                createPageable(page, size);

        InterestPageResponse response =
                interestService.getReceivedInterests(
                        getAuthenticatedEmail(authentication),
                        status,
                        pageable
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    /*
     * ============================================================
     * Accept interest
     * POST /api/v1/interests/{interestId}/accept
     * ============================================================
     */

    @PostMapping("/{interestId}/accept")
    public ResponseEntity<ApiResponse<InterestResponse>>
    acceptInterest(
            Authentication authentication,
            @PathVariable UUID interestId
    ) {

        InterestResponse response =
                interestService.acceptInterest(
                        getAuthenticatedEmail(authentication),
                        interestId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interest accepted successfully",
                        response
                )
        );
    }

    /*
     * ============================================================
     * Decline interest
     * POST /api/v1/interests/{interestId}/decline
     * ============================================================
     */

    @PostMapping("/{interestId}/decline")
    public ResponseEntity<ApiResponse<InterestResponse>>
    declineInterest(
            Authentication authentication,
            @PathVariable UUID interestId
    ) {

        InterestResponse response =
                interestService.declineInterest(
                        getAuthenticatedEmail(authentication),
                        interestId
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interest declined successfully",
                        response
                )
        );
    }

    /*
     * ============================================================
     * Withdraw interest
     * DELETE /api/v1/interests/{interestId}
     * ============================================================
     */

    @DeleteMapping("/{interestId}")
    public ResponseEntity<ApiResponse<Void>>
    withdrawInterest(
            Authentication authentication,
            @PathVariable UUID interestId
    ) {

        interestService.withdrawInterest(
                getAuthenticatedEmail(authentication),
                interestId
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Interest withdrawn successfully",
                        null
                )
        );
    }

    /*
     * ============================================================
     * Pending received-interest count
     * GET /api/v1/interests/pending-count
     * ============================================================
     */

    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<InterestCountResponse>>
    getPendingReceivedCount(
            Authentication authentication
    ) {

        InterestCountResponse response =
                interestService.getPendingReceivedCount(
                        getAuthenticatedEmail(authentication)
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    /*
     * ============================================================
     * Authentication helper
     * ============================================================
     */

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication.getName();
    }

    /*
     * ============================================================
     * Pagination helper
     * ============================================================
     */

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
                        : Math.min(size, MAX_PAGE_SIZE);

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