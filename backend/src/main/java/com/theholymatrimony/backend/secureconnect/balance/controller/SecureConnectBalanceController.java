package com.theholymatrimony.backend.secureconnect.balance.controller;

import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectBalanceResponse;
import com.theholymatrimony.backend.secureconnect.balance.service.SecureConnectBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/v1/secure-connect"
)
@RequiredArgsConstructor
public class SecureConnectBalanceController {

    private final SecureConnectBalanceService
            secureConnectBalanceService;

    @GetMapping("/balance")
    public ResponseEntity<SecureConnectBalanceResponse>
    getBalance(
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
                secureConnectBalanceService.getBalance(
                        authentication.getName()
                )
        );
    }
}
