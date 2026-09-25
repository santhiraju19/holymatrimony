package com.theholymatrimony.backend.secureconnect.topup.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectLedgerEntry;
import com.theholymatrimony.backend.secureconnect.enums.BalanceSource;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.LedgerTransactionType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectLedgerRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;
import com.theholymatrimony.backend.secureconnect.topup.entity.SecureConnectTopUpPayment;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SecureConnectTopUpFulfillmentServiceImplTests {

    private SecureConnectTopUpPaymentRepository
            topUpPaymentRepository;

    private SecureConnectWalletRepository
            walletRepository;

    private SecureConnectLedgerRepository
            ledgerRepository;

    private SecureConnectTopUpFulfillmentServiceImpl
            service;

    private User user;

    @BeforeEach
    void setUp() {

        topUpPaymentRepository =
                mock(
                        SecureConnectTopUpPaymentRepository.class
                );

        walletRepository =
                mock(
                        SecureConnectWalletRepository.class
                );

        ledgerRepository =
                mock(
                        SecureConnectLedgerRepository.class
                );

        service =
                new SecureConnectTopUpFulfillmentServiceImpl(
                        topUpPaymentRepository,
                        walletRepository,
                        ledgerRepository
                );

        user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Top Up User")
                        .email("topup@example.com")
                        .password("password")
                        .enabled(true)
                        .build();

        when(
                walletRepository.creditTopUpSeconds(
                        any(UUID.class),
                        any(UUID.class),
                        anyString(),
                        anyLong()
                )
        ).thenReturn(1);
    }

    @Test
    void capturedAudioTopUpCreditsWalletAndLedgerExactlyOnce() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.AUDIO,
                        60,
                        7900
                );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(
                                "pay_audio_001"
                        )
        ).thenReturn(
                Optional.empty()
        );

        when(
                ledgerRepository
                        .existsByIdempotencyKey(
                                "SECURE_CONNECT_TOPUP:"
                                        + payment.getId()
                        )
        ).thenReturn(false);

        service.finalizeCapturedPayment(
                payment.getRazorpayOrderId(),
                "pay_audio_001",
                "UPI"
        );

        verify(walletRepository)
                .creditTopUpSeconds(
                        any(UUID.class),
                        eq(user.getId()),
                        eq("AUDIO"),
                        eq(3600L)
                );

        ArgumentCaptor<SecureConnectLedgerEntry> captor =
                ArgumentCaptor.forClass(
                        SecureConnectLedgerEntry.class
                );

        verify(ledgerRepository)
                .save(
                        captor.capture()
                );

        SecureConnectLedgerEntry entry =
                captor.getValue();

        assertEquals(
                user,
                entry.getUser()
        );

        assertEquals(
                CallMediaType.AUDIO,
                entry.getMediaType()
        );

        assertEquals(
                LedgerTransactionType.TOPUP_PURCHASE,
                entry.getTransactionType()
        );

        assertEquals(
                BalanceSource.TOPUP,
                entry.getBalanceSource()
        );

        assertEquals(
                3600L,
                entry.getSeconds()
        );

        assertNull(
                entry.getPayment()
        );

        assertEquals(
                "SECURE_CONNECT_TOPUP:"
                        + payment.getId(),
                entry.getIdempotencyKey()
        );

        assertEquals(
                PaymentStatus.SUCCESS,
                payment.getStatus()
        );

        assertEquals(
                "pay_audio_001",
                payment.getRazorpayPaymentId()
        );

        assertEquals(
                "UPI",
                payment.getPaymentMethod()
        );

        assertNotNull(
                payment.getPaidAt()
        );

        verify(topUpPaymentRepository)
                .save(payment);
    }

    @Test
    void capturedVideoTopUpCreditsOnlyVideoWallet() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.VIDEO,
                        30,
                        7900
                );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(
                                "pay_video_001"
                        )
        ).thenReturn(
                Optional.empty()
        );

        when(
                ledgerRepository
                        .existsByIdempotencyKey(
                                "SECURE_CONNECT_TOPUP:"
                                        + payment.getId()
                        )
        ).thenReturn(false);

        service.finalizeCapturedPayment(
                payment.getRazorpayOrderId(),
                "pay_video_001",
                "CARD"
        );

        verify(walletRepository)
                .creditTopUpSeconds(
                        any(UUID.class),
                        eq(user.getId()),
                        eq("VIDEO"),
                        eq(1800L)
                );

        verify(
                walletRepository,
                never()
        ).creditTopUpSeconds(
                any(UUID.class),
                eq(user.getId()),
                eq("AUDIO"),
                anyLong()
        );

        ArgumentCaptor<SecureConnectLedgerEntry> captor =
                ArgumentCaptor.forClass(
                        SecureConnectLedgerEntry.class
                );

        verify(ledgerRepository)
                .save(
                        captor.capture()
                );

        assertEquals(
                CallMediaType.VIDEO,
                captor.getValue().getMediaType()
        );

        assertEquals(
                1800L,
                captor.getValue().getSeconds()
        );
    }

    @Test
    void duplicateSuccessfulCaptureDoesNotCreditWalletAgain() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.AUDIO,
                        120,
                        12900
                );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setRazorpayPaymentId(
                "pay_duplicate_001"
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(
                                "pay_duplicate_001"
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        service.finalizeCapturedPayment(
                payment.getRazorpayOrderId(),
                "pay_duplicate_001",
                "UPI"
        );

        verify(
                walletRepository,
                never()
        ).creditTopUpSeconds(
                any(),
                any(),
                anyString(),
                anyLong()
        );

        verify(
                ledgerRepository,
                never()
        ).save(
                any(SecureConnectLedgerEntry.class)
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    @Test
    void existingLedgerPreventsSecondWalletCredit() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.AUDIO,
                        30,
                        4900
                );

        String ledgerKey =
                "SECURE_CONNECT_TOPUP:"
                        + payment.getId();

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(
                                "pay_recovery_001"
                        )
        ).thenReturn(
                Optional.empty()
        );

        when(
                ledgerRepository
                        .existsByIdempotencyKey(
                                ledgerKey
                        )
        ).thenReturn(true);

        service.finalizeCapturedPayment(
                payment.getRazorpayOrderId(),
                "pay_recovery_001",
                "UPI"
        );

        verify(
                walletRepository,
                never()
        ).creditTopUpSeconds(
                any(),
                any(),
                anyString(),
                anyLong()
        );

        verify(
                ledgerRepository,
                never()
        ).save(
                any(SecureConnectLedgerEntry.class)
        );

        assertEquals(
                PaymentStatus.SUCCESS,
                payment.getStatus()
        );

        assertEquals(
                "pay_recovery_001",
                payment.getRazorpayPaymentId()
        );

        assertNotNull(
                payment.getPaidAt()
        );

        verify(topUpPaymentRepository)
                .save(payment);
    }

    @Test
    void failedTopUpIsMarkedFailedWithoutCreditingWallet() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.VIDEO,
                        60,
                        12900
                );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        service.markPaymentFailed(
                payment.getRazorpayOrderId(),
                "pay_failed_001",
                "CARD"
        );

        assertEquals(
                PaymentStatus.FAILED,
                payment.getStatus()
        );

        assertEquals(
                "pay_failed_001",
                payment.getRazorpayPaymentId()
        );

        assertEquals(
                "CARD",
                payment.getPaymentMethod()
        );

        verify(topUpPaymentRepository)
                .save(payment);

        verifyNoInteractions(
                walletRepository,
                ledgerRepository
        );
    }

    @Test
    void failedWebhookCannotDowngradeSuccessfulTopUp() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.AUDIO,
                        60,
                        7900
                );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setRazorpayPaymentId(
                "pay_success_001"
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        service.markPaymentFailed(
                payment.getRazorpayOrderId(),
                "pay_success_001",
                "UPI"
        );

        assertEquals(
                PaymentStatus.SUCCESS,
                payment.getStatus()
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());

        verifyNoInteractions(
                walletRepository,
                ledgerRepository
        );
    }

    @Test
    void paymentIdCannotBeReusedByAnotherTopUp() {

        SecureConnectTopUpPayment payment =
                topUpPayment(
                        CallMediaType.AUDIO,
                        30,
                        4900
                );

        SecureConnectTopUpPayment otherPayment =
                topUpPayment(
                        CallMediaType.AUDIO,
                        60,
                        7900
                );

        otherPayment.setRazorpayPaymentId(
                "pay_reused_001"
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                payment.getRazorpayOrderId()
                        )
        ).thenReturn(
                Optional.of(payment)
        );

        when(
                topUpPaymentRepository
                        .findByRazorpayPaymentId(
                                "pay_reused_001"
                        )
        ).thenReturn(
                Optional.of(otherPayment)
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.finalizeCapturedPayment(
                                payment.getRazorpayOrderId(),
                                "pay_reused_001",
                                "UPI"
                        )
        );

        verify(
                walletRepository,
                never()
        ).creditTopUpSeconds(
                any(),
                any(),
                anyString(),
                anyLong()
        );

        verify(
                ledgerRepository,
                never()
        ).save(any());
    }

    private SecureConnectTopUpPayment topUpPayment(
            CallMediaType mediaType,
            int minutes,
            int amount
    ) {

        return SecureConnectTopUpPayment
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                .mediaType(mediaType)
                .minutes(minutes)
                .seconds(minutes * 60L)
                .amount(amount)
                .currency("INR")
                .razorpayOrderId(
                        "order_" + UUID.randomUUID()
                )
                .status(PaymentStatus.PENDING)
                .build();
    }
}
