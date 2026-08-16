package com.theholymatrimony.backend.admin.controller;

import com.theholymatrimony.backend.verification.document.IdentityDocumentService;

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
public class AdminIdentityDocumentController {

    private final IdentityDocumentService
            identityDocumentService;

    @GetMapping(
            "/{verificationId}/document"
    )
    public ResponseEntity<Resource>
    downloadIdentityDocument(
            @PathVariable
            UUID verificationId
    ) {

        IdentityDocumentService.DownloadedIdentityDocument
                document =
                identityDocumentService
                        .loadAdminDocument(
                                verificationId
                        );

        MediaType mediaType;

        try {
            mediaType =
                    MediaType.parseMediaType(
                            document.contentType()
                    );
        } catch (Exception exception) {
            mediaType =
                    MediaType.APPLICATION_OCTET_STREAM;
        }

        ContentDisposition disposition =
                ContentDisposition
                        .inline()
                        .filename(
                                document.originalFileName(),
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(
                        mediaType
                )
                .contentLength(
                        document.fileSize()
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
                        document.resource()
                );
    }
}