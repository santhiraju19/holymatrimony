package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchisePaymentResponse;
import com.theholymatrimony.backend.franchise.service.FranchisePaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only franchise-facing payment endpoint.
 *
 * Geographic authorization is enforced by the service using the
 * authenticated franchise user's active district allocation.
 */
@RestController
@RequestMapping("/api/v1/franchise/payments")
@RequiredArgsConstructor
public class FranchisePaymentController {

    private final FranchisePaymentService franchisePaymentService;

    @GetMapping
    public ApiResponse<List<FranchisePaymentResponse>> listPayments(
            Authentication authentication
    ) {

        List<FranchisePaymentResponse> payments =
                franchisePaymentService.listPayments(
                        authentication.getName()
                );

        return ApiResponse.success(
                payments
        );
    }
}
