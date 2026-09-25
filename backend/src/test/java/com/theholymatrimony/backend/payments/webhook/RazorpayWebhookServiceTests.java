package com.theholymatrimony.backend.payments.webhook;

import com.razorpay.Utils;

import com.theholymatrimony.backend.payments.coupon.service.MembershipCouponService;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.payments.service.PaymentFinalizationService;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;
import com.theholymatrimony.backend.secureconnect.topup.service.SecureConnectTopUpFulfillmentService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RazorpayWebhookServiceTests {

    private static final String WEBHOOK_SECRET =
            "test_webhook_secret_2026";

    private PaymentRepository paymentRepository;

    private PaymentFinalizationService
            paymentFinalizationService;

    private MembershipCouponService
            membershipCouponService;

    private SecureConnectTopUpPaymentRepository
            secureConnectTopUpPaymentRepository;

    private SecureConnectTopUpFulfillmentService
            secureConnectTopUpFulfillmentService;

    private RazorpayWebhookService service;

    @BeforeEach
    void setUp() {

        paymentRepository =
                mock(PaymentRepository.class);

        paymentFinalizationService =
                mock(PaymentFinalizationService.class);

        membershipCouponService =
                mock(MembershipCouponService.class);

        secureConnectTopUpPaymentRepository =
                mock(
                        SecureConnectTopUpPaymentRepository.class
                );

        secureConnectTopUpFulfillmentService =
                mock(
                        SecureConnectTopUpFulfillmentService.class
                );

        service =
                new RazorpayWebhookService(
                        paymentRepository,
                        paymentFinalizationService,
                        membershipCouponService,
                        secureConnectTopUpPaymentRepository,
                        secureConnectTopUpFulfillmentService
                );

        ReflectionTestUtils.setField(
                service,
                "webhookSecret",
                WEBHOOK_SECRET
        );
    }

    @Test
    void capturedSecureConnectTopUpRoutesToFulfillment()
            throws Exception {

        String orderId =
                "order_topup_audio_001";

        String paymentId =
                "pay_topup_audio_001";

        String payload =
                paymentEvent(
                        "payment.captured",
                        orderId,
                        paymentId,
                        "captured",
                        "upi"
                );

        when(
                paymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(Optional.empty());

        when(
                secureConnectTopUpPaymentRepository
                        .existsByRazorpayOrderId(orderId)
        ).thenReturn(true);

        service.processWebhook(
                payload,
                signature(payload)
        );

        verify(
                secureConnectTopUpFulfillmentService
        ).finalizeCapturedPayment(
                orderId,
                paymentId,
                "UPI"
        );

        verify(
                paymentFinalizationService,
                never()
        ).finalizeSuccessfulPayment(
                any(),
                anyString(),
                any()
        );

        verifyNoInteractions(
                membershipCouponService
        );
    }

    @Test
    void failedSecureConnectTopUpRoutesToFailureHandler()
            throws Exception {

        String orderId =
                "order_topup_video_001";

        String paymentId =
                "pay_topup_video_001";

        String payload =
                paymentEvent(
                        "payment.failed",
                        orderId,
                        paymentId,
                        "failed",
                        "card"
                );

        when(
                paymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(Optional.empty());

        when(
                secureConnectTopUpPaymentRepository
                        .existsByRazorpayOrderId(orderId)
        ).thenReturn(true);

        service.processWebhook(
                payload,
                signature(payload)
        );

        verify(
                secureConnectTopUpFulfillmentService
        ).markPaymentFailed(
                orderId,
                paymentId,
                "CARD"
        );

        verify(
                paymentFinalizationService,
                never()
        ).finalizeSuccessfulPayment(
                any(),
                anyString(),
                any()
        );
    }

    @Test
    void capturedMembershipPaymentKeepsExistingFinalizationPath()
            throws Exception {

        String orderId =
                "order_membership_001";

        String paymentId =
                "pay_membership_001";

        Payment payment =
                mock(Payment.class);

        Payment finalizedPayment =
                mock(Payment.class);

        UUID localPaymentId =
                UUID.randomUUID();

        when(payment.getId())
                .thenReturn(localPaymentId);

        when(payment.getRazorpayPaymentId())
                .thenReturn(null);

        when(payment.getRazorpaySignature())
                .thenReturn(null);

        when(
                paymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                paymentRepository
                        .findByRazorpayPaymentId(paymentId)
        ).thenReturn(
                Optional.empty()
        );

        when(
                paymentFinalizationService
                        .finalizeSuccessfulPayment(
                                payment,
                                paymentId,
                                null
                        )
        ).thenReturn(
                finalizedPayment
        );

        String payload =
                paymentEvent(
                        "payment.captured",
                        orderId,
                        paymentId,
                        "captured",
                        "netbanking"
                );

        service.processWebhook(
                payload,
                signature(payload)
        );

        verify(payment)
                .setPaymentSource(
                        PaymentSource.RAZORPAY
                );

        verify(payment)
                .setPaymentMethod(
                        "NETBANKING"
                );

        verify(paymentRepository)
                .save(payment);

        verify(paymentFinalizationService)
                .finalizeSuccessfulPayment(
                        payment,
                        paymentId,
                        null
                );

        verify(membershipCouponService)
                .recordSuccessfulRedemption(
                        finalizedPayment
                );

        verifyNoInteractions(
                secureConnectTopUpFulfillmentService
        );
    }

    @Test
    void failedMembershipPaymentKeepsExistingFailurePath()
            throws Exception {

        String orderId =
                "order_membership_failed_001";

        String paymentId =
                "pay_membership_failed_001";

        Payment payment =
                mock(Payment.class);

        when(payment.getId())
                .thenReturn(UUID.randomUUID());

        when(payment.getStatus())
                .thenReturn(PaymentStatus.PENDING);

        when(payment.getRazorpayPaymentId())
                .thenReturn(null);

        when(
                paymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(payment)
        );

        String payload =
                paymentEvent(
                        "payment.failed",
                        orderId,
                        paymentId,
                        "failed",
                        "upi"
                );

        service.processWebhook(
                payload,
                signature(payload)
        );

        verify(payment)
                .setPaymentSource(
                        PaymentSource.RAZORPAY
                );

        verify(payment)
                .setPaymentMethod(
                        "UPI"
                );

        verify(payment)
                .setRazorpayPaymentId(
                        paymentId
                );

        verify(payment)
                .setStatus(
                        PaymentStatus.FAILED
                );

        verify(paymentRepository)
                .save(payment);

        verifyNoInteractions(
                secureConnectTopUpFulfillmentService
        );
    }

    @Test
    void unknownCapturedOrderIsRejected()
            throws Exception {

        String orderId =
                "order_unknown_001";

        String paymentId =
                "pay_unknown_001";

        when(
                paymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(Optional.empty());

        when(
                secureConnectTopUpPaymentRepository
                        .existsByRazorpayOrderId(orderId)
        ).thenReturn(false);

        String payload =
                paymentEvent(
                        "payment.captured",
                        orderId,
                        paymentId,
                        "captured",
                        "upi"
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.processWebhook(
                                        payload,
                                        signature(payload)
                                )
                );

        assertEquals(
                "Payment order was not found.",
                exception.getMessage()
        );

        verifyNoInteractions(
                paymentFinalizationService,
                membershipCouponService,
                secureConnectTopUpFulfillmentService
        );
    }

    @Test
    void invalidSignatureIsRejectedBeforePaymentRouting() {

        String payload =
                paymentEvent(
                        "payment.captured",
                        "order_invalid_signature",
                        "pay_invalid_signature",
                        "captured",
                        "upi"
                );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.processWebhook(
                                payload,
                                "invalid_signature"
                        )
        );

        verifyNoInteractions(
                paymentRepository,
                secureConnectTopUpPaymentRepository,
                paymentFinalizationService,
                membershipCouponService,
                secureConnectTopUpFulfillmentService
        );
    }

    @Test
    void membershipOrderTakesPriorityOverTopUpLookup()
            throws Exception {

        String orderId =
                "order_membership_priority_001";

        String paymentId =
                "pay_membership_priority_001";

        Payment payment =
                mock(Payment.class);

        Payment finalizedPayment =
                mock(Payment.class);

        when(payment.getId())
                .thenReturn(UUID.randomUUID());

        when(payment.getRazorpayPaymentId())
                .thenReturn(null);

        when(payment.getRazorpaySignature())
                .thenReturn(null);

        when(
                paymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                paymentRepository
                        .findByRazorpayPaymentId(paymentId)
        ).thenReturn(
                Optional.empty()
        );

        when(
                paymentFinalizationService
                        .finalizeSuccessfulPayment(
                                payment,
                                paymentId,
                                null
                        )
        ).thenReturn(
                finalizedPayment
        );

        String payload =
                paymentEvent(
                        "payment.captured",
                        orderId,
                        paymentId,
                        "captured",
                        "card"
                );

        service.processWebhook(
                payload,
                signature(payload)
        );

        verify(
                secureConnectTopUpPaymentRepository,
                never()
        ).existsByRazorpayOrderId(anyString());

        verifyNoInteractions(
                secureConnectTopUpFulfillmentService
        );

        verify(paymentFinalizationService)
                .finalizeSuccessfulPayment(
                        payment,
                        paymentId,
                        null
                );
    }

    private String paymentEvent(
            String eventType,
            String orderId,
            String paymentId,
            String status,
            String method
    ) {

        return """
                {
                  "event": "%s",
                  "payload": {
                    "payment": {
                      "entity": {
                        "id": "%s",
                        "order_id": "%s",
                        "status": "%s",
                        "method": "%s"
                      }
                    }
                  }
                }
                """.formatted(
                eventType,
                paymentId,
                orderId,
                status,
                method
        );
    }

    private String signature(
            String payload
    ) throws Exception {

        return Utils.getHash(
                payload,
                WEBHOOK_SECRET
        );
    }
}
