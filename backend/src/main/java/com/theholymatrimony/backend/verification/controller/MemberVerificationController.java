package com.theholymatrimony.backend.verification.controller;

import com.theholymatrimony.backend.verification.dto.SubmitVerificationRequest;
import com.theholymatrimony.backend.verification.dto.TrustVerificationResponse;
import com.theholymatrimony.backend.verification.enums.VerificationType;
import com.theholymatrimony.backend.verification.service.MemberVerificationService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
        "/api/v1/verifications"
)
@RequiredArgsConstructor
public class MemberVerificationController {

    private final MemberVerificationService
            memberVerificationService;

    @GetMapping
    public ResponseEntity<
            TrustVerificationResponse
            >
    getVerificationCenter(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                memberVerificationService
                        .getVerificationCenter(
                                authentication.getName()
                        )
        );
    }

    @PostMapping(
            "/{type}/submit"
    )
    public ResponseEntity<
            TrustVerificationResponse
            >
    submitVerification(
            Authentication authentication,

            @PathVariable
            VerificationType type,

            @Valid
            @RequestBody
            SubmitVerificationRequest request
    ) {

        return ResponseEntity.ok(
                memberVerificationService
                        .submitVerification(
                                authentication.getName(),
                                type,
                                request
                        )
        );
    }
}
