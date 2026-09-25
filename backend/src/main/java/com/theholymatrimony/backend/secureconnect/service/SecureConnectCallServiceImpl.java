package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectAuthorizationResponse;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectCallResponse;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageBalance;
import com.theholymatrimony.backend.secureconnect.balance.service.SecureConnectBalanceService;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import com.theholymatrimony.backend.secureconnect.realtime.SecureConnectRealtimePublisher;
import com.theholymatrimony.backend.secureconnect.termination.SecureConnectMediaTerminationQueue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecureConnectCallServiceImpl
        implements SecureConnectCallService {

    private final UserRepository userRepository;
    private final SecureConnectCallSessionRepository callSessionRepository;
    private final SecureConnectAuthorizationService authorizationService;
    private final SecureConnectUsageService usageService;
    private final SecureConnectRealtimePublisher realtimePublisher;
    private final SecureConnectMediaTerminationQueue terminationQueue;

    private final MembershipRepository membershipRepository;
    private final SecureConnectBalanceService balanceService;

    @Override
    @Transactional
    public SecureConnectCallResponse initiateCall(
            String callerEmail,
            UUID calleeUserId,
            CallMediaType mediaType
    ) {
        User caller = getUserByEmail(callerEmail);

        if (calleeUserId == null) {
            throw new IllegalArgumentException(
                    "Recipient user ID is required."
            );
        }

        if (mediaType == null) {
            throw new IllegalArgumentException(
                    "Call type is required."
            );
        }

        SecureConnectAuthorizationResponse authorization =
                authorizationService.authorizeInitiation(
                        caller.getId(),
                        calleeUserId,
                        mediaType
                );

        if (!authorization.allowed()) {
            throw new IllegalStateException(
                    authorization.message()
            );
        }

        User callee = userRepository
                .findById(calleeUserId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Recipient account was not found."
                        )
                );

        boolean hasActiveOutgoingCall =
                callSessionRepository
                        .existsByCallerIdAndStatusIn(
                                caller.getId(),
                                java.util.List.of(
                                        CallStatus.RINGING,
                                        CallStatus.ACCEPTED
                                )
                        );

        if (hasActiveOutgoingCall) {
            throw new IllegalStateException(
                    "You already have an active outgoing Secure Connect call."
            );
        }

        boolean alreadyRinging =
                callSessionRepository
                        .existsByCallerIdAndCalleeIdAndStatus(
                                caller.getId(),
                                callee.getId(),
                                CallStatus.RINGING
                        );

        if (alreadyRinging) {
            throw new IllegalStateException(
                    "A Secure Connect call is already ringing for this member."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        SecureConnectCallSession call =
                SecureConnectCallSession.builder()
                        .caller(caller)
                        .callee(callee)
                        .mediaType(mediaType)
                        .status(CallStatus.RINGING)
                        .initiatedAt(now)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        realtimePublisher.publishIncomingCall(savedCall);

        return toResponse(savedCall);
    }

    @Override
    @Transactional
    public SecureConnectCallResponse acceptCall(
            String authenticatedEmail,
            UUID callId
    ) {
        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        SecureConnectCallSession call =
                getCallForUpdate(callId);

        requireCallee(
                authenticatedUser,
                call,
                "Only the recipient can accept this call."
        );

        requireStatus(
                call,
                CallStatus.RINGING,
                "Only a ringing call can be accepted."
        );

        LocalDateTime now = LocalDateTime.now();

        call.setStatus(CallStatus.ACCEPTED);
        call.setAnsweredAt(now);
        call.setUpdatedAt(now);

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        realtimePublisher.publishAcceptedCall(savedCall);

        return toResponse(savedCall);
    }

    @Override
    @Transactional
    public SecureConnectCallResponse markConnected(
            String authenticatedEmail,
            UUID callId
    ) {
        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        SecureConnectCallSession call =
                getCallForUpdate(callId);

        requireParticipant(
                authenticatedUser,
                call
        );

        requireStatus(
                call,
                CallStatus.ACCEPTED,
                "Only an accepted call can be marked as connected."
        );

        /*
         * Media-connected reporting is intentionally idempotent.
         * Both participants may independently observe the WebRTC
         * connection becoming active and report it to the backend.
         * The first report establishes the authoritative timestamp.
         */
        if (call.getConnectedAt() == null) {

            // Serialize first connection with membership activation.
            userRepository.findForUpdate(call.getCaller().getId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Caller account was not found."
                    ));

            LocalDateTime connectedAt = LocalDateTime.now();

            Membership membership = membershipRepository
                    .findFirstByUserIdAndStatusOrderByStartDateDesc(
                            call.getCaller().getId(),
                            MembershipStatus.ACTIVE
                    )
                    .orElseThrow(() -> new IllegalStateException(
                            "An active membership is required to connect."
                    ));

            if (membership.getId() == null
                    || membership.getUser() == null
                    || !call.getCaller().getId().equals(
                            membership.getUser().getId()
                    )
                    || membership.getPlan() == null
                    || membership.getPlan() == MembershipPlan.FREE
                    || membership.getStartDate() == null
                    || membership.getStartDate().isAfter(connectedAt)
                    || membership.getExpiryDate() == null
                    || !membership.getExpiryDate().isAfter(connectedAt)
                    || (call.getMediaType() == CallMediaType.VIDEO
                        && membership.getPlan() == MembershipPlan.SILVER)) {
                throw new IllegalStateException(
                        "The caller's membership does not permit this connection."
                );
            }

            SecureConnectMediaBalanceResponse availableBalance =
                    balanceService.getLockedBalanceForMembership(
                            call.getCaller(),
                            membership,
                            call.getMediaType()
                    );

            if (availableBalance == null
                    || !availableBalance.isCanInitiate()
                    || (!availableBalance.isUnlimited()
                        && availableBalance.getTotalRemainingSeconds() <= 0L)) {
                throw new IllegalStateException(
                        "No available Secure Connect calling minutes."
                );
            }

            call.setConnectedMembership(membership);
            call.setConnectedAt(connectedAt);
            call.setUpdatedAt(connectedAt);

            call = callSessionRepository.save(call);
        }

        return toResponse(call);
    }

    @Override
    @Transactional
    public SecureConnectCallResponse declineCall(
            String authenticatedEmail,
            UUID callId
    ) {
        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        SecureConnectCallSession call =
                getCallForUpdate(callId);

        requireCallee(
                authenticatedUser,
                call,
                "Only the recipient can decline this call."
        );

        requireStatus(
                call,
                CallStatus.RINGING,
                "Only a ringing call can be declined."
        );

        finishWithoutUsage(
                call,
                CallStatus.DECLINED
        );

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        terminationQueue.enqueue(savedCall);

        realtimePublisher.publishDeclinedCall(savedCall);

        return toResponse(savedCall);
    }

    @Override
    @Transactional
    public SecureConnectCallResponse cancelCall(
            String authenticatedEmail,
            UUID callId
    ) {
        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        SecureConnectCallSession call =
                getCallForUpdate(callId);

        requireCaller(
                authenticatedUser,
                call,
                "Only the caller can cancel this call."
        );

        requireStatus(
                call,
                CallStatus.RINGING,
                "Only a ringing call can be cancelled."
        );

        finishWithoutUsage(
                call,
                CallStatus.CANCELLED
        );

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        terminationQueue.enqueue(savedCall);

        realtimePublisher.publishCancelledCall(savedCall);

        return toResponse(savedCall);
    }

    @Override
    @Transactional
    public SecureConnectCallResponse markMissed(
            UUID callId
    ) {
        SecureConnectCallSession call =
                getCallForUpdate(callId);

        requireStatus(
                call,
                CallStatus.RINGING,
                "Only a ringing call can be marked as missed."
        );

        finishWithoutUsage(
                call,
                CallStatus.MISSED
        );

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        terminationQueue.enqueue(savedCall);

        realtimePublisher.publishMissedCall(savedCall);

        return toResponse(savedCall);
    }

    @Override
    @Transactional
    public boolean markMissedIfStillRinging(
            UUID callId
    ) {
        if (callId == null) {
            return false;
        }

        SecureConnectCallSession call =
                callSessionRepository
                        .findForUpdate(callId)
                        .orElse(null);

        if (call == null
                || call.getStatus()
                != CallStatus.RINGING) {
            return false;
        }

        finishWithoutUsage(
                call,
                CallStatus.MISSED
        );

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        terminationQueue.enqueue(savedCall);

        realtimePublisher.publishMissedCall(
                savedCall
        );

        return true;
    }

    @Override
    @Transactional
    public boolean endIfBalanceExhausted(
            UUID callId
    ) {
        if (callId == null) {
            return false;
        }

        SecureConnectCallSession call =
                callSessionRepository.findForUpdate(callId)
                        .orElse(null);

        /*
         * A normal participant /end request may have won the race.
         * In that case the scheduler must do nothing.
         */
        if (call == null
                || call.getStatus() != CallStatus.ACCEPTED
                || call.getConnectedAt() == null
                || call.getEndedAt() != null) {
            return false;
        }

        if (call.getConnectedMembership() == null
                || call.getConnectedMembership().getExpiryDate() == null) {
            throw new IllegalStateException(
                    "Connected call membership is missing."
            );
        }

        SecureConnectUsageBalance balance =
                usageService.getRemainingBalance(callId);

        LocalDateTime connectedAt = call.getConnectedAt();

        LocalDateTime boundary =
                calculateTerminationBoundary(call, balance);

        if (LocalDateTime.now().isBefore(boundary)) {
            return false;
        }

        long permittedSeconds = Math.max(
                0L,
                java.time.Duration.between(
                        connectedAt,
                        boundary
                ).getSeconds()
        );

        if (permittedSeconds > 0L) {
            usageService.finalizeUsage(
                    callId,
                    permittedSeconds
            );
        }

        call.setEndedAt(boundary);
        call.setDurationSeconds(permittedSeconds);
        call.setStatus(CallStatus.ENDED);

        SecureConnectCallSession saved =
                callSessionRepository.save(call);

        terminationQueue.enqueue(saved);

        realtimePublisher.publishServerEndedCall(saved);

        return true;
    }

    @Override
    @Transactional
    public SecureConnectCallResponse failCall(
            UUID callId
    ) {
        SecureConnectCallSession call =
                getCallForUpdate(callId);

        if (call.getStatus() != CallStatus.RINGING
                && call.getStatus() != CallStatus.ACCEPTED) {
            throw new IllegalStateException(
                    "Only a ringing or connected call can be marked as failed."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        if (call.getStatus() == CallStatus.ACCEPTED
                && call.getConnectedAt() != null) {

            SecureConnectUsageBalance balance =
                    usageService.getRemainingBalance(call.getId());

            LocalDateTime boundary =
                    calculateTerminationBoundary(call, balance);

            LocalDateTime effectiveEnd =
                    now.isBefore(boundary)
                            ? now
                            : boundary;

            long chargeableSeconds = Math.max(
                    0L,
                    calculateDurationSeconds(
                            call.getConnectedAt(),
                            effectiveEnd
                    )
            );

            if (chargeableSeconds == 0L
                    && effectiveEnd.isAfter(call.getConnectedAt())
                    && (balance.unlimited()
                        || balance.totalRemainingSeconds() > 0L)
                    && !boundary.isBefore(
                            call.getConnectedAt().plusSeconds(1)
                    )) {
                chargeableSeconds = 1L;
            }

            if (chargeableSeconds > 0L) {
                usageService.finalizeUsage(
                        call.getId(),
                        chargeableSeconds
                );
            }

            call.setDurationSeconds(chargeableSeconds);
            call.setStatus(CallStatus.FAILED);
            call.setEndedAt(effectiveEnd);
            call.setUpdatedAt(now);

        } else {
            /*
             * Ringing calls and accepted calls that never established
             * media consumed no Secure Connect allowance.
             */
            call.setDurationSeconds(0L);
            call.setStatus(CallStatus.FAILED);
            call.setEndedAt(now);
            call.setUpdatedAt(now);
        }

        SecureConnectCallSession savedCall =
                callSessionRepository.save(call);

        terminationQueue.enqueue(savedCall);

        realtimePublisher.publishFailedCall(savedCall);

        return toResponse(savedCall);
    }

    @Override
    @Transactional
    public SecureConnectCallResponse endCall(
            String authenticatedEmail,
            UUID callId
    ) {
        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        /*
         * endCall() and usageService.finalizeUsage() both use
         * Spring's default REQUIRED transaction propagation.
         *
         * Therefore finalizeUsage() participates in this same
         * transaction. Acquiring the authoritative call lock here
         * is safe, and any later findForUpdate() performed by the
         * usage service is performed by the same transaction.
         *
         * This is important because markConnected() also locks the
         * same call row. /connected and /end therefore serialize
         * against each other and connectedAt is always evaluated
         * from the authoritative locked state.
         */
        SecureConnectCallSession call =
                getCallForUpdate(callId);

        requireParticipant(
                authenticatedUser,
                call
        );

        /*
         * Ending an already-ended call is intentionally idempotent.
         */
        if (call.getStatus() == CallStatus.ENDED) {
            realtimePublisher.publishEndedCall(
                    call,
                    authenticatedUser
            );

            return toResponse(call);
        }

        requireStatus(
                call,
                CallStatus.ACCEPTED,
                "Only an accepted call can be ended."
        );

        /*
         * answeredAt means that the callee accepted the call.
         * connectedAt means that real WebRTC media was established.
         *
         * Accepted-but-never-connected calls are not chargeable.
         */
        if (call.getConnectedAt() == null) {
            LocalDateTime endedAt =
                    LocalDateTime.now();

            call.setStatus(CallStatus.ENDED);
            call.setEndedAt(endedAt);
            call.setDurationSeconds(0L);
            call.setUpdatedAt(endedAt);

            SecureConnectCallSession savedCall =
                    callSessionRepository.save(call);

            terminationQueue.enqueue(savedCall);

            realtimePublisher.publishEndedCall(
                    savedCall,
                    authenticatedUser
            );

            return toResponse(savedCall);
        }

        SecureConnectUsageBalance balance =
                usageService.getRemainingBalance(call.getId());

        LocalDateTime accountingAt = LocalDateTime.now();

        LocalDateTime boundary =
                calculateTerminationBoundary(call, balance);

        LocalDateTime effectiveEnd =
                accountingAt.isBefore(boundary)
                        ? accountingAt
                        : boundary;

        long chargeableSeconds = Math.max(
                0L,
                calculateDurationSeconds(
                        call.getConnectedAt(),
                        effectiveEnd
                )
        );

        /*
         * Connected calls ending within their first second
         * consume one second only when at least one full
         * permitted second remains.
         */
        if (chargeableSeconds == 0L
                && effectiveEnd.isAfter(call.getConnectedAt())
                && (balance.unlimited()
                    || balance.totalRemainingSeconds() > 0L)
                && !boundary.isBefore(
                        call.getConnectedAt().plusSeconds(1)
                )) {
            chargeableSeconds = 1L;
        }

        if (chargeableSeconds > 0L) {
            usageService.finalizeUsage(
                    call.getId(),
                    chargeableSeconds
            );
        }

        call.setStatus(CallStatus.ENDED);
        call.setEndedAt(effectiveEnd);
        call.setDurationSeconds(chargeableSeconds);
        call.setUpdatedAt(accountingAt);

        call = callSessionRepository.save(call);

        terminationQueue.enqueue(call);

        realtimePublisher.publishEndedCall(
                call,
                authenticatedUser
        );

        return toResponse(call);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<SecureConnectCallResponse> getCallHistory(
            String authenticatedEmail
    ) {
        User authenticatedUser =
                getUserByEmail(authenticatedEmail);

        return callSessionRepository
                .findByCallerIdOrCalleeIdOrderByCreatedAtDesc(
                        authenticatedUser.getId(),
                        authenticatedUser.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private User getUserByEmail(
            String email
    ) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException(
                    "Authenticated user is required."
            );
        }

        return userRepository
                .findByEmail(
                        email.trim()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Authenticated user was not found."
                        )
                );
    }

    private SecureConnectCallSession getCallForUpdate(
            UUID callId
    ) {
        if (callId == null) {
            throw new IllegalArgumentException(
                    "Call ID is required."
            );
        }

        return callSessionRepository
                .findForUpdate(callId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Secure Connect call was not found."
                        )
                );
    }

    private void requireCaller(
            User authenticatedUser,
            SecureConnectCallSession call,
            String message
    ) {
        if (!call.getCaller()
                .getId()
                .equals(
                        authenticatedUser.getId()
                )) {
            throw new IllegalStateException(
                    message
            );
        }
    }

    private void requireCallee(
            User authenticatedUser,
            SecureConnectCallSession call,
            String message
    ) {
        if (!call.getCallee()
                .getId()
                .equals(
                        authenticatedUser.getId()
                )) {
            throw new IllegalStateException(
                    message
            );
        }
    }

    private void requireParticipant(
            User authenticatedUser,
            SecureConnectCallSession call
    ) {
        UUID authenticatedUserId =
                authenticatedUser.getId();

        boolean participant =
                call.getCaller()
                        .getId()
                        .equals(
                                authenticatedUserId
                        )
                        ||
                call.getCallee()
                        .getId()
                        .equals(
                                authenticatedUserId
                        );

        if (!participant) {
            throw new IllegalStateException(
                    "Only call participants can end this call."
            );
        }
    }

    private void requireStatus(
            SecureConnectCallSession call,
            CallStatus expected,
            String message
    ) {
        if (call.getStatus() != expected) {
            throw new IllegalStateException(
                    message
            );
        }
    }

    private void finishWithoutUsage(
            SecureConnectCallSession call,
            CallStatus status
    ) {
        LocalDateTime now =
                LocalDateTime.now();

        call.setStatus(status);
        call.setEndedAt(now);
        call.setDurationSeconds(0L);
        call.setUpdatedAt(now);
    }

    /**
     * Calculates the latest permitted media termination time.
     *
     * Balance represents the available seconds for this call,
     * measured from its authoritative connectedAt timestamp.
     *
     * Platinum has unlimited minutes, but its membership still
     * has an expiry date.
     */
    private LocalDateTime calculateTerminationBoundary(
            SecureConnectCallSession call,
            SecureConnectUsageBalance balance
    ) {
        if (call.getConnectedAt() == null
                || call.getConnectedMembership() == null
                || call.getConnectedMembership().getExpiryDate() == null) {
            throw new IllegalStateException(
                    "Connected call membership timing is missing."
            );
        }

        LocalDateTime connectedAt = call.getConnectedAt();

        LocalDateTime boundary =
                call.getConnectedMembership().getExpiryDate();

        if (!balance.unlimited()) {
            long availableSeconds = Math.max(
                    0L,
                    balance.totalRemainingSeconds()
            );

            LocalDateTime balanceBoundary =
                    connectedAt.plusSeconds(availableSeconds);

            if (balanceBoundary.isBefore(boundary)) {
                boundary = balanceBoundary;
            }
        }

        return boundary.isBefore(connectedAt)
                ? connectedAt
                : boundary;
    }

    private long calculateDurationSeconds(
            LocalDateTime connectedAt,
            LocalDateTime endedAt
    ) {
        if (connectedAt == null
                || endedAt == null
                || endedAt.isBefore(connectedAt)) {
            throw new IllegalStateException(
                    "Invalid Secure Connect call timing."
            );
        }

        return Math.max(
                0L,
                Duration.between(
                        connectedAt,
                        endedAt
                ).getSeconds()
        );
    }

    private SecureConnectCallResponse toResponse(
            SecureConnectCallSession call
    ) {
        return new SecureConnectCallResponse(
                call.getId(),
                call.getCaller().getId(),
                call.getCallee().getId(),
                call.getMediaType(),
                call.getStatus(),
                call.getInitiatedAt(),
                call.getAnsweredAt(),
                call.getConnectedAt(),
                call.getEndedAt(),
                call.getDurationSeconds()
        );
    }
}
