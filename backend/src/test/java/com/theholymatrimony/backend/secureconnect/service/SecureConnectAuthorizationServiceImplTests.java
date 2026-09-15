package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.privacy.service.PrivacyPolicyService;
import com.theholymatrimony.backend.safety.repository.UserBlockRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectAuthorizationResponse;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectWallet;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectPlanAllowanceRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecureConnectAuthorizationServiceImplTests {

    private UserRepository userRepository;
    private MembershipRepository membershipRepository;
    private MembershipEntitlementService membershipEntitlementService;
    private PrivacyPolicyService privacyPolicyService;
    private UserBlockRepository userBlockRepository;
    private SecureConnectPlanAllowanceRepository planAllowanceRepository;
    private SecureConnectWalletRepository walletRepository;

    private SecureConnectAuthorizationServiceImpl service;

    private UUID callerId;
    private UUID calleeId;

    private User caller;
    private User callee;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        membershipRepository = mock(MembershipRepository.class);
        membershipEntitlementService =
                mock(MembershipEntitlementService.class);
        privacyPolicyService = mock(PrivacyPolicyService.class);
        userBlockRepository = mock(UserBlockRepository.class);
        planAllowanceRepository =
                mock(SecureConnectPlanAllowanceRepository.class);
        walletRepository = mock(SecureConnectWalletRepository.class);

        service = new SecureConnectAuthorizationServiceImpl(
                userRepository,
                membershipRepository,
                membershipEntitlementService,
                privacyPolicyService,
                userBlockRepository,
                planAllowanceRepository,
                walletRepository
        );

        callerId = UUID.randomUUID();
        calleeId = UUID.randomUUID();

        caller = activeUser(callerId);
        callee = activeUser(calleeId);

        when(userRepository.findById(callerId))
                .thenReturn(Optional.of(caller));

        when(userRepository.findById(calleeId))
                .thenReturn(Optional.of(callee));

        when(userBlockRepository
                .existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
                        callerId,
                        calleeId,
                        calleeId,
                        callerId
                ))
                .thenReturn(false);
    }

    @Test
    void silverCanInitiateAudioWhenPlanAllowanceExists() {
        Membership membership =
                activeMembership(MembershipPlan.SILVER);

        allowMembership(membership);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.AUDIO_CALL
        )).thenReturn(true);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(false);

        when(privacyPolicyService.canStartAudioCall(
                caller,
                callee
        )).thenReturn(true);

        when(planAllowanceRepository
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        CallMediaType.AUDIO
                ))
                .thenReturn(
                        Optional.of(
                                allowance(
                                        membership,
                                        CallMediaType.AUDIO,
                                        3600L,
                                        600L
                                )
                        )
                );

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.AUDIO
                );

        assertTrue(response.allowed());
        assertEquals("ALLOWED", response.code());
        assertEquals(MembershipPlan.SILVER, response.plan());
        assertFalse(response.unlimited());
        assertEquals(3000L, response.planRemainingSeconds());
    }

    @Test
    void silverCannotInitiateVideoEvenWithSavedVideoTopUp() {
        Membership membership =
                activeMembership(MembershipPlan.SILVER);

        allowMembership(membership);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.VIDEO_CALL
        )).thenReturn(false);

        when(walletRepository.findByUserIdAndMediaType(
                callerId,
                CallMediaType.VIDEO
        )).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.VIDEO,
                                1800L
                        )
                )
        );

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.VIDEO
                );

        assertFalse(response.allowed());
        assertEquals(
                "CALL_TYPE_NOT_INCLUDED",
                response.code()
        );
        assertEquals(1800L, response.topUpRemainingSeconds());
    }

    @Test
    void goldCanInitiateVideoUsingTopUpWhenPlanAllowanceIsEmpty() {
        Membership membership =
                activeMembership(MembershipPlan.GOLD);

        allowMembership(membership);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.VIDEO_CALL
        )).thenReturn(true);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(false);

        when(privacyPolicyService.canStartVideoCall(
                caller,
                callee
        )).thenReturn(true);

        when(planAllowanceRepository
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        CallMediaType.VIDEO
                ))
                .thenReturn(
                        Optional.of(
                                allowance(
                                        membership,
                                        CallMediaType.VIDEO,
                                        1800L,
                                        1800L
                                )
                        )
                );

        when(walletRepository.findByUserIdAndMediaType(
                callerId,
                CallMediaType.VIDEO
        )).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.VIDEO,
                                900L
                        )
                )
        );

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.VIDEO
                );

        assertTrue(response.allowed());
        assertEquals(0L, response.planRemainingSeconds());
        assertEquals(900L, response.topUpRemainingSeconds());
        assertFalse(response.unlimited());
    }

    @Test
    void platinumIsUnlimitedAndDoesNotRequireBalance() {
        Membership membership =
                activeMembership(MembershipPlan.PLATINUM);

        allowMembership(membership);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.VIDEO_CALL
        )).thenReturn(true);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(true);

        when(privacyPolicyService.canStartVideoCall(
                caller,
                callee
        )).thenReturn(true);

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.VIDEO
                );

        assertTrue(response.allowed());
        assertTrue(response.unlimited());
        assertEquals(MembershipPlan.PLATINUM, response.plan());
    }

    @Test
    void expiredMembershipDeniesCallingButPreservesTopUpBalance() {
        Membership membership =
                Membership.builder()
                        .id(UUID.randomUUID())
                        .user(caller)
                        .plan(MembershipPlan.GOLD)
                        .status(MembershipStatus.ACTIVE)
                        .startDate(LocalDateTime.now().minusMonths(2))
                        .expiryDate(LocalDateTime.now().minusMinutes(1))
                        .build();

        allowMembership(membership);

        when(walletRepository.findByUserIdAndMediaType(
                callerId,
                CallMediaType.VIDEO
        )).thenReturn(
                Optional.of(
                        wallet(
                                CallMediaType.VIDEO,
                                2400L
                        )
                )
        );

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.VIDEO
                );

        assertFalse(response.allowed());
        assertEquals(
                "ACTIVE_MEMBERSHIP_REQUIRED",
                response.code()
        );
        assertEquals(2400L, response.topUpRemainingSeconds());

        verify(walletRepository, never()).save(any());
    }

    @Test
    void blockedMembersCannotStartCall() {
        when(userBlockRepository
                .existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
                        callerId,
                        calleeId,
                        calleeId,
                        callerId
                ))
                .thenReturn(true);

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.AUDIO
                );

        assertFalse(response.allowed());
        assertEquals("CALL_BLOCKED", response.code());

        verifyNoInteractions(membershipEntitlementService);
        verifyNoInteractions(privacyPolicyService);
    }

    @Test
    void recipientPrivacyCanDenyCall() {
        Membership membership =
                activeMembership(MembershipPlan.GOLD);

        allowMembership(membership);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.AUDIO_CALL
        )).thenReturn(true);

        when(privacyPolicyService.canStartAudioCall(
                caller,
                callee
        )).thenReturn(false);

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.AUDIO
                );

        assertFalse(response.allowed());
        assertEquals(
                "RECIPIENT_PRIVACY_RESTRICTED",
                response.code()
        );
    }

    @Test
    void limitedPlanWithoutAllowanceOrTopUpIsDenied() {
        Membership membership =
                activeMembership(MembershipPlan.GOLD);

        allowMembership(membership);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.AUDIO_CALL
        )).thenReturn(true);

        when(membershipEntitlementService.hasFeature(
                callerId,
                MembershipFeature.UNLIMITED_SECURE_CONNECT
        )).thenReturn(false);

        when(privacyPolicyService.canStartAudioCall(
                caller,
                callee
        )).thenReturn(true);

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.AUDIO
                );

        assertFalse(response.allowed());
        assertEquals(
                "INSUFFICIENT_CALL_BALANCE",
                response.code()
        );
    }

    @Test
    void inactiveCallerCannotStartCall() {
        caller.setEnabled(false);

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.AUDIO
                );

        assertFalse(response.allowed());
        assertEquals(
                "CALLER_ACCOUNT_INACTIVE",
                response.code()
        );

        verifyNoInteractions(membershipRepository);
    }

    @Test
    void inactiveRecipientCannotReceiveNewCall() {
        callee.setStatus(UserStatus.SUSPENDED);
        callee.setEnabled(false);

        SecureConnectAuthorizationResponse response =
                service.authorizeInitiation(
                        callerId,
                        calleeId,
                        CallMediaType.AUDIO
                );

        assertFalse(response.allowed());
        assertEquals(
                "RECIPIENT_ACCOUNT_INACTIVE",
                response.code()
        );

        verifyNoInteractions(membershipRepository);
    }

    private User activeUser(UUID id) {
        return User.builder()
                .id(id)
                .fullName("Test User")
                .email(id + "@example.com")
                .password("test-password")
                .enabled(true)
                .status(UserStatus.ACTIVE)
                .build();
    }

    private Membership activeMembership(
            MembershipPlan plan
    ) {
        return Membership.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .plan(plan)
                .status(MembershipStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1))
                .expiryDate(LocalDateTime.now().plusDays(30))
                .build();
    }

    private void allowMembership(
            Membership membership
    ) {
        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        callerId,
                        MembershipStatus.ACTIVE
                ))
                .thenReturn(Optional.of(membership));
    }

    private SecureConnectPlanAllowance allowance(
            Membership membership,
            CallMediaType mediaType,
            long allowanceSeconds,
            long consumedSeconds
    ) {
        return SecureConnectPlanAllowance.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .membership(membership)
                .mediaType(mediaType)
                .allowanceSeconds(allowanceSeconds)
                .consumedSeconds(consumedSeconds)
                .build();
    }

    private SecureConnectWallet wallet(
            CallMediaType mediaType,
            long balanceSeconds
    ) {
        return SecureConnectWallet.builder()
                .id(UUID.randomUUID())
                .user(caller)
                .mediaType(mediaType)
                .balanceSeconds(balanceSeconds)
                .build();
    }
}
