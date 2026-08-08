package com.theholymatrimony.backend.admin.payment.controller;

import com.theholymatrimony.backend.admin.payment.dto.AdminPaymentPageResponse;
import com.theholymatrimony.backend.admin.payment.dto.AdminPaymentResponse;
import com.theholymatrimony.backend.admin.payment.service.AdminPaymentService;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.service.PaymentReceiptPdfService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping(
        "/api/v1/admin/payments"
)
@RequiredArgsConstructor
public class AdminPaymentController {

    private final AdminPaymentService
            adminPaymentService;

    private final PaymentReceiptPdfService
            paymentReceiptPdfService;

    /*
     * =====================================================
     * Payment List
     * =====================================================
     */

    @GetMapping
    public ResponseEntity<
            ApiResponse<AdminPaymentPageResponse>
            >
    getPayments(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size,

            @RequestParam(
                    required = false
            )
            String search,

            @RequestParam(
                    required = false
            )
            PaymentStatus status

    ) {

        AdminPaymentPageResponse response =
                adminPaymentService
                        .getPayments(
                                page,
                                size,
                                search,
                                status
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    /*
     * =====================================================
     * Payment Detail
     * =====================================================
     */

    @GetMapping("/{paymentId}")
    public ResponseEntity<
            ApiResponse<AdminPaymentResponse>
            >
    getPayment(

            @PathVariable
            UUID paymentId

    ) {

        AdminPaymentResponse response =
                adminPaymentService
                        .getPayment(
                                paymentId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    /*
     * =====================================================
     * Admin Receipt Download
     * =====================================================
     *
     * GET
     * /api/v1/admin/payments/{paymentId}/receipt
     */

    @GetMapping(
            "/{paymentId}/receipt"
    )
    public ResponseEntity<byte[]>
    downloadReceipt(

            @PathVariable
            UUID paymentId

    ) {

        PaymentReceiptResponse receipt =
                adminPaymentService
                        .getPaymentReceipt(
                                paymentId
                        );

        byte[] pdf =
                paymentReceiptPdfService
                        .generateReceipt(
                                receipt
                        );

        String filename =
                buildReceiptFilename(
                        receipt
                );

        ContentDisposition disposition =
                ContentDisposition
                        .attachment()
                        .filename(
                                filename,
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity
                .ok()
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .contentLength(
                        pdf.length
                )
                .body(
                        pdf
                );
    }

    /*
     * =====================================================
     * Receipt Filename
     * =====================================================
     */

    private String buildReceiptFilename(
            PaymentReceiptResponse receipt
    ) {

        String invoiceNumber =
                receipt.getInvoiceNumber();

        if (
                invoiceNumber == null
                        || invoiceNumber.isBlank()
        ) {
            invoiceNumber =
                    "HOLY-MATRIMONY-RECEIPT";
        }

        String safeInvoiceNumber =
                invoiceNumber.replaceAll(
                        "[^a-zA-Z0-9_-]",
                        "-"
                );

        return safeInvoiceNumber
                + ".pdf";
    }
}