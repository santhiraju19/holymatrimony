package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageResult;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectLedgerEntry;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectWallet;
import com.theholymatrimony.backend.secureconnect.enums.BalanceSource;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.enums.LedgerTransactionType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectLedgerRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectPlanAllowanceRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SecureConnectUsageServiceImplTests {

    private SecureConnectCallSessionRepository callSessionRepository;
    private SecureConnectLedgerRepository ledgerRepository;
    private SecureConnectPlanAllowanceRepository planAllowanceRepository;
    private SecureConnectWalletRepository walletRepository;
    private MembershipRepository membershipRepository;
    private MembershipEntitlementService membershipEntitlementService;

    private SecureConnectUsageServiceImpl service;

    private UUID callerId;
    private UUID calleeId;

    private User caller;
    private User callee;
    private Membership membership;
    private SecureConnectCallSession call;

    @BeforeEach
    void setUp() {
        callSessionRepository =
                mock(SecureConnectCallSessionRepository.class);

        ledgerRepository =
                mock(SecureConnectLedgerRepository.class);

        planAllowanceRepository =
                mock(SecureConnectPlanAllowanceRepository.class);

        walletRepository =
                mock(SecureConnectWalletRepository.class);

        membershipRepository =
                mock(MembershipRepository.class);

        membershipEntitlementService =
                mock(MembershipEntitlementService.class);

        service = new SecureConnectUsageServiceImpl(
                callSessionRepository,
                ledgerRepository,
                planAllowanceRepository,
                walletRepository,
                membershipRepository,
                membershipEntitlementService
        );

        callerId = UUID.randomUUID();
        calleeId = UUID.randomUUID();

        caller = User.builder()
                .id(callerId)
                .fullName("Caller")
                .email("caller@example.com")
                .password("password")
                .enabled(true)
                .build();

        callee = User.builder()
                .id(calleeId)
                .fullName("Callee")
                .email("callee@example.com")
                .password("password")
                .enabled(true)
                .build();

        membership = Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(MembershipPlan.GOLD)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build();

        call = SecureConnectCallSession.builder()
                .id(UUID.randomUUID())
                .caller(caller)
                .callee(callee)
                .mediaType(CallMediaType.AUDIO)
                .status(CallStatus.ACCEPTED)
                .initiatedAt(LocalDateTime.now().minusMinutes(5))
                .answeredAt(LocalDateTime.now().minusMinutes(4))
                .build();

        call.setConnectedAt(
                LocalDateTime.now().minusMinutes(4)
        );
        call.setConnectedMembership(membership);

        when(callSessionRepository.findForUpdate(call.getId()))
                .thenReturn(Optional.of(call));

        when(ledgerRepository
                .findByCallSessionIdOrderByCreatedAtAsc(call.getId()))
                .thenReturn(List.of());

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        callerId,
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.of(membership));

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(false);

        when(ledgerRepository.existsByIdempotencyKey(anyString()))
                .thenReturn(false);
    }

    @Test
    void planOnlyUsageConsumesPlanAndLeavesWalletUntouched() {
        SecureConnectPlanAllowance allowance =
                allowance(1000L, 100L);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(allowance));

        when(walletRepository.findForUpdate(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(Optional.empty());

        SecureConnectUsageResult result =
                service.finalizeUsage(
                        call.getId(),
                        300L
                );

        assertEquals(300L, result.chargedSeconds());
        assertEquals(300L, result.planSecondsUsed());
        assertEquals(0L, result.topUpSecondsUsed());
        assertEquals(600L, result.planRemainingSeconds());
        assertFalse(result.unlimited());

        assertEquals(
                400L,
                allowance.getConsumedSeconds()
        );

        verify(planAllowanceRepository).save(allowance);
        verify(walletRepository, never()).save(any());

        assertUsageLedger(
                BalanceSource.PLAN,
                -300L
        );
    }

    @Test
    void usageConsumesPlanFirstThenTopUp() {
        SecureConnectPlanAllowance allowance =
                allowance(1000L, 800L);

        SecureConnectWallet wallet =
                wallet(500L);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(allowance));

        when(walletRepository.findForUpdate(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(wallet));

        SecureConnectUsageResult result =
                service.finalizeUsage(
                        call.getId(),
                        350L
                );

        assertEquals(350L, result.chargedSeconds());
        assertEquals(200L, result.planSecondsUsed());
        assertEquals(150L, result.topUpSecondsUsed());

        assertEquals(
                1000L,
                allowance.getConsumedSeconds()
        );

        assertEquals(
                350L,
                wallet.getBalanceSeconds()
        );

        assertEquals(0L, result.planRemainingSeconds());
        assertEquals(350L, result.topUpRemainingSeconds());

        ArgumentCaptor<SecureConnectLedgerEntry> captor =
                ArgumentCaptor.forClass(
                        SecureConnectLedgerEntry.class
                );

        verify(ledgerRepository, times(2))
                .save(captor.capture());

        List<SecureConnectLedgerEntry> entries =
                captor.getAllValues();

        assertEquals(2, entries.size());

        assertTrue(
                entries.stream().anyMatch(
                        entry ->
                                entry.getBalanceSource()
                                        == BalanceSource.PLAN
                                        && entry.getSeconds() == -200L
                )
        );

        assertTrue(
                entries.stream().anyMatch(
                        entry ->
                                entry.getBalanceSource()
                                        == BalanceSource.TOPUP
                                        && entry.getSeconds() == -150L
                )
        );
    }

    @Test
    void topUpOnlyUsageWorksWhenPlanAllowanceIsEmpty() {
        SecureConnectPlanAllowance allowance =
                allowance(600L, 600L);

        SecureConnectWallet wallet =
                wallet(900L);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(allowance));

        when(walletRepository.findForUpdate(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(wallet));

        SecureConnectUsageResult result =
                service.finalizeUsage(
                        call.getId(),
                        240L
                );

        assertEquals(0L, result.planSecondsUsed());
        assertEquals(240L, result.topUpSecondsUsed());
        assertEquals(660L, result.topUpRemainingSeconds());

        assertEquals(
                660L,
                wallet.getBalanceSeconds()
        );

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository).save(wallet);

        assertUsageLedger(
                BalanceSource.TOPUP,
                -240L
        );
    }

    @Test
    void platinumUsageRecordsLedgerButConsumesNoBalance() {
        membership.setPlan(MembershipPlan.PLATINUM);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(true);

        when(planAllowanceRepository
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        CallMediaType.AUDIO
                ))
                .thenReturn(Optional.empty());

        when(walletRepository.findByUserIdAndMediaType(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(
                Optional.of(
                        wallet(1200L)
                )
        );

        SecureConnectUsageResult result =
                service.finalizeUsage(
                        call.getId(),
                        420L
                );

        assertTrue(result.unlimited());
        assertEquals(0L, result.chargedSeconds());
        assertEquals(0L, result.planSecondsUsed());
        assertEquals(0L, result.topUpSecondsUsed());
        assertEquals(1200L, result.topUpRemainingSeconds());

        verify(planAllowanceRepository, never())
                .findForUpdate(any(), any());

        verify(walletRepository, never())
                .findForUpdate(any(), any());

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository, never()).save(any());

        assertUsageLedger(
                BalanceSource.NONE,
                -420L
        );
    }

    @Test
    void insufficientBalanceDoesNotDeductAnything() {
        SecureConnectPlanAllowance allowance =
                allowance(1000L, 900L);

        SecureConnectWallet wallet =
                wallet(50L);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(allowance));

        when(walletRepository.findForUpdate(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(wallet));

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.finalizeUsage(
                                        call.getId(),
                                        200L
                                )
                );

        assertEquals(
                "Insufficient Secure Connect balance to finalize this call.",
                exception.getMessage()
        );

        assertEquals(
                900L,
                allowance.getConsumedSeconds()
        );

        assertEquals(
                50L,
                wallet.getBalanceSeconds()
        );

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository, never()).save(any());
        verify(ledgerRepository, never())
                .save(any(SecureConnectLedgerEntry.class));

        verify(callSessionRepository, never()).save(any());
    }

    @Test
    void duplicateFinalizationDoesNotChargeAgain() {
        SecureConnectLedgerEntry existing =
                SecureConnectLedgerEntry.builder()
                        .id(UUID.randomUUID())
                        .user(caller)
                        .callSession(call)
                        .membership(membership)
                        .mediaType(CallMediaType.AUDIO)
                        .transactionType(
                                LedgerTransactionType.CALL_USAGE
                        )
                        .balanceSource(BalanceSource.PLAN)
                        .seconds(-300L)
                        .idempotencyKey(
                                "CALL_USAGE:"
                                        + call.getId()
                                        + ":PLAN"
                        )
                        .build();

        when(ledgerRepository
                .findByCallSessionIdOrderByCreatedAtAsc(
                        call.getId()
                ))
                .thenReturn(List.of(existing));

        when(planAllowanceRepository
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        CallMediaType.AUDIO
                ))
                .thenReturn(
                        Optional.of(
                                allowance(1000L, 400L)
                        )
                );

        when(walletRepository.findByUserIdAndMediaType(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(
                Optional.of(
                        wallet(500L)
                )
        );

        SecureConnectUsageResult result =
                service.finalizeUsage(
                        call.getId(),
                        300L
                );

        assertTrue(result.alreadyFinalized());
        assertEquals(300L, result.chargedSeconds());
        assertEquals(300L, result.planSecondsUsed());

        verify(planAllowanceRepository, never())
                .findForUpdate(any(), any());

        verify(walletRepository, never())
                .findForUpdate(any(), any());

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository, never()).save(any());
        verify(ledgerRepository, never())
                .save(any(SecureConnectLedgerEntry.class));
    }

    @Test
    void rejectedOrRingingCallCannotBeCharged() {
        call.setStatus(CallStatus.RINGING);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.finalizeUsage(
                                        call.getId(),
                                        120L
                                )
                );

        assertEquals(
                "Only connected Secure Connect calls can finalize usage.",
                exception.getMessage()
        );

        verifyNoInteractions(
                membershipEntitlementService
        );

        verify(ledgerRepository, never())
                .save(any(SecureConnectLedgerEntry.class));
    }

    @Test
    void zeroDurationCannotBeCharged() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.finalizeUsage(
                                call.getId(),
                                0L
                        )
        );

        verify(callSessionRepository, never())
                .findForUpdate(any());
    }

    @Test
    void remainingBalanceCombinesPlanAndTopUp() {
        SecureConnectPlanAllowance allowance =
                allowance(3600L, 1200L);

        SecureConnectWallet wallet =
                wallet(900L);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(allowance));

        when(walletRepository.findForUpdate(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(wallet));

        var result =
                service.getRemainingBalance(
                        call.getId()
                );

        assertFalse(result.unlimited());
        assertEquals(2400L, result.planRemainingSeconds());
        assertEquals(900L, result.topUpRemainingSeconds());
        assertEquals(3300L, result.totalRemainingSeconds());

        verify(planAllowanceRepository).findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        );

        verify(walletRepository).findForUpdate(
                callerId,
                CallMediaType.AUDIO
        );

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository, never()).save(any());
        verify(ledgerRepository, never())
                .save(any(SecureConnectLedgerEntry.class));
    }

    @Test
    void remainingBalanceCanBeZero() {
        SecureConnectPlanAllowance allowance =
                allowance(3600L, 3600L);

        SecureConnectWallet wallet =
                wallet(0L);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(allowance));

        when(walletRepository.findForUpdate(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(wallet));

        var result =
                service.getRemainingBalance(
                        call.getId()
                );

        assertFalse(result.unlimited());
        assertEquals(0L, result.planRemainingSeconds());
        assertEquals(0L, result.topUpRemainingSeconds());
        assertEquals(0L, result.totalRemainingSeconds());

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository, never()).save(any());
        verify(ledgerRepository, never())
                .save(any(SecureConnectLedgerEntry.class));
    }

    @Test
    void platinumRemainingBalanceIsUnlimited() {
        membership.setPlan(MembershipPlan.PLATINUM);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(true);

        when(walletRepository.findByUserIdAndMediaType(
                callerId,
                CallMediaType.AUDIO
        )).thenReturn(
                Optional.of(
                        wallet(1200L)
                )
        );

        var result =
                service.getRemainingBalance(
                        call.getId()
                );

        assertTrue(result.unlimited());
        assertEquals(0L, result.planRemainingSeconds());
        assertEquals(1200L, result.topUpRemainingSeconds());
        assertEquals(
                Long.MAX_VALUE,
                result.totalRemainingSeconds()
        );

        verify(planAllowanceRepository, never())
                .findForUpdate(any(), any());

        verify(walletRepository, never())
                .findForUpdate(any(), any());

        verify(planAllowanceRepository, never()).save(any());
        verify(walletRepository, never()).save(any());
        verify(ledgerRepository, never())
                .save(any(SecureConnectLedgerEntry.class));
    }

    @Test
    void expiredBoundMembershipRetainsAccountingAccess() {
        membership.setExpiryDate(
                LocalDateTime.now().minusMinutes(1)
        );

        call.setConnectedAt(
                LocalDateTime.now().minusDays(1)
        );

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(
                Optional.of(allowance(1000L, 500L))
        );

        var balance = service.getRemainingBalance(
                call.getId()
        );

        assertFalse(balance.unlimited());
        assertEquals(
                500L,
                balance.planRemainingSeconds()
        );
    }

    private SecureConnectPlanAllowance allowance(
            long allowanceSeconds,
            long consumedSeconds
    ) {
        return SecureConnectPlanAllowance.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .membership(membership)
                .mediaType(CallMediaType.AUDIO)
                .allowanceSeconds(allowanceSeconds)
                .consumedSeconds(consumedSeconds)
                .build();
    }

    private SecureConnectWallet wallet(
            long balanceSeconds
    ) {
        return SecureConnectWallet.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .mediaType(CallMediaType.AUDIO)
                .balanceSeconds(balanceSeconds)
                .build();
    }

    private void assertUsageLedger(
            BalanceSource expectedSource,
            long expectedSeconds
    ) {
        ArgumentCaptor<SecureConnectLedgerEntry> captor =
                ArgumentCaptor.forClass(
                        SecureConnectLedgerEntry.class
                );

        verify(ledgerRepository)
                .save(captor.capture());

        SecureConnectLedgerEntry entry =
                captor.getValue();

        assertEquals(
                LedgerTransactionType.CALL_USAGE,
                entry.getTransactionType()
        );

        assertEquals(
                expectedSource,
                entry.getBalanceSource()
        );

        assertEquals(
                expectedSeconds,
                entry.getSeconds()
        );

        assertNotNull(
                entry.getIdempotencyKey()
        );
    }
}
