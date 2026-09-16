package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.membership.entitlement.MembershipEntitlementService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeature;
import com.theholymatrimony.backend.payments.entity.Membership;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecureConnectUsageServiceImpl
        implements SecureConnectUsageService {

    private static final String IDEMPOTENCY_PREFIX =
            "CALL_USAGE:";

    private final SecureConnectCallSessionRepository callSessionRepository;
    private final SecureConnectLedgerRepository ledgerRepository;
    private final SecureConnectPlanAllowanceRepository planAllowanceRepository;
    private final SecureConnectWalletRepository walletRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipEntitlementService membershipEntitlementService;

    @Override
    @Transactional
    public SecureConnectUsageResult finalizeUsage(
            UUID callSessionId,
            long connectedDurationSeconds
    ) {

        if (callSessionId == null) {
            throw new IllegalArgumentException(
                    "Call session ID is required."
            );
        }

        if (connectedDurationSeconds <= 0L) {
            throw new IllegalArgumentException(
                    "Connected duration must be greater than zero."
            );
        }

        SecureConnectCallSession call =
                callSessionRepository.findForUpdate(callSessionId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Secure Connect call session was not found."
                                )
                        );

        User caller = call.getCaller();

        if (caller == null || caller.getId() == null) {
            throw new IllegalStateException(
                    "Secure Connect call does not have a valid caller."
            );
        }

        if (call.getMediaType() == null) {
            throw new IllegalStateException(
                    "Secure Connect call does not have a media type."
            );
        }

        if (call.getStatus() != CallStatus.ACCEPTED
                && call.getStatus() != CallStatus.ENDED) {

            throw new IllegalStateException(
                    "Only connected Secure Connect calls can finalize usage."
            );
        }

        UUID callerId = caller.getId();
        CallMediaType mediaType = call.getMediaType();

        List<SecureConnectLedgerEntry> existingEntries =
                ledgerRepository
                        .findByCallSessionIdOrderByCreatedAtAsc(
                                callSessionId
                        );

        boolean alreadyFinalized =
                existingEntries.stream()
                        .anyMatch(
                                entry ->
                                        entry.getTransactionType()
                                                == LedgerTransactionType.CALL_USAGE
                        );

        if (alreadyFinalized) {
            return buildAlreadyFinalizedResult(
                    call,
                    callerId,
                    mediaType,
                    connectedDurationSeconds,
                    existingEntries
            );
        }

        Membership membership =
                membershipRepository
                        .findFirstByUserIdAndStatusOrderByStartDateDesc(
                                callerId,
                                MembershipStatus.ACTIVE
                        )
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "An active membership is required to finalize Secure Connect usage."
                                )
                        );

        if (!membership.isActive()) {
            throw new IllegalStateException(
                    "An active membership is required to finalize Secure Connect usage."
            );
        }

        boolean unlimited =
                membershipEntitlementService.hasFeature(
                        callerId,
                        MembershipFeature.UNLIMITED_SECURE_CONNECT
                );

        if (unlimited) {
            saveUsageLedger(
                    caller,
                    call,
                    membership,
                    mediaType,
                    BalanceSource.NONE,
                    connectedDurationSeconds,
                    unlimitedKey(callSessionId),
                    "Unlimited Secure Connect call usage."
            );

            updateCallDuration(
                    call,
                    connectedDurationSeconds
            );

            return new SecureConnectUsageResult(
                    callSessionId,
                    callerId,
                    mediaType,
                    connectedDurationSeconds,
                    0L,
                    0L,
                    0L,
                    true,
                    false,
                    getPlanRemainingSeconds(
                            membership.getId(),
                            mediaType
                    ),
                    getTopUpRemainingSeconds(
                            callerId,
                            mediaType
                    )
            );
        }

        SecureConnectPlanAllowance allowance =
                planAllowanceRepository
                        .findForUpdate(
                                membership.getId(),
                                mediaType
                        )
                        .orElse(null);

        SecureConnectWallet wallet =
                walletRepository
                        .findForUpdate(
                                callerId,
                                mediaType
                        )
                        .orElse(null);

        long planAvailable =
                allowance == null
                        ? 0L
                        : allowance.getRemainingSeconds();

        long topUpAvailable =
                wallet == null
                        ? 0L
                        : Math.max(
                                0L,
                                wallet.getBalanceSeconds()
                        );

        long totalAvailable =
                safeAdd(
                        planAvailable,
                        topUpAvailable
                );

        if (totalAvailable < connectedDurationSeconds) {
            throw new IllegalStateException(
                    "Insufficient Secure Connect balance to finalize this call."
            );
        }

        long planSecondsUsed =
                Math.min(
                        connectedDurationSeconds,
                        planAvailable
                );

        long topUpSecondsUsed =
                connectedDurationSeconds
                        - planSecondsUsed;

        if (planSecondsUsed > 0L) {
            allowance.setConsumedSeconds(
                    allowance.getConsumedSeconds()
                            + planSecondsUsed
            );

            planAllowanceRepository.save(allowance);

            saveUsageLedger(
                    caller,
                    call,
                    membership,
                    mediaType,
                    BalanceSource.PLAN,
                    planSecondsUsed,
                    planKey(callSessionId),
                    "Secure Connect usage charged to included plan allowance."
            );
        }

        if (topUpSecondsUsed > 0L) {
            if (wallet == null) {
                throw new IllegalStateException(
                        "Secure Connect top-up wallet was not found."
                );
            }

            wallet.setBalanceSeconds(
                    wallet.getBalanceSeconds()
                            - topUpSecondsUsed
            );

            walletRepository.save(wallet);

            saveUsageLedger(
                    caller,
                    call,
                    membership,
                    mediaType,
                    BalanceSource.TOPUP,
                    topUpSecondsUsed,
                    topUpKey(callSessionId),
                    "Secure Connect usage charged to purchased top-up balance."
            );
        }

        updateCallDuration(
                call,
                connectedDurationSeconds
        );

        return new SecureConnectUsageResult(
                callSessionId,
                callerId,
                mediaType,
                connectedDurationSeconds,
                connectedDurationSeconds,
                planSecondsUsed,
                topUpSecondsUsed,
                false,
                false,
                allowance == null
                        ? 0L
                        : allowance.getRemainingSeconds(),
                wallet == null
                        ? 0L
                        : wallet.getBalanceSeconds()
        );
    }

    private SecureConnectUsageResult buildAlreadyFinalizedResult(
            SecureConnectCallSession call,
            UUID callerId,
            CallMediaType mediaType,
            long requestedSeconds,
            List<SecureConnectLedgerEntry> existingEntries
    ) {

        long planSecondsUsed =
                existingEntries.stream()
                        .filter(
                                entry ->
                                        entry.getTransactionType()
                                                == LedgerTransactionType.CALL_USAGE
                        )
                        .filter(
                                entry ->
                                        entry.getBalanceSource()
                                                == BalanceSource.PLAN
                        )
                        .mapToLong(
                                entry ->
                                        Math.abs(entry.getSeconds())
                        )
                        .sum();

        long topUpSecondsUsed =
                existingEntries.stream()
                        .filter(
                                entry ->
                                        entry.getTransactionType()
                                                == LedgerTransactionType.CALL_USAGE
                        )
                        .filter(
                                entry ->
                                        entry.getBalanceSource()
                                                == BalanceSource.TOPUP
                        )
                        .mapToLong(
                                entry ->
                                        Math.abs(entry.getSeconds())
                        )
                        .sum();

        boolean unlimited =
                existingEntries.stream()
                        .anyMatch(
                                entry ->
                                        entry.getTransactionType()
                                                == LedgerTransactionType.CALL_USAGE
                                                && entry.getBalanceSource()
                                                == BalanceSource.NONE
                        );

        Membership membership =
                membershipRepository
                        .findFirstByUserIdAndStatusOrderByStartDateDesc(
                                callerId,
                                MembershipStatus.ACTIVE
                        )
                        .orElse(null);

        long planRemaining =
                membership == null
                        ? 0L
                        : getPlanRemainingSeconds(
                                membership.getId(),
                                mediaType
                        );

        long topUpRemaining =
                getTopUpRemainingSeconds(
                        callerId,
                        mediaType
                );

        long chargedSeconds =
                planSecondsUsed
                        + topUpSecondsUsed;

        return new SecureConnectUsageResult(
                call.getId(),
                callerId,
                mediaType,
                requestedSeconds,
                chargedSeconds,
                planSecondsUsed,
                topUpSecondsUsed,
                unlimited,
                true,
                planRemaining,
                topUpRemaining
        );
    }

    private void saveUsageLedger(
            User caller,
            SecureConnectCallSession call,
            Membership membership,
            CallMediaType mediaType,
            BalanceSource balanceSource,
            long secondsUsed,
            String idempotencyKey,
            String note
    ) {

        if (ledgerRepository.existsByIdempotencyKey(
                idempotencyKey
        )) {
            return;
        }

        SecureConnectLedgerEntry entry =
                SecureConnectLedgerEntry.builder()
                        .user(caller)
                        .callSession(call)
                        .membership(membership)
                        .mediaType(mediaType)
                        .transactionType(
                                LedgerTransactionType.CALL_USAGE
                        )
                        .balanceSource(balanceSource)
                        .seconds(-secondsUsed)
                        .idempotencyKey(idempotencyKey)
                        .note(note)
                        .build();

        ledgerRepository.save(entry);
    }

    private void updateCallDuration(
            SecureConnectCallSession call,
            long connectedDurationSeconds
    ) {
        call.setDurationSeconds(
                connectedDurationSeconds
        );

        if (call.getEndedAt() == null) {
            call.setEndedAt(
                    LocalDateTime.now()
            );
        }

        call.setStatus(
                CallStatus.ENDED
        );

        callSessionRepository.save(call);
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
                .map(
                        SecureConnectPlanAllowance::getRemainingSeconds
                )
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
                .map(
                        SecureConnectWallet::getBalanceSeconds
                )
                .orElse(0L);
    }

    private long safeAdd(
            long first,
            long second
    ) {
        if (first > Long.MAX_VALUE - second) {
            return Long.MAX_VALUE;
        }

        return first + second;
    }

    private String planKey(
            UUID callSessionId
    ) {
        return IDEMPOTENCY_PREFIX
                + callSessionId
                + ":PLAN";
    }

    private String topUpKey(
            UUID callSessionId
    ) {
        return IDEMPOTENCY_PREFIX
                + callSessionId
                + ":TOPUP";
    }

    private String unlimitedKey(
            UUID callSessionId
    ) {
        return IDEMPOTENCY_PREFIX
                + callSessionId
                + ":UNLIMITED";
    }
}
