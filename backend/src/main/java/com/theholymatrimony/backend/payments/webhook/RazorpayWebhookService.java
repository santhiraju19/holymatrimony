package com.theholymatrimony.backend.payments.webhook;

import com.razorpay.Utils;

import com.theholymatrimony.backend.payments.entity.Payment;

import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import com.theholymatrimony.backend.payments.service.PaymentFinalizationService;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
public class RazorpayWebhookService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    RazorpayWebhookService.class
            );

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
         * Verify the exact raw request body before parsing.
         */

        boolean valid =
                Utils.verifyWebhookSignature(
                        payload,
                        signature,
                        webhookSecret
                );

        if (!valid) {

            log.warn(
                    "Rejected Razorpay webhook because the signature was invalid."
            );

            throw new IllegalArgumentException(
                    "Invalid Razorpay webhook signature."
            );
        }

        JSONObject event =
                new JSONObject(
                        payload
                );

        String eventType =
                normalize(
                        event.optString(
                                "event",
                                null
                        )
                );

        log.info(
                "Razorpay webhook received: event={}",
                eventType
        );

        if (
                eventType == null
        ) {
            throw new IllegalArgumentException(
                    "Razorpay webhook event type is missing."
            );
        }

        switch (eventType) {

            case "payment.captured" ->
                    handlePaymentCaptured(
                            event
                    );

            case "payment.failed" ->
                    handlePaymentFailed(
                            event
                    );

            default ->
                    log.debug(
                            "Ignoring unsupported Razorpay webhook event: {}",
                            eventType
                    );
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

        /*
         * ========================================================
         * ACTUAL RAZORPAY PAYMENT METHOD
         * ========================================================
         *
         * Razorpay normally returns values such as:
         *
         * card
         * upi
         * netbanking
         * wallet
         * emi
         *
         * We store a normalized uppercase representation:
         *
         * CARD
         * UPI
         * NETBANKING
         * WALLET
         * EMI
         */

        String paymentMethod =
                normalizePaymentMethod(
                        paymentEntity.optString(
                                "method",
                                null
                        )
                );

        log.info(
                "Processing Razorpay payment.captured: orderId={}, paymentId={}, gatewayStatus={}, paymentMethod={}",
                razorpayOrderId,
                razorpayPaymentId,
                gatewayStatus,
                paymentMethod
        );

        if (
                razorpayPaymentId == null ||
                razorpayOrderId == null
        ) {

            log.error(
                    "Captured Razorpay payment payload is incomplete: orderId={}, paymentId={}",
                    razorpayOrderId,
                    razorpayPaymentId
            );

            throw new IllegalArgumentException(
                    "Razorpay captured payment payload is incomplete."
            );
        }

        /*
         * Be defensive even though this method is only called
         * for payment.captured.
         */

        if (
                gatewayStatus != null &&
                !"captured"
                        .equalsIgnoreCase(
                                gatewayStatus
                        )
        ) {

            log.error(
                    "Razorpay payment.captured event contains unexpected gateway status: orderId={}, paymentId={}, status={}",
                    razorpayOrderId,
                    razorpayPaymentId,
                    gatewayStatus
            );

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
                                () -> {

                                    log.error(
                                            "Local payment record was not found for captured Razorpay order: orderId={}, paymentId={}",
                                            razorpayOrderId,
                                            razorpayPaymentId
                                    );

                                    return new IllegalArgumentException(
                                            "Payment order was not found."
                                    );
                                }
                        );

        /*
         * ========================================================
         * DUPLICATE PAYMENT-ID PROTECTION
         * ========================================================
         */

        paymentRepository
                .findByRazorpayPaymentId(
                        razorpayPaymentId
                )
                .ifPresent(
                        existingPayment -> {

                            if (
                                    !existingPayment
                                            .getId()
                                            .equals(
                                                    payment.getId()
                                            )
                            ) {

                                log.error(
                                        "Razorpay payment ID is already linked to another local payment: paymentId={}, existingLocalPaymentId={}, requestedLocalPaymentId={}",
                                        razorpayPaymentId,
                                        existingPayment.getId(),
                                        payment.getId()
                                );

                                throw new IllegalArgumentException(
                                        "Razorpay payment ID is already associated with another payment."
                                );
                            }
                        }
                );

        /*
         * Browser verification may already have stored the
         * Razorpay payment ID.
         *
         * If it has, it MUST match the webhook.
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

            log.error(
                    "Captured Razorpay payment ID does not match previously verified payment ID: orderId={}, webhookPaymentId={}, storedPaymentId={}",
                    razorpayOrderId,
                    razorpayPaymentId,
                    payment.getRazorpayPaymentId()
            );

            throw new IllegalArgumentException(
                    "Razorpay payment ID does not match the verified checkout payment."
            );
        }

        /*
         * ========================================================
         * STORE PAYMENT SOURCE
         * ========================================================
         */

        payment.setPaymentSource(
                PaymentSource.RAZORPAY
        );

        /*
         * ========================================================
         * STORE ACTUAL PAYMENT METHOD
         * ========================================================
         *
         * Do this BEFORE finalization so the SUCCESS transaction
         * and membership are persisted with the gateway method.
         */

        if (
                paymentMethod != null
        ) {
            payment.setPaymentMethod(
                    paymentMethod
            );
        }

        /*
         * Save before finalization.
         *
         * This also makes the payment method durable if the
         * finalization method performs a flush.
         */

        paymentRepository.save(
                payment
        );

        /*
         * ========================================================
         * FINALIZE SUCCESSFUL PAYMENT
         * ========================================================
         *
         * PaymentFinalizationService performs idempotent:
         *
         * PENDING -> SUCCESS
         * paidAt assignment
         * Razorpay payment ID persistence
         * membership activation
         */

        paymentFinalizationService
                .finalizeSuccessfulPayment(
                        payment,
                        razorpayPaymentId,
                        payment.getRazorpaySignature()
                );

        log.info(
                "Razorpay payment finalized successfully: localPaymentId={}, orderId={}, paymentId={}, paymentMethod={}",
                payment.getId(),
                razorpayOrderId,
                razorpayPaymentId,
                paymentMethod
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

        String paymentMethod =
                normalizePaymentMethod(
                        paymentEntity.optString(
                                "method",
                                null
                        )
                );

        log.info(
                "Processing Razorpay payment.failed: orderId={}, paymentId={}, paymentMethod={}",
                razorpayOrderId,
                razorpayPaymentId,
                paymentMethod
        );

        if (
                razorpayOrderId == null
        ) {

            log.warn(
                    "Ignoring Razorpay payment.failed event because order_id is missing."
            );

            return;
        }

        paymentRepository
                .findByRazorpayOrderId(
                        razorpayOrderId
                )
                .ifPresentOrElse(
                        payment -> {

                            /*
                             * Webhook ordering is not guaranteed.
                             *
                             * Never downgrade a transaction already
                             * confirmed SUCCESS.
                             */

                            if (
                                    payment.getStatus()
                                            == PaymentStatus.SUCCESS
                            ) {

                                log.warn(
                                        "Ignoring payment.failed because local payment is already SUCCESS: localPaymentId={}, orderId={}, paymentId={}",
                                        payment.getId(),
                                        razorpayOrderId,
                                        razorpayPaymentId
                                );

                                return;
                            }

                            payment.setPaymentSource(
                                    PaymentSource.RAZORPAY
                            );

                            if (
                                    paymentMethod != null
                            ) {
                                payment.setPaymentMethod(
                                        paymentMethod
                                );
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

                            log.info(
                                    "Razorpay payment marked FAILED: localPaymentId={}, orderId={}, paymentId={}, paymentMethod={}",
                                    payment.getId(),
                                    razorpayOrderId,
                                    razorpayPaymentId,
                                    paymentMethod
                            );
                        },
                        () ->
                                log.warn(
                                        "No local payment record found for Razorpay payment.failed event: orderId={}, paymentId={}",
                                        razorpayOrderId,
                                        razorpayPaymentId
                                )
                );
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

        if (
                payload == null
        ) {
            throw new IllegalArgumentException(
                    "Razorpay webhook payload is missing."
            );
        }

        JSONObject payment =
                payload.optJSONObject(
                        "payment"
                );

        if (
                payment == null
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment payload is missing."
            );
        }

        JSONObject entity =
                payment.optJSONObject(
                        "entity"
                );

        if (
                entity == null
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment entity is missing."
            );
        }

        return entity;
    }

    /*
     * ============================================================
     * PAYMENT METHOD NORMALIZATION
     * ============================================================
     */

    private String normalizePaymentMethod(
            String value
    ) {

        String normalized =
                normalize(
                        value
                );

        if (
                normalized == null
        ) {
            return null;
        }

        return normalized
                .toUpperCase(
                        Locale.ROOT
                );
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
