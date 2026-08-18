package com.theholymatrimony.backend.verification.church;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(
        "/api/v1/verifications/church"
)
@RequiredArgsConstructor
public class ChurchProofController {

    private final ChurchProofService
            churchProofService;

    /*
     * ============================================================
     * SUBMIT CHURCH VERIFICATION
     * ============================================================
     */

    @PostMapping(
            value = "/submission",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ChurchProofResponse>
    submitChurchVerification(
            Authentication authentication,

            @RequestPart("verificationMethod")
            String verificationMethod,

            @RequestPart(
                    value = "pastorName",
                    required = false
            )
            String pastorName,

            @RequestPart(
                    value = "churchPhone",
                    required = false
            )
            String churchPhone,

            @RequestPart(
                    value = "churchEmail",
                    required = false
            )
            String churchEmail,

            @RequestPart(
                    value = "membershipId",
                    required = false
            )
            String membershipId,

            @RequestPart(
                    value = "file",
                    required = false
            )
            MultipartFile file,

            @RequestPart(
                    value = "note",
                    required = false
            )
            String note
    ) {

        ChurchVerificationMethod method;

        try {

            method =
                    ChurchVerificationMethod
                            .valueOf(
                                    verificationMethod
                                            .trim()
                                            .toUpperCase()
                            );

        } catch (Exception exception) {

            throw new IllegalArgumentException(
                    "Unsupported church verification method."
            );
        }

        ChurchVerificationSubmission submission =
                churchProofService
                        .submitChurchVerification(
                                authentication.getName(),
                                method,
                                pastorName,
                                churchPhone,
                                churchEmail,
                                membershipId,
                                file,
                                note
                        );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        map(
                                submission
                        )
                );
    }

    /*
     * ============================================================
     * GET MY CHURCH SUBMISSION
     * ============================================================
     */

    @GetMapping(
            "/submission"
    )
    public ResponseEntity<ChurchProofResponse>
    getMyChurchSubmission(
            Authentication authentication
    ) {

        ChurchVerificationSubmission submission =
                churchProofService
                        .getMemberSubmission(
                                authentication.getName()
                        );

        return ResponseEntity.ok(
                map(
                        submission
                )
        );
    }

    /*
     * ============================================================
     * RESPONSE MAPPING
     * ============================================================
     */

    private ChurchProofResponse map(
            ChurchVerificationSubmission submission
    ) {

        boolean documentAvailable =
                submission.getStoredFileName() != null &&
                !submission
                        .getStoredFileName()
                        .isBlank();

        return new ChurchProofResponse(
                submission.getId(),

                submission
                        .getVerification()
                        .getId(),

                submission
                        .getVerificationMethod(),

                submission.getPastorName(),
                submission.getChurchPhone(),
                submission.getChurchEmail(),

                submission.getMembershipId(),

                documentAvailable,
                submission.getOriginalFileName(),
                submission.getContentType(),
                submission.getFileSize(),

                submission
                        .getVerification()
                        .getSubmittedAt(),

                submission.getUpdatedAt()
        );
    }
}
