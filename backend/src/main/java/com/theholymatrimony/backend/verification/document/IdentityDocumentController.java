package com.theholymatrimony.backend.verification.document;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(
        "/api/v1/verifications/identity/document"
)
@RequiredArgsConstructor
public class IdentityDocumentController {

    private final IdentityDocumentService
            identityDocumentService;

    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<
            IdentityDocumentResponse
            >
    uploadIdentityDocument(
            Authentication authentication,

            @RequestPart("documentType")
            String documentType,

            @RequestPart("file")
            MultipartFile file,

            @RequestPart(
                    value = "note",
                    required = false
            )
            String note
    ) {

        IdentityDocumentType type;

        try {

            type =
                    IdentityDocumentType
                            .valueOf(
                                    documentType
                                            .trim()
                                            .toUpperCase()
                            );

        } catch (Exception exception) {

            throw new IllegalArgumentException(
                    "Unsupported identity document type."
            );
        }

        IdentityVerificationDocument document =
                identityDocumentService
                        .uploadIdentityDocument(
                                authentication.getName(),
                                type,
                                file,
                                note
                        );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        map(
                                document
                        )
                );
    }

    @GetMapping
    public ResponseEntity<
            IdentityDocumentResponse
            >
    getMyIdentityDocument(
            Authentication authentication
    ) {

        IdentityVerificationDocument document =
                identityDocumentService
                        .getMemberDocument(
                                authentication.getName()
                        );

        return ResponseEntity.ok(
                map(
                        document
                )
        );
    }

    private IdentityDocumentResponse map(
            IdentityVerificationDocument document
    ) {

        return new IdentityDocumentResponse(
                document.getId(),
                document.getVerification()
                        .getId(),
                document.getDocumentType(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getCreatedAt()
        );
    }
}