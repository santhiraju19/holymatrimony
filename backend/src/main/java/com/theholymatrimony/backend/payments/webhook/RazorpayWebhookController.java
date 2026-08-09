package com.theholymatrimony.backend.payments.webhook;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/webhook")
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
public class RazorpayWebhookController {

    private final RazorpayWebhookService
            razorpayWebhookService;

    @PostMapping("/razorpay")
    public ResponseEntity<Void> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(
                    value = "X-Razorpay-Signature",
                    required = false
            )
            String signature
    ) throws Exception {

        razorpayWebhookService.processWebhook(
                payload,
                signature
        );

        return ResponseEntity.ok().build();
    }
}