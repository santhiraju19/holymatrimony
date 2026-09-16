package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecureConnectAuthorizationServiceImpl
        implements SecureConnectAuthorizationService {

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipEntitlementService membershipEntitlementService;
    private final PrivacyPolicyService privacyPolicyService;
    private final UserBlockRepository userBlockRepository;
    private final SecureConnectPlanAllowanceRepository planAllowanceRepository;
    private final SecureConnectWalletRepository walletRepository;

    @Override
    @Transactional(readOnly = true)
    public SecureConnectAuthorizationResponse authorizeInitiation(
            UUID callerUserId,
            UUID calleeUserId,
            CallMediaType mediaType
    ) {

        if (callerUserId == null
                || calleeUserId == null
                || mediaType == null) {

            return denied(
                    "INVALID_REQUEST",
                    "Caller, recipient and call type are required.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        if (callerUserId.equals(calleeUserId)) {
            return denied(
                    "SELF_CALL_NOT_ALLOWED",
                    "You cannot start a Secure Connect call with yourself.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        User caller = userRepository
                .findById(callerUserId)
                .orElse(null);

        if (caller == null) {
            return denied(
                    "CALLER_NOT_FOUND",
                    "Caller account was not found.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        if (!caller.isAccountActive()) {
            return denied(
                    "CALLER_ACCOUNT_INACTIVE",
                    "Your account is not active.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        User callee = userRepository
                .findById(calleeUserId)
                .orElse(null);

        if (callee == null) {
            return denied(
                    "RECIPIENT_NOT_FOUND",
                    "The member you are trying to call was not found.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        if (!callee.isAccountActive()) {
            return denied(
                    "RECIPIENT_ACCOUNT_INACTIVE",
                    "This member is currently unavailable for Secure Connect.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        boolean blocked =
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
                                callerUserId,
                                calleeUserId,
                                calleeUserId,
                                callerUserId
                        );

        if (blocked) {
            return denied(
                    "CALL_BLOCKED",
                    "Secure Connect is unavailable between these members.",
                    null,
                    null,
                    mediaType,
                    0L,
                    0L
            );
        }

        Membership membership = membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        callerUserId,
                        MembershipStatus.ACTIVE
                )
                .orElse(null);

        if (membership == null
                || membership.getPlan() == null
                || membership.getExpiryDate() == null
                || !membership.getExpiryDate().isAfter(LocalDateTime.now())) {

            long topUpRemainingSeconds =
                    getTopUpRemainingSeconds(
                            callerUserId,
                            mediaType
                    );

            return denied(
                    "ACTIVE_MEMBERSHIP_REQUIRED",
                    "An active membership is required to use Secure Connect.",
                    membership != null ? membership.getId() : null,
                    membership != null ? membership.getPlan() : null,
                    mediaType,
                    0L,
                    topUpRemainingSeconds
            );
        }

        MembershipPlan plan = membership.getPlan();

        MembershipFeature requiredFeature =
                requiredFeature(mediaType);

        if (!membershipEntitlementService.hasFeature(
                callerUserId,
                requiredFeature
        )) {

            long topUpRemainingSeconds =
                    getTopUpRemainingSeconds(
                            callerUserId,
                            mediaType
                    );

            String message =
                    mediaType == CallMediaType.AUDIO
                            ? "Your current membership does not include secure audio calling."
                            : "Secure video calling requires an active Gold or Platinum membership.";

            return denied(
                    "CALL_TYPE_NOT_INCLUDED",
                    message,
                    membership.getId(),
                    plan,
                    mediaType,
                    0L,
                    topUpRemainingSeconds
            );
        }

        boolean privacyAllowed =
                switch (mediaType) {
                    case AUDIO ->
                            privacyPolicyService
                                    .canStartAudioCall(
                                            caller,
                                            callee
                                    );

                    case VIDEO ->
                            privacyPolicyService
                                    .canStartVideoCall(
                                            caller,
                                            callee
                                    );
                };

        if (!privacyAllowed) {
            return denied(
                    "RECIPIENT_PRIVACY_RESTRICTED",
                    "This member's privacy settings do not currently allow this call.",
                    membership.getId(),
                    plan,
                    mediaType,
                    0L,
                    getTopUpRemainingSeconds(
                            callerUserId,
                            mediaType
                    )
            );
        }

        boolean unlimited =
                membershipEntitlementService.hasFeature(
                        callerUserId,
                        MembershipFeature.UNLIMITED_SECURE_CONNECT
                );

        long planRemainingSeconds =
                getPlanRemainingSeconds(
                        membership.getId(),
                        mediaType
                );

        long topUpRemainingSeconds =
                getTopUpRemainingSeconds(
                        callerUserId,
                        mediaType
                );

        if (unlimited) {
            return allowed(
                    membership,
                    mediaType,
                    true,
                    planRemainingSeconds,
                    topUpRemainingSeconds
            );
        }

        if (planRemainingSeconds > 0L
                || topUpRemainingSeconds > 0L) {

            return allowed(
                    membership,
                    mediaType,
                    false,
                    planRemainingSeconds,
                    topUpRemainingSeconds
            );
        }

        return denied(
                "INSUFFICIENT_CALL_BALANCE",
                "You do not have enough Secure Connect minutes remaining for this call type.",
                membership.getId(),
                plan,
                mediaType,
                0L,
                0L
        );
    }

    private MembershipFeature requiredFeature(
            CallMediaType mediaType
    ) {
        return switch (mediaType) {
            case AUDIO ->
                    MembershipFeature.AUDIO_CALL;

            case VIDEO ->
                    MembershipFeature.VIDEO_CALL;
        };
    }

    private long getPlanRemainingSeconds(
            UUID membershipId,
            CallMediaType mediaType
    ) {
        return planAllowanceRepository
                .findByMembershipIdAndMediaType(
                        membershipId,
                        mediaType
                )
                .map(SecureConnectPlanAllowance::getRemainingSeconds)
                .orElse(0L);
    }

    private long getTopUpRemainingSeconds(
            UUID userId,
            CallMediaType mediaType
    ) {
        return walletRepository
                .findByUserIdAndMediaType(
                        userId,
                        mediaType
                )
                .map(SecureConnectWallet::getBalanceSeconds)
                .orElse(0L);
    }

    private SecureConnectAuthorizationResponse allowed(
            Membership membership,
            CallMediaType mediaType,
            boolean unlimited,
            long planRemainingSeconds,
            long topUpRemainingSeconds
    ) {
        return new SecureConnectAuthorizationResponse(
                true,
                "ALLOWED",
                "Secure Connect call is allowed.",
                membership.getId(),
                membership.getPlan(),
                mediaType,
                unlimited,
                planRemainingSeconds,
                topUpRemainingSeconds
        );
    }

    private SecureConnectAuthorizationResponse denied(
            String code,
            String message,
            UUID membershipId,
            MembershipPlan plan,
            CallMediaType mediaType,
            long planRemainingSeconds,
            long topUpRemainingSeconds
    ) {
        return new SecureConnectAuthorizationResponse(
                false,
                code,
                message,
                membershipId,
                plan,
                mediaType,
                false,
                planRemainingSeconds,
                topUpRemainingSeconds
        );
    }
}
