package com.theholymatrimony.backend.admin.controller;

import com.theholymatrimony.backend.verification.church.ChurchProofService;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/v1/admin/verifications"
)
@RequiredArgsConstructor
public class AdminChurchProofController {

    private final ChurchProofService
            churchProofService;

    @GetMapping(
            "/{verificationId}/church-proof"
    )
    public ResponseEntity<Resource>
    downloadChurchProof(
            @PathVariable
            UUID verificationId
    ) {

        ChurchProofService.DownloadedChurchProof
                proof =
                churchProofService
                        .loadAdminProof(
                                verificationId
                        );

        MediaType mediaType;

        try {

            mediaType =
                    MediaType.parseMediaType(
                            proof.contentType()
                    );

        } catch (Exception exception) {

            mediaType =
                    MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition disposition =
                ContentDisposition
                        .inline()
                        .filename(
                                proof.originalFileName(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(
                        mediaType
                )
                .contentLength(
                        proof.fileSize()
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .header(
                        HttpHeaders.CACHE_CONTROL,
                        "no-store, no-cache, must-revalidate, private"
                )
                .header(
                        "X-Content-Type-Options",
                        "nosniff"
                )
                .body(
                        proof.resource()
                );
    }
}
