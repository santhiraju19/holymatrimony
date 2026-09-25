package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse;
import com.theholymatrimony.backend.secureconnect.balance.service.SecureConnectBalanceService;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.safety.repository.UserBlockRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageBalance;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.provider.CallProvider;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class SecureConnectMediaServiceImpl
        implements SecureConnectMediaService {

    private final UserRepository userRepository;
    private final SecureConnectCallSessionRepository callSessionRepository;
    private final UserBlockRepository userBlockRepository;
    private final CallProvider callProvider;

    private final SecureConnectUsageService usageService;

    private final MembershipRepository membershipRepository;

    private final SecureConnectBalanceService balanceService;

    public SecureConnectMediaServiceImpl(
            UserRepository userRepository,
            SecureConnectCallSessionRepository callSessionRepository,
            UserBlockRepository userBlockRepository,
            CallProvider callProvider,
            SecureConnectUsageService usageService,
            MembershipRepository membershipRepository,
            SecureConnectBalanceService balanceService
    ) {
        this.userRepository =
                userRepository;

        this.callSessionRepository =
                callSessionRepository;

        this.userBlockRepository =
                userBlockRepository;

        this.callProvider =
                callProvider;

        this.usageService =
                usageService;

        this.membershipRepository =
                membershipRepository;

        this.balanceService =
                balanceService;
    }

    @Override
    @Transactional
    public SecureConnectMediaCredentials createCredentials(
            String authenticatedEmail,
            UUID callId
    ) {
        if (!StringUtils.hasText(
                authenticatedEmail
        )) {
            throw new IllegalArgumentException(
                    "Authenticated user is required."
            );
        }

        if (callId == null) {
            throw new IllegalArgumentException(
                    "Call ID is required."
            );
        }

        User authenticatedUser =
                userRepository
                        .findByEmail(
                                authenticatedEmail.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Authenticated user was not found."
                                        )
                        );

        SecureConnectCallSession call =
                callSessionRepository
                        .findForUpdate(callId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Secure Connect call was not found."
                                        )
                        );

        User caller =
                call.getCaller();

        User callee =
                call.getCallee();

        if (caller == null
                || callee == null
                || caller.getId() == null
                || callee.getId() == null) {
            throw new IllegalStateException(
                    "Secure Connect call participants are invalid."
            );
        }

        UUID authenticatedUserId =
                authenticatedUser.getId();

        boolean participant =
                caller
                        .getId()
                        .equals(
                                authenticatedUserId
                        )
                        ||
                        callee
                                .getId()
                                .equals(
                                        authenticatedUserId
                                );

        if (!participant) {
            throw new IllegalStateException(
                    "Only call participants can access Secure Connect media."
            );
        }

        if (call.getStatus()
                != CallStatus.ACCEPTED) {
            throw new IllegalStateException(
                    "Secure Connect media is available only after the call is accepted."
            );
        }

        /*
         * Recheck both account states immediately before issuing a
         * provider token. This closes access if either account was
         * deactivated, suspended or disabled after the call began.
         */
        if (!caller.isAccountActive()
                || !callee.isAccountActive()) {
            throw new IllegalStateException(
                    "Secure Connect media is unavailable because a participant account is inactive."
            );
        }

        /*
         * Blocking is bidirectional for Secure Connect. A block made
         * after ringing/acceptance must prevent new LiveKit credentials.
         */
        boolean blocked =
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
                                caller.getId(),
                                callee.getId(),
                                callee.getId(),
                                caller.getId()
                        );

        if (blocked) {
            throw new IllegalStateException(
                    "Secure Connect is unavailable between these members."
            );
        }

        /*
         * The call-row lock serializes this check with call termination.
         * Never issue another provider token after the connected call's
         * original membership or purchased-time boundary.
         *
         * Before media connects, connectedAt is null. Membership
         * validation for that transition belongs to markConnected().
         */
        LocalDateTime authorizationDeadline;

        if (call.getConnectedAt() == null) {
        // Lock the caller after the call row and before
        // membership, plan allowance and wallet authorization.
        userRepository.findForUpdate(caller.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Caller account was not found."
                ));


            Membership membership = membershipRepository
                    .findFirstByUserIdAndStatusOrderByStartDateDesc(
                            caller.getId(),
                            MembershipStatus.ACTIVE
                    )
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "An active paid membership is required for Secure Connect."
                            )
                    );

            LocalDateTime now = LocalDateTime.now();

            if (membership.getUser() == null
                    || !caller.getId().equals(
                            membership.getUser().getId()
                    )
                    || membership.getPlan() == null
                    || membership.getPlan() == MembershipPlan.FREE
                    || membership.getStartDate() == null
                    || membership.getExpiryDate() == null
                    || now.isBefore(membership.getStartDate())
                    || !now.isBefore(membership.getExpiryDate())) {
                throw new IllegalStateException(
                        "The caller's paid membership is not currently valid."
                );
            }

            if (call.getMediaType() == CallMediaType.VIDEO
                    && membership.getPlan() == MembershipPlan.SILVER) {
                throw new IllegalStateException(
                        "Silver members cannot initiate video calls."
                );
            }

            SecureConnectMediaBalanceResponse mediaBalance =
                    balanceService.getLockedBalanceForMembership(
                            caller,
                            membership,
                            call.getMediaType()
                    );

            if (!mediaBalance.isCanInitiate()
                    || (!mediaBalance.isUnlimited()
                    && mediaBalance.getTotalRemainingSeconds() <= 0L)) {
                throw new IllegalStateException(
                        "No available Secure Connect calling minutes."
                );
            }

            authorizationDeadline = membership.getExpiryDate();
        }

        else {
            if (call.getEndedAt() != null
                    || call.getConnectedMembership() == null
                    || call.getConnectedMembership().getExpiryDate() == null) {
                throw new IllegalStateException(
                        "Connected call membership or state is invalid."
                );
            }

            SecureConnectUsageBalance balance =
                    usageService.getRemainingBalance(callId);

            if (balance == null) {
                throw new IllegalStateException(
                        "Connected call balance is unavailable."
                );
            }

            LocalDateTime boundary =
                    call.getConnectedMembership().getExpiryDate();

            if (!balance.unlimited()) {
                if (balance.totalRemainingSeconds() <= 0L) {
                    throw new IllegalStateException(
                            "Secure Connect call time has been exhausted."
                    );
                }

                LocalDateTime paidBoundary =
                        call.getConnectedAt().plusSeconds(
                                balance.totalRemainingSeconds()
                        );

                if (paidBoundary.isBefore(boundary)) {
                    boundary = paidBoundary;
                }
            }

            if (!LocalDateTime.now().isBefore(boundary)) {
                throw new IllegalStateException(
                        "Secure Connect call time or membership has expired."
                );
            }

            authorizationDeadline = boundary;
        }

        String providerName =
                callProvider.providerName();

        String roomName =
                callProvider.roomName(call);

        if (StringUtils.hasText(
                call.getProvider()
        ) && !providerName.equals(
                call.getProvider()
        )) {
            throw new IllegalStateException(
                    "Secure Connect provider cannot be changed for an active call."
            );
        }

        if (StringUtils.hasText(
                call.getProviderRoomId()
        ) && !roomName.equals(
                call.getProviderRoomId()
        )) {
            throw new IllegalStateException(
                    "Secure Connect room cannot be changed for an active call."
            );
        }

        if (!StringUtils.hasText(
                call.getProvider()
        )) {
            call.setProvider(
                    providerName
            );
        }

        if (!StringUtils.hasText(
                call.getProviderRoomId()
        )) {
            call.setProviderRoomId(
                    roomName
            );
        }

        callSessionRepository.save(
                call
        );

        Instant tokenDeadline = authorizationDeadline
                .atZone(ZoneId.systemDefault())
                .toInstant();

        return callProvider
                .createParticipantCredentials(
                        call,
                        authenticatedUserId,
                        tokenDeadline
                );
    }
}
