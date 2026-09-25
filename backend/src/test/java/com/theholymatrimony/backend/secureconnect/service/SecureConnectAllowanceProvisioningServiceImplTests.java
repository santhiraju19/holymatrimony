package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectLedgerEntry;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.enums.BalanceSource;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.LedgerTransactionType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectLedgerRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectPlanAllowanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class SecureConnectAllowanceProvisioningServiceImplTests {

    private SecureConnectPlanAllowanceRepository allowanceRepository;
    private SecureConnectLedgerRepository ledgerRepository;

    private SecureConnectAllowanceProvisioningServiceImpl service;

    private User user;

    @BeforeEach
    void setUp() {

        allowanceRepository =
                mock(SecureConnectPlanAllowanceRepository.class);

        ledgerRepository =
                mock(SecureConnectLedgerRepository.class);

        service =
                new SecureConnectAllowanceProvisioningServiceImpl(
                        allowanceRepository,
                        ledgerRepository
                );

        user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Member")
                        .email("member@example.com")
                        .password("password")
                        .enabled(true)
                        .build();

        when(allowanceRepository
                .findByMembershipIdAndMediaType(
                        any(UUID.class),
                        any(CallMediaType.class)
                ))
                .thenReturn(Optional.empty());

        when(ledgerRepository.existsByIdempotencyKey(anyString()))
                .thenReturn(false);
    }

    @Test
    void silverGets120MinutesAudioOnly() {

        Membership membership =
                membership(MembershipPlan.SILVER);

        service.provisionForMembership(membership);

        ArgumentCaptor<SecureConnectPlanAllowance> allowanceCaptor =
                ArgumentCaptor.forClass(
                        SecureConnectPlanAllowance.class
                );

        verify(allowanceRepository, times(1))
                .save(allowanceCaptor.capture());

        SecureConnectPlanAllowance allowance =
                allowanceCaptor.getValue();

        assertEquals(
                CallMediaType.AUDIO,
                allowance.getMediaType()
        );

        assertEquals(
                7200L,
                allowance.getAllowanceSeconds()
        );

        assertEquals(
                0L,
                allowance.getConsumedSeconds()
        );

        verify(allowanceRepository, never())
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        CallMediaType.VIDEO
                );

        assertSinglePlanCredit(
                membership,
                CallMediaType.AUDIO,
                7200L
        );
    }

    @Test
    void goldGetsSeparate60MinuteAudioAndVideoAllowances() {

        Membership membership =
                membership(MembershipPlan.GOLD);

        service.provisionForMembership(membership);

        ArgumentCaptor<SecureConnectPlanAllowance> allowanceCaptor =
                ArgumentCaptor.forClass(
                        SecureConnectPlanAllowance.class
                );

        verify(allowanceRepository, times(2))
                .save(allowanceCaptor.capture());

        var allowances =
                allowanceCaptor.getAllValues();

        assertEquals(2, allowances.size());

        SecureConnectPlanAllowance audio =
                allowances.stream()
                        .filter(a ->
                                a.getMediaType()
                                        == CallMediaType.AUDIO
                        )
                        .findFirst()
                        .orElseThrow();

        SecureConnectPlanAllowance video =
                allowances.stream()
                        .filter(a ->
                                a.getMediaType()
                                        == CallMediaType.VIDEO
                        )
                        .findFirst()
                        .orElseThrow();

        assertEquals(
                3600L,
                audio.getAllowanceSeconds()
        );

        assertEquals(
                3600L,
                video.getAllowanceSeconds()
        );

        assertEquals(
                0L,
                audio.getConsumedSeconds()
        );

        assertEquals(
                0L,
                video.getConsumedSeconds()
        );

        ArgumentCaptor<SecureConnectLedgerEntry> ledgerCaptor =
                ArgumentCaptor.forClass(
                        SecureConnectLedgerEntry.class
                );

        verify(ledgerRepository, times(2))
                .save(ledgerCaptor.capture());

        var entries =
                ledgerCaptor.getAllValues();

        assertTrue(
                entries.stream().anyMatch(
                        entry ->
                                entry.getMediaType()
                                        == CallMediaType.AUDIO
                                        && entry.getSeconds()
                                        == 3600L
                )
        );

        assertTrue(
                entries.stream().anyMatch(
                        entry ->
                                entry.getMediaType()
                                        == CallMediaType.VIDEO
                                        && entry.getSeconds()
                                        == 3600L
                )
        );

        for (SecureConnectLedgerEntry entry : entries) {

            assertEquals(
                    LedgerTransactionType.PLAN_CREDIT,
                    entry.getTransactionType()
            );

            assertEquals(
                    BalanceSource.PLAN,
                    entry.getBalanceSource()
            );

            assertEquals(
                    membership.getId(),
                    entry.getMembership().getId()
            );

            assertEquals(
                    user.getId(),
                    entry.getUser().getId()
            );

            assertNotNull(
                    entry.getIdempotencyKey()
            );
        }
    }

    @Test
    void platinumCreatesNoFiniteAllowance() {

        Membership membership =
                membership(MembershipPlan.PLATINUM);

        service.provisionForMembership(membership);

        verifyNoInteractions(
                allowanceRepository,
                ledgerRepository
        );
    }

    @Test
    void freeCreatesNoSecureConnectAllowance() {

        Membership membership =
                membership(MembershipPlan.FREE);

        service.provisionForMembership(membership);

        verifyNoInteractions(
                allowanceRepository,
                ledgerRepository
        );
    }

    @Test
    void existingAllowanceIsNotProvisionedAgain() {

        Membership membership =
                membership(MembershipPlan.SILVER);

        SecureConnectPlanAllowance existing =
                SecureConnectPlanAllowance.builder()
                        .user(user)
                        .membership(membership)
                        .mediaType(CallMediaType.AUDIO)
                        .allowanceSeconds(7200L)
                        .consumedSeconds(120L)
                        .build();

        when(allowanceRepository
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        CallMediaType.AUDIO
                ))
                .thenReturn(Optional.of(existing));

        service.provisionForMembership(membership);

        verify(allowanceRepository, never())
                .save(any());

        verify(ledgerRepository, never())
                .save(any());
    }

    private Membership membership(
            MembershipPlan plan
    ) {

        return Membership.builder()
                .id(UUID.randomUUID())
                .user(user)
                .plan(plan)
                .build();
    }

    private void assertSinglePlanCredit(
            Membership membership,
            CallMediaType mediaType,
            long seconds
    ) {

        ArgumentCaptor<SecureConnectLedgerEntry> captor =
                ArgumentCaptor.forClass(
                        SecureConnectLedgerEntry.class
                );

        verify(ledgerRepository, times(1))
                .save(captor.capture());

        SecureConnectLedgerEntry entry =
                captor.getValue();

        assertEquals(
                user.getId(),
                entry.getUser().getId()
        );

        assertEquals(
                membership.getId(),
                entry.getMembership().getId()
        );

        assertEquals(
                mediaType,
                entry.getMediaType()
        );

        assertEquals(
                LedgerTransactionType.PLAN_CREDIT,
                entry.getTransactionType()
        );

        assertEquals(
                BalanceSource.PLAN,
                entry.getBalanceSource()
        );

        assertEquals(
                seconds,
                entry.getSeconds()
        );

        assertNotNull(
                entry.getIdempotencyKey()
        );
    }
}
