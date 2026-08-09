package com.theholymatrimony.backend.payments.webhook;

import com.razorpay.Utils;

import com.theholymatrimony.backend.payments.entity.Payment;

import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import com.theholymatrimony.backend.payments.service.PaymentFinalizationService;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
public class RazorpayWebhookService {

    private final PaymentRepository
            paymentRepository;

    private final PaymentFinalizationService
            paymentFinalizationService;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    /*
     * ============================================================
     * PROCESS RAZORPAY WEBHOOK
     * ============================================================
     */

    public void processWebhook(
            String payload,
            String signature
    ) throws Exception {

        if (
                payload == null ||
                payload.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay webhook payload is required."
            );
        }

        if (
                signature == null ||
                signature.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Missing Razorpay webhook signature."
            );
        }

        if (
                webhookSecret == null ||
                webhookSecret.isBlank()
        ) {
            throw new IllegalStateException(
                    "Razorpay webhook secret is not configured."
            );
        }

        /*
         * IMPORTANT:
         *
         * Verify the signature using the exact raw request
         * body before parsing or modifying it.
         */
        boolean valid =
                Utils.verifyWebhookSignature(
                        payload,
                        signature,
                        webhookSecret
                );

        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid Razorpay webhook signature."
            );
        }

        JSONObject event =
                new JSONObject(
                        payload
                );

        String eventType =
                event.optString(
                        "event",
                        ""
                );

        switch (eventType) {

            case "payment.captured" ->
                    handlePaymentCaptured(
                            event
                    );

            case "payment.failed" ->
                    handlePaymentFailed(
                            event
                    );

            default -> {
                /*
                 * Event is valid but not required by the
                 * Holy Matrimony payment workflow.
                 *
                 * Return successfully so Razorpay does
                 * not continually retry an event that
                 * we intentionally ignore.
                 */
            }
        }
    }

    /*
     * ============================================================
     * PAYMENT CAPTURED
     * ============================================================
     */

    private void handlePaymentCaptured(
            JSONObject event
    ) {

        JSONObject paymentEntity =
                getPaymentEntity(
                        event
                );

        String razorpayPaymentId =
                normalize(
                        paymentEntity.optString(
                                "id",
                                null
                        )
                );

        String razorpayOrderId =
                normalize(
                        paymentEntity.optString(
                                "order_id",
                                null
                        )
                );

        String gatewayStatus =
                normalize(
                        paymentEntity.optString(
                                "status",
                                null
                        )
                );

        if (
                razorpayPaymentId == null ||
                razorpayOrderId == null
        ) {
            throw new IllegalArgumentException(
                    "Razorpay captured payment payload is incomplete."
            );
        }

        /*
         * Be defensive even though this handler is invoked
         * for the payment.captured event.
         */
        if (
                gatewayStatus != null &&
                !"captured"
                        .equalsIgnoreCase(
                                gatewayStatus
                        )
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment is not captured."
            );
        }

        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment order was not found."
                                        )
                        );

        /*
         * Protect against a webhook containing an order
         * identifier associated with another Razorpay
         * payment already stored locally.
         */
        paymentRepository
                .findByRazorpayPaymentId(
                        razorpayPaymentId
                )
                .ifPresent(existingPayment -> {

                    if (
                            !existingPayment
                                    .getId()
                                    .equals(
                                            payment.getId()
                                    )
                    ) {
                        throw new IllegalArgumentException(
                                "Razorpay payment ID is already associated with another payment."
                        );
                    }
                });

        /*
         * Browser verification may already have stored
         * the payment ID.
         *
         * If so, it must match the webhook.
         */
        if (
                payment.getRazorpayPaymentId() != null &&
                !payment
                        .getRazorpayPaymentId()
                        .isBlank() &&
                !payment
                        .getRazorpayPaymentId()
                        .equals(
                                razorpayPaymentId
                        )
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID does not match the verified checkout payment."
            );
        }

        /*
         * Idempotent finalization:
         *
         * PaymentFinalizationService is responsible for
         * SUCCESS status and membership activation.
         */
        paymentFinalizationService
                .finalizeSuccessfulPayment(
                        payment,
                        razorpayPaymentId,
                        payment.getRazorpaySignature()
                );
    }

    /*
     * ============================================================
     * PAYMENT FAILED
     * ============================================================
     */

    private void handlePaymentFailed(
            JSONObject event
    ) {

        JSONObject paymentEntity =
                getPaymentEntity(
                        event
                );

        String razorpayOrderId =
                normalize(
                        paymentEntity.optString(
                                "order_id",
                                null
                        )
                );

        String razorpayPaymentId =
                normalize(
                        paymentEntity.optString(
                                "id",
                                null
                        )
                );

        if (razorpayOrderId == null) {
            return;
        }

        paymentRepository
                .findByRazorpayOrderId(
                        razorpayOrderId
                )
                .ifPresent(payment -> {

                    /*
                     * Webhook ordering is not guaranteed.
                     *
                     * Never downgrade a payment already
                     * confirmed SUCCESS.
                     */
                    if (
                            payment.getStatus()
                                    == PaymentStatus.SUCCESS
                    ) {
                        return;
                    }

                    if (
                            razorpayPaymentId != null &&
                            (
                                    payment.getRazorpayPaymentId()
                                            == null ||
                                    payment.getRazorpayPaymentId()
                                            .isBlank()
                            )
                    ) {
                        payment.setRazorpayPaymentId(
                                razorpayPaymentId
                        );
                    }

                    payment.setStatus(
                            PaymentStatus.FAILED
                    );

                    paymentRepository.save(
                            payment
                    );
                });
    }

    /*
     * ============================================================
     * WEBHOOK JSON EXTRACTION
     * ============================================================
     */

    private JSONObject getPaymentEntity(
            JSONObject event
    ) {

        JSONObject payload =
                event.optJSONObject(
                        "payload"
                );

        if (payload == null) {
            throw new IllegalArgumentException(
                    "Razorpay webhook payload is missing."
            );
        }

        JSONObject payment =
                payload.optJSONObject(
                        "payment"
                );

        if (payment == null) {
            throw new IllegalArgumentException(
                    "Razorpay payment payload is missing."
            );
        }

        JSONObject entity =
                payment.optJSONObject(
                        "entity"
                );

        if (entity == null) {
            throw new IllegalArgumentException(
                    "Razorpay payment entity is missing."
            );
        }

        return entity;
    }

    /*
     * ============================================================
     * STRING NORMALIZATION
     * ============================================================
     */

    private String normalize(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}