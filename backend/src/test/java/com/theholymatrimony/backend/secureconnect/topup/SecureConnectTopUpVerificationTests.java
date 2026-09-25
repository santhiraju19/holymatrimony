package com.theholymatrimony.backend.secureconnect.topup;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.topup.entity.SecureConnectTopUpPayment;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;
import com.theholymatrimony.backend.secureconnect.topup.service.SecureConnectTopUpServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecureConnectTopUpVerificationTests {

    private static final String KEY_SECRET =
            "test_razorpay_key_secret_2026";

    private static final String USER_EMAIL =
            "member@example.com";

    private RazorpayClient razorpayClient;

    private UserRepository userRepository;

    private MembershipRepository membershipRepository;

    private SecureConnectTopUpPaymentRepository
            topUpPaymentRepository;

    private SecureConnectTopUpServiceImpl service;

    private User user;

    @BeforeEach
    void setUp() {

        razorpayClient =
                mock(RazorpayClient.class);

        userRepository =
                mock(UserRepository.class);

        membershipRepository =
                mock(MembershipRepository.class);

        topUpPaymentRepository =
                mock(
                        SecureConnectTopUpPaymentRepository.class
                );

        service =
                new SecureConnectTopUpServiceImpl(
                        razorpayClient,
                        userRepository,
                        membershipRepository,
                        topUpPaymentRepository
                );

        ReflectionTestUtils.setField(
                service,
                "keySecret",
                KEY_SECRET
        );

        user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Test Member")
                        .email(USER_EMAIL)
                        .password("not-used")
                        .build();
    }

    @Test
    void validCheckoutSignatureStoresIdentifiersButDoesNotMarkSuccess()
            throws Exception {

        String orderId =
                "order_sc_audio_001";

        String paymentId =
                "pay_sc_audio_001";

        SecureConnectTopUpPayment topUp =
                pendingTopUp(
                        orderId,
                        CallMediaType.AUDIO
                );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(topUp)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(paymentId)
        ).thenReturn(
                Optional.empty()
        );

        VerifyPaymentRequest request =
                verificationRequest(
                        orderId,
                        paymentId
                );

        service.verifyPayment(
                request,
                USER_EMAIL
        );

        assertEquals(
                paymentId,
                topUp.getRazorpayPaymentId()
        );

        assertEquals(
                request.getRazorpay_signature(),
                topUp.getRazorpaySignature()
        );

        /*
         * Browser verification must NEVER fulfill the purchase.
         */

        assertEquals(
                PaymentStatus.PENDING,
                topUp.getStatus()
        );

        assertNull(
                topUp.getPaidAt()
        );

        verify(topUpPaymentRepository)
                .save(topUp);

        /*
         * Order creation dependencies must not be touched during
         * checkout verification.
         */

        verifyNoInteractions(
                razorpayClient,
                userRepository,
                membershipRepository
        );
    }

    @Test
    void invalidCheckoutSignatureIsRejectedWithoutSaving()
            throws Exception {

        String orderId =
                "order_sc_invalid_001";

        String paymentId =
                "pay_sc_invalid_001";

        SecureConnectTopUpPayment topUp =
                pendingTopUp(
                        orderId,
                        CallMediaType.AUDIO
                );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(topUp)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(paymentId)
        ).thenReturn(
                Optional.empty()
        );

        VerifyPaymentRequest request =
                new VerifyPaymentRequest();

        request.setRazorpay_order_id(
                orderId
        );

        request.setRazorpay_payment_id(
                paymentId
        );

        request.setRazorpay_signature(
                "invalid_signature"
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.verifyPayment(
                                        request,
                                        USER_EMAIL
                                )
                );

        assertEquals(
                "Invalid Razorpay payment signature.",
                exception.getMessage()
        );

        assertNull(
                topUp.getRazorpayPaymentId()
        );

        assertNull(
                topUp.getRazorpaySignature()
        );

        assertEquals(
                PaymentStatus.PENDING,
                topUp.getStatus()
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    @Test
    void topUpOwnedByDifferentUserIsRejectedBeforeSignatureVerification()
            throws Exception {

        String orderId =
                "order_sc_other_user_001";

        String paymentId =
                "pay_sc_other_user_001";

        SecureConnectTopUpPayment topUp =
                pendingTopUp(
                        orderId,
                        CallMediaType.VIDEO
                );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(topUp)
        );

        VerifyPaymentRequest request =
                verificationRequest(
                        orderId,
                        paymentId
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.verifyPayment(
                                        request,
                                        "someoneelse@example.com"
                                )
                );

        assertEquals(
                "This Secure Connect top-up does not belong to the authenticated user.",
                exception.getMessage()
        );

        verify(
                topUpPaymentRepository,
                never()
        ).findByRazorpayPaymentId(anyString());

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    @Test
    void razorpayPaymentIdCannotBeReusedByAnotherTopUp()
            throws Exception {

        String orderId =
                "order_sc_current_001";

        String paymentId =
                "pay_sc_reused_001";

        SecureConnectTopUpPayment currentTopUp =
                pendingTopUp(
                        orderId,
                        CallMediaType.AUDIO
                );

        SecureConnectTopUpPayment existingTopUp =
                pendingTopUp(
                        "order_sc_existing_001",
                        CallMediaType.AUDIO
                );

        existingTopUp.setId(
                UUID.randomUUID()
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(currentTopUp)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(paymentId)
        ).thenReturn(
                Optional.of(existingTopUp)
        );

        VerifyPaymentRequest request =
                verificationRequest(
                        orderId,
                        paymentId
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.verifyPayment(
                                        request,
                                        USER_EMAIL
                                )
                );

        assertEquals(
                "This payment has already been processed.",
                exception.getMessage()
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    @Test
    void paymentIdMustMatchPreviouslyVerifiedTopUp()
            throws Exception {

        String orderId =
                "order_sc_verified_001";

        SecureConnectTopUpPayment topUp =
                pendingTopUp(
                        orderId,
                        CallMediaType.AUDIO
                );

        topUp.setRazorpayPaymentId(
                "pay_original_001"
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(topUp)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(
                                "pay_different_001"
                        )
        ).thenReturn(
                Optional.empty()
        );

        VerifyPaymentRequest request =
                verificationRequest(
                        orderId,
                        "pay_different_001"
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.verifyPayment(
                                        request,
                                        USER_EMAIL
                                )
                );

        assertEquals(
                "Razorpay payment ID does not match the previously verified top-up payment.",
                exception.getMessage()
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    @Test
    void webhookCompletedSuccessMakesBrowserCallbackIdempotent()
            throws Exception {

        String orderId =
                "order_sc_success_001";

        SecureConnectTopUpPayment topUp =
                pendingTopUp(
                        orderId,
                        CallMediaType.VIDEO
                );

        topUp.setStatus(
                PaymentStatus.SUCCESS
        );

        topUp.setRazorpayPaymentId(
                "pay_sc_success_001"
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.of(topUp)
        );

        VerifyPaymentRequest request =
                verificationRequest(
                        orderId,
                        "pay_sc_success_001"
                );

        service.verifyPayment(
                request,
                USER_EMAIL
        );

        /*
         * Browser callback arriving after webhook fulfillment is
         * intentionally a no-op.
         */

        verify(
                topUpPaymentRepository,
                never()
        ).findByRazorpayPaymentId(anyString());

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());

        assertEquals(
                PaymentStatus.SUCCESS,
                topUp.getStatus()
        );
    }

    @Test
    void browserSuppliedOrderMustExistLocally()
            throws Exception {

        String orderId =
                "order_sc_missing_001";

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(orderId)
        ).thenReturn(
                Optional.empty()
        );

        VerifyPaymentRequest request =
                verificationRequest(
                        orderId,
                        "pay_sc_missing_001"
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.verifyPayment(
                                        request,
                                        USER_EMAIL
                                )
                );

        assertEquals(
                "Secure Connect top-up order was not found.",
                exception.getMessage()
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    private SecureConnectTopUpPayment pendingTopUp(
            String orderId,
            CallMediaType mediaType
    ) {

        return SecureConnectTopUpPayment
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                .mediaType(mediaType)
                .minutes(30)
                .seconds(30L * 60L)
                .amount(
                        mediaType == CallMediaType.AUDIO
                                ? 4900
                                : 7900
                )
                .currency("INR")
                .razorpayOrderId(orderId)
                .status(PaymentStatus.PENDING)
                .build();
    }

    private VerifyPaymentRequest verificationRequest(
            String orderId,
            String paymentId
    ) throws Exception {

        VerifyPaymentRequest request =
                new VerifyPaymentRequest();

        request.setRazorpay_order_id(
                orderId
        );

        request.setRazorpay_payment_id(
                paymentId
        );

        /*
         * Razorpay checkout signature:
         *
         * HMAC_SHA256(
         *     razorpay_order_id + "|" + razorpay_payment_id,
         *     key_secret
         * )
         */

        String signature =
                Utils.getHash(
                        orderId + "|" + paymentId,
                        KEY_SECRET
                );

        request.setRazorpay_signature(
                signature
        );

        return request;
    }
}
