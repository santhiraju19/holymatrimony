package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectAuthorizationResponse;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectCallResponse;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
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

        return toResponse(
                callSessionRepository.save(call)
        );
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

        return toResponse(
                callSessionRepository.save(call)
        );
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

        return toResponse(
                callSessionRepository.save(call)
        );
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

        return toResponse(
                callSessionRepository.save(call)
        );
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

        return toResponse(
                callSessionRepository.save(call)
        );
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
                && call.getAnsweredAt() != null) {
            long durationSeconds =
                    calculateDurationSeconds(
                            call.getAnsweredAt(),
                            now
                    );

            call.setDurationSeconds(durationSeconds);
        }

        call.setStatus(CallStatus.FAILED);
        call.setEndedAt(now);
        call.setUpdatedAt(now);

        return toResponse(
                callSessionRepository.save(call)
        );
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
         * Important:
         *
         * Do not hold the call-session lock here and then call
         * usageService.finalizeUsage(), because finalizeUsage()
         * acquires the same authoritative call lock itself.
         *
         * We first verify participant/state, calculate duration,
         * then let the usage engine perform the locked accounting.
         */
        SecureConnectCallSession call =
                callSessionRepository
                        .findById(callId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Secure Connect call was not found."
                                )
                        );

        requireParticipant(
                authenticatedUser,
                call
        );

        requireStatus(
                call,
                CallStatus.ACCEPTED,
                "Only a connected call can be ended."
        );

        if (call.getAnsweredAt() == null) {
            throw new IllegalStateException(
                    "Connected call does not have an answered time."
            );
        }

        LocalDateTime now = LocalDateTime.now();

        long durationSeconds =
                calculateDurationSeconds(
                        call.getAnsweredAt(),
                        now
                );

        /*
         * The accounting service validates and locks the call,
         * consumes plan allowance before top-up balance, and
         * provides idempotency protection.
         *
         * A minimum of one second avoids a zero-duration charge
         * request if both operations happen inside the same second.
         */
        long chargeableSeconds =
                Math.max(
                        1L,
                        durationSeconds
                );

        usageService.finalizeUsage(
                call.getId(),
                chargeableSeconds
        );

        /*
         * Re-acquire the authoritative row after accounting.
         */
        SecureConnectCallSession lockedCall =
                getCallForUpdate(callId);

        /*
         * Another completion path may eventually finalize the row
         * before we reacquire it. Accept ENDED as idempotent.
         */
        if (lockedCall.getStatus() == CallStatus.ENDED) {
            return toResponse(lockedCall);
        }

        requireStatus(
                lockedCall,
                CallStatus.ACCEPTED,
                "Only a connected call can be ended."
        );

        LocalDateTime endedAt = LocalDateTime.now();

        long finalDurationSeconds =
                calculateDurationSeconds(
                        lockedCall.getAnsweredAt(),
                        endedAt
                );

        lockedCall.setStatus(CallStatus.ENDED);
        lockedCall.setEndedAt(endedAt);
        lockedCall.setDurationSeconds(
                Math.max(
                        chargeableSeconds,
                        finalDurationSeconds
                )
        );
        lockedCall.setUpdatedAt(endedAt);

        return toResponse(
                callSessionRepository.save(
                        lockedCall
                )
        );
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

    private long calculateDurationSeconds(
            LocalDateTime answeredAt,
            LocalDateTime endedAt
    ) {
        if (answeredAt == null
                || endedAt == null
                || endedAt.isBefore(answeredAt)) {
            throw new IllegalStateException(
                    "Invalid Secure Connect call timing."
            );
        }

        return Math.max(
                0L,
                Duration.between(
                        answeredAt,
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
                call.getEndedAt(),
                call.getDurationSeconds()
        );
    }
}
