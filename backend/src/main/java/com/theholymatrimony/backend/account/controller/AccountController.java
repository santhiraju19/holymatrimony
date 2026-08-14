package com.theholymatrimony.backend.account.controller;

import com.theholymatrimony.backend.account.dto.AccountActionResponse;
import com.theholymatrimony.backend.account.dto.AccountResponse;
import com.theholymatrimony.backend.account.dto.ChangePasswordRequest;
import com.theholymatrimony.backend.account.dto.UpdateAccountRequest;
import com.theholymatrimony.backend.account.service.AccountService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    public ResponseEntity<AccountResponse> getAccount(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                accountService.getAccount(
                        authentication.getName()
                )
        );
    }

    @PutMapping
    public ResponseEntity<AccountResponse> updateAccount(
            Authentication authentication,

            @Valid
            @RequestBody
            UpdateAccountRequest request
    ) {
        return ResponseEntity.ok(
                accountService.updateAccount(
                        authentication.getName(),
                        request
                )
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<AccountActionResponse>
    changePassword(
            Authentication authentication,

            @Valid
            @RequestBody
            ChangePasswordRequest request,

            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(
                accountService.changePassword(
                        authentication.getName(),
                        request,
                        getClientIp(httpRequest)
                )
        );
    }

    @PostMapping("/logout-all")
    public ResponseEntity<AccountActionResponse>
    logoutAll(
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(
                accountService.logoutAll(
                        authentication.getName(),
                        getClientIp(httpRequest)
                )
        );
    }

    private String getClientIp(
            HttpServletRequest request
    ) {
        String forwardedFor =
                request.getHeader(
                        "X-Forwarded-For"
                );

        if (
                forwardedFor != null &&
                !forwardedFor.isBlank()
        ) {
            return forwardedFor
                    .split(",")[0]
                    .trim();
        }

        String realIp =
                request.getHeader(
                        "X-Real-IP"
                );

        if (
                realIp != null &&
                !realIp.isBlank()
        ) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
