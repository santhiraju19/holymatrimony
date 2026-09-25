package com.theholymatrimony.backend.secureconnect.topup.controller;

import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;

import com.theholymatrimony.backend.secureconnect.topup.dto.CreateSecureConnectTopUpRequest;
import com.theholymatrimony.backend.secureconnect.topup.dto.CreateSecureConnectTopUpResponse;
import com.theholymatrimony.backend.secureconnect.topup.dto.SecureConnectTopUpPackageResponse;
import com.theholymatrimony.backend.secureconnect.topup.dto.SecureConnectTopUpStatusResponse;
import com.theholymatrimony.backend.secureconnect.topup.service.SecureConnectTopUpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/v1/secure-connect/topups"
)
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
public class SecureConnectTopUpController {

    private final SecureConnectTopUpService
            secureConnectTopUpService;

    @GetMapping("/packages")
    public ResponseEntity<List<SecureConnectTopUpPackageResponse>>
    getPackages() {
        return ResponseEntity.ok(
                secureConnectTopUpService.getPackages()
        );
    }

    @GetMapping("/{topUpPaymentId}")
    public ResponseEntity<SecureConnectTopUpStatusResponse>
    getStatus(
            @PathVariable UUID topUpPaymentId,
            Authentication authentication
    ) {
        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        return ResponseEntity.ok(
                secureConnectTopUpService.getStatus(
                        topUpPaymentId,
                        authentication.getName()
                )
        );
    }

    @PostMapping("/create-order")
    public ResponseEntity<CreateSecureConnectTopUpResponse>
    createOrder(
            @Valid
            @RequestBody
            CreateSecureConnectTopUpRequest request,
            Authentication authentication
    ) throws Exception {

        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        CreateSecureConnectTopUpResponse response =
                secureConnectTopUpService
                        .createOrder(
                                request.getPackageCode(),
                                authentication.getName()
                        );

        return ResponseEntity.ok(
                response
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPayment(
            @RequestBody VerifyPaymentRequest request,
            Authentication authentication
    ) throws Exception {

        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        secureConnectTopUpService.verifyPayment(
                request,
                authentication.getName()
        );

        return ResponseEntity.ok().build();
    }

}
