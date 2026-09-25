package com.theholymatrimony.backend.secureconnect.balance.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectBalanceResponse;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectWallet;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectPlanAllowanceRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecureConnectBalanceServiceImplTests {

    private static final String EMAIL =
            "member@example.com";

    private UserRepository userRepository;

    private MembershipRepository membershipRepository;

    private SecureConnectPlanAllowanceRepository
            planAllowanceRepository;

    private SecureConnectWalletRepository
            walletRepository;

    private SecureConnectBalanceServiceImpl service;

    private User user;

    @BeforeEach
    void setUp() {

        userRepository =
                mock(UserRepository.class);

        membershipRepository =
                mock(MembershipRepository.class);

        planAllowanceRepository =
                mock(
                        SecureConnectPlanAllowanceRepository.class
                );

        walletRepository =
                mock(
                        SecureConnectWalletRepository.class
                );

        service =
                new SecureConnectBalanceServiceImpl(
                        userRepository,
                        membershipRepository,
                        planAllowanceRepository,
                        walletRepository
                );

        user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Secure Connect Member")
                        .email(EMAIL)
                        .password("unused")
                        .build();

        when(
                userRepository.findByEmail(
                        EMAIL
                )
        ).thenReturn(
                Optional.of(user)
        );
    }



    @Test
    void lockedBalanceReturnsZeroWhenMinutesAreExhausted() {
        Membership membership = membership(MembershipPlan.GOLD);

        when(membership.getUser()).thenReturn(user);
        when(membership.getStatus())
                .thenReturn(MembershipStatus.ACTIVE);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(
                allowance(membership, CallMediaType.AUDIO, 3600L, 3600L)
        ));

        when(walletRepository.findForUpdate(
                user.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.empty());

        var result = service.getLockedBalanceForMembership(
                user,
                membership,
                CallMediaType.AUDIO
        );

        assertTrue(result.isCanInitiate());
        assertFalse(result.isUnlimited());
        assertEquals(0L, result.getPlanRemainingSeconds());
        assertEquals(0L, result.getTopUpRemainingSeconds());
        assertEquals(0L, result.getTotalRemainingSeconds());

        var order = inOrder(
                planAllowanceRepository,
                walletRepository
        );

        order.verify(planAllowanceRepository).findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        );

        order.verify(walletRepository).findForUpdate(
                user.getId(),
                CallMediaType.AUDIO
        );
    }

    @Test
    void lockedBalanceSupportsUnlimitedPlatinum() {
        Membership membership = membership(MembershipPlan.PLATINUM);

        when(membership.getUser()).thenReturn(user);
        when(membership.getStatus())
                .thenReturn(MembershipStatus.ACTIVE);

        when(walletRepository.findForUpdate(
                user.getId(),
                CallMediaType.VIDEO
        )).thenReturn(Optional.empty());

        var result = service.getLockedBalanceForMembership(
                user,
                membership,
                CallMediaType.VIDEO
        );

        assertTrue(result.isCanInitiate());
        assertTrue(result.isUnlimited());
        assertEquals(Long.MAX_VALUE, result.getTotalRemainingSeconds());

        verifyNoInteractions(planAllowanceRepository);

        verify(walletRepository).findForUpdate(
                user.getId(),
                CallMediaType.VIDEO
        );
    }

    @Test
    void lockedBalanceUsesPlanThenWalletLocks() {
        Membership membership = membership(MembershipPlan.GOLD);

        when(membership.getUser()).thenReturn(user);
        when(membership.getStatus())
                .thenReturn(MembershipStatus.ACTIVE);

        when(planAllowanceRepository.findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(
                allowance(membership, CallMediaType.AUDIO, 3600L, 600L)
        ));

        when(walletRepository.findForUpdate(
                user.getId(),
                CallMediaType.AUDIO
        )).thenReturn(Optional.of(
                wallet(CallMediaType.AUDIO, 300L)
        ));

        var result = service.getLockedBalanceForMembership(
                user,
                membership,
                CallMediaType.AUDIO
        );

        assertTrue(result.isCanInitiate());
        assertFalse(result.isUnlimited());
        assertEquals(3600L, result.getPlanAllowanceSeconds());
        assertEquals(600L, result.getPlanConsumedSeconds());
        assertEquals(3000L, result.getPlanRemainingSeconds());
        assertEquals(300L, result.getTopUpRemainingSeconds());
        assertEquals(3300L, result.getTotalRemainingSeconds());

        var order = inOrder(
                planAllowanceRepository,
                walletRepository
        );

        order.verify(planAllowanceRepository).findForUpdate(
                membership.getId(),
                CallMediaType.AUDIO
        );

        order.verify(walletRepository).findForUpdate(
                user.getId(),
                CallMediaType.AUDIO
        );

        verify(planAllowanceRepository, never())
                .findByMembershipIdAndMediaType(any(), any());

        verify(walletRepository, never())
                .findByUserIdAndMediaType(any(), any());
    }

    @Test
    void silverShows120MinuteAudioAllowanceAndCannotInitiateVideo() {

        Membership membership =
                membership(
                        MembershipPlan.SILVER
                );

        activeMembership(
                membership
        );

        when(
                planAllowanceRepository
                        .findByMembershipIdAndMediaType(
                                membership.getId(),
                                CallMediaType.AUDIO
                        )
        ).thenReturn(
                Optional.of(
                        allowance(
                                membership,
                                CallMediaType.AUDIO,
                                7200L,
                                1800L
                        )
                )
        );

        when(
                walletRepository
                        .findByUserIdAndMediaType(
                                user.getId(),
                                CallMediaType.AUDIO
                        )
        ).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.AUDIO,
                                900L
                        )
                )
        );

        SecureConnectBalanceResponse response =
                service.getBalance(
                        EMAIL
                );

        assertEquals(
                MembershipPlan.SILVER,
                response.getPlan()
        );

        assertTrue(
                response.isActiveMembership()
        );

        assertTrue(
                response.getAudio().isCanInitiate()
        );

        assertFalse(
                response.getAudio().isUnlimited()
        );

        assertEquals(
                7200L,
                response.getAudio()
                        .getPlanAllowanceSeconds()
        );

        assertEquals(
                1800L,
                response.getAudio()
                        .getPlanConsumedSeconds()
        );

        assertEquals(
                5400L,
                response.getAudio()
                        .getPlanRemainingSeconds()
        );

        assertEquals(
                900L,
                response.getAudio()
                        .getTopUpRemainingSeconds()
        );

        assertEquals(
                6300L,
                response.getAudio()
                        .getTotalRemainingSeconds()
        );

        assertFalse(
                response.getVideo().isCanInitiate()
        );

        assertFalse(
                response.getVideo().isUnlimited()
        );

        assertEquals(
                0L,
                response.getVideo()
                        .getPlanRemainingSeconds()
        );
    }

    @Test
    void goldKeepsAudioAndVideoBalancesSeparate() {

        Membership membership =
                membership(
                        MembershipPlan.GOLD
                );

        activeMembership(
                membership
        );

        when(
                planAllowanceRepository
                        .findByMembershipIdAndMediaType(
                                membership.getId(),
                                CallMediaType.AUDIO
                        )
        ).thenReturn(
                Optional.of(
                        allowance(
                                membership,
                                CallMediaType.AUDIO,
                                3600L,
                                600L
                        )
                )
        );

        when(
                planAllowanceRepository
                        .findByMembershipIdAndMediaType(
                                membership.getId(),
                                CallMediaType.VIDEO
                        )
        ).thenReturn(
                Optional.of(
                        allowance(
                                membership,
                                CallMediaType.VIDEO,
                                3600L,
                                1200L
                        )
                )
        );

        when(
                walletRepository
                        .findByUserIdAndMediaType(
                                user.getId(),
                                CallMediaType.AUDIO
                        )
        ).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.AUDIO,
                                300L
                        )
                )
        );

        when(
                walletRepository
                        .findByUserIdAndMediaType(
                                user.getId(),
                                CallMediaType.VIDEO
                        )
        ).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.VIDEO,
                                600L
                        )
                )
        );

        SecureConnectBalanceResponse response =
                service.getBalance(
                        EMAIL
                );

        assertEquals(
                MembershipPlan.GOLD,
                response.getPlan()
        );

        assertTrue(
                response.getAudio().isCanInitiate()
        );

        assertTrue(
                response.getVideo().isCanInitiate()
        );

        assertEquals(
                3000L,
                response.getAudio()
                        .getPlanRemainingSeconds()
        );

        assertEquals(
                300L,
                response.getAudio()
                        .getTopUpRemainingSeconds()
        );

        assertEquals(
                3300L,
                response.getAudio()
                        .getTotalRemainingSeconds()
        );

        assertEquals(
                2400L,
                response.getVideo()
                        .getPlanRemainingSeconds()
        );

        assertEquals(
                600L,
                response.getVideo()
                        .getTopUpRemainingSeconds()
        );

        assertEquals(
                3000L,
                response.getVideo()
                        .getTotalRemainingSeconds()
        );
    }

    @Test
    void platinumReportsUnlimitedAudioAndVideo() {

        Membership membership =
                membership(
                        MembershipPlan.PLATINUM
                );

        activeMembership(
                membership
        );

        SecureConnectBalanceResponse response =
                service.getBalance(
                        EMAIL
                );

        assertEquals(
                MembershipPlan.PLATINUM,
                response.getPlan()
        );

        assertTrue(
                response.getAudio().isCanInitiate()
        );

        assertTrue(
                response.getVideo().isCanInitiate()
        );

        assertTrue(
                response.getAudio().isUnlimited()
        );

        assertTrue(
                response.getVideo().isUnlimited()
        );

        assertEquals(
                Long.MAX_VALUE,
                response.getAudio()
                        .getTotalRemainingSeconds()
        );

        assertEquals(
                Long.MAX_VALUE,
                response.getVideo()
                        .getTotalRemainingSeconds()
        );

        verify(
                planAllowanceRepository,
                never()
        ).findByMembershipIdAndMediaType(
                any(),
                any()
        );
    }

    @Test
    void noActiveMembershipKeepsWalletVisibleButDisablesInitiation() {

        when(
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.empty()
        );

        when(
                walletRepository
                        .findByUserIdAndMediaType(
                                user.getId(),
                                CallMediaType.AUDIO
                        )
        ).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.AUDIO,
                                1800L
                        )
                )
        );

        when(
                walletRepository
                        .findByUserIdAndMediaType(
                                user.getId(),
                                CallMediaType.VIDEO
                        )
        ).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.VIDEO,
                                600L
                        )
                )
        );

        SecureConnectBalanceResponse response =
                service.getBalance(
                        EMAIL
                );

        assertEquals(
                MembershipPlan.FREE,
                response.getPlan()
        );

        assertFalse(
                response.isActiveMembership()
        );

        assertFalse(
                response.getAudio().isCanInitiate()
        );

        assertFalse(
                response.getVideo().isCanInitiate()
        );

        assertEquals(
                1800L,
                response.getAudio()
                        .getTopUpRemainingSeconds()
        );

        assertEquals(
                600L,
                response.getVideo()
                        .getTopUpRemainingSeconds()
        );
    }

    private void activeMembership(
            Membership membership
    ) {

        when(
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.of(membership)
        );
    }

    private Membership membership(
            MembershipPlan plan
    ) {

        Membership membership =
                mock(Membership.class);

        when(
                membership.getId()
        ).thenReturn(
                UUID.randomUUID()
        );

        when(
                membership.getPlan()
        ).thenReturn(
                plan
        );

        when(
                membership.isActive()
        ).thenReturn(
                true
        );

        return membership;
    }

    private SecureConnectPlanAllowance allowance(
            Membership membership,
            CallMediaType mediaType,
            long allowanceSeconds,
            long consumedSeconds
    ) {

        return SecureConnectPlanAllowance
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                .membership(membership)
                .mediaType(mediaType)
                .allowanceSeconds(
                        allowanceSeconds
                )
                .consumedSeconds(
                        consumedSeconds
                )
                .build();
    }

    private SecureConnectWallet wallet(
            CallMediaType mediaType,
            long balanceSeconds
    ) {

        return SecureConnectWallet
                .builder()
                .id(UUID.randomUUID())
                .user(user)
                .mediaType(mediaType)
                .balanceSeconds(
                        balanceSeconds
                )
                .build();
    }
}
