package com.theholymatrimony.backend.payments.controller;

import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.PaymentHistoryResponse;
import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.payments.service.PaymentReceiptPdfService;
import com.theholymatrimony.backend.payments.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private final PaymentReceiptPdfService
            paymentReceiptPdfService;

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse>
    createOrder(
            @RequestBody
            CreateOrderRequest request,

            Authentication authentication
    ) throws Exception {

        String authenticatedEmail =
                getAuthenticatedEmail(
                        authentication
                );

        CreateOrderResponse response =
                paymentService.createOrder(
                        request,
                        authenticatedEmail
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Void>
    verifyPayment(
            @RequestBody
            VerifyPaymentRequest request,

            Authentication authentication
    ) throws Exception {

        String authenticatedEmail =
                getAuthenticatedEmail(
                        authentication
                );

        paymentService.verifyPayment(
                request,
                authenticatedEmail
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<
            List<PaymentHistoryResponse>
            >
    getPaymentHistory(
            Authentication authentication
    ) {

        String authenticatedEmail =
                getAuthenticatedEmail(
                        authentication
                );

        List<PaymentHistoryResponse> history =
                paymentService.getPaymentHistory(
                        authenticatedEmail
                );

        return ResponseEntity.ok(history);
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<byte[]>
    downloadReceipt(
            @PathVariable
            UUID paymentId,

            Authentication authentication
    ) {

        String authenticatedEmail =
                getAuthenticatedEmail(
                        authentication
                );

        PaymentReceiptResponse receipt =
                paymentService.getPaymentReceipt(
                        paymentId,
                        authenticatedEmail
                );

        byte[] pdf =
                paymentReceiptPdfService
                        .generateReceipt(receipt);

        String filename =
                buildReceiptFilename(receipt);

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
                .contentLength(pdf.length)
                .body(pdf);
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        return authentication
                .getName()
                .trim();
    }

    private String buildReceiptFilename(
            PaymentReceiptResponse receipt
    ) {

        String invoiceNumber =
                receipt.getInvoiceNumber();

        if (
                invoiceNumber == null ||
                invoiceNumber.isBlank()
        ) {
            invoiceNumber =
                    "HOLY-MATRIMONY-RECEIPT";
        }

        String safeInvoiceNumber =
                invoiceNumber.replaceAll(
                        "[^a-zA-Z0-9_-]",
                        "-"
                );

        return safeInvoiceNumber + ".pdf";
    }
}