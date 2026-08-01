package com.theholymatrimony.backend.payments.controller;

import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.PaymentHistoryResponse;
import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.payments.service.PaymentReceiptPdfService;
import com.theholymatrimony.backend.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentReceiptPdfService paymentReceiptPdfService;

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication
    ) throws Exception {

        String authenticatedEmail =
                getAuthenticatedEmail(authentication);

        CreateOrderResponse response =
                paymentService.createOrder(
                        request,
                        authenticatedEmail
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestBody VerifyPaymentRequest request,
            Authentication authentication
    ) throws Exception {

        String authenticatedEmail =
                getAuthenticatedEmail(authentication);

        paymentService.verifyPayment(
                request,
                authenticatedEmail
        );

        return ResponseEntity.ok(
                "Payment verified and membership activated successfully"
        );
    }

    @GetMapping("/me")
    public ResponseEntity<List<PaymentHistoryResponse>>
    getMyPaymentHistory(
            Authentication authentication
    ) {
        String authenticatedEmail =
                getAuthenticatedEmail(authentication);

        List<PaymentHistoryResponse> payments =
                paymentService.getPaymentHistory(
                        authenticatedEmail
                );

        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{paymentId}/receipt")
    public ResponseEntity<PaymentReceiptResponse>
    getPaymentReceipt(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {
        String authenticatedEmail =
                getAuthenticatedEmail(authentication);

        PaymentReceiptResponse receipt =
                paymentService.getPaymentReceipt(
                        paymentId,
                        authenticatedEmail
                );

        return ResponseEntity.ok(receipt);
    }

    @GetMapping(
            value = "/{paymentId}/receipt/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> downloadPaymentReceipt(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {
        String authenticatedEmail =
                getAuthenticatedEmail(authentication);

        PaymentReceiptResponse receipt =
                paymentService.getPaymentReceipt(
                        paymentId,
                        authenticatedEmail
                );

        byte[] pdf =
                paymentReceiptPdfService.generateReceipt(
                        receipt
                );

        String filename =
                receipt.getInvoiceNumber() + ".pdf";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                filename +
                                "\""
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }

    private String getAuthenticatedEmail(
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

        return authentication
                .getName()
                .trim();
    }
}
