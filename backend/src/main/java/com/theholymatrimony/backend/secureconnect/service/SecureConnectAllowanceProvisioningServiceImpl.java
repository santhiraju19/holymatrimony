package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectLedgerEntry;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.enums.BalanceSource;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.enums.LedgerTransactionType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectLedgerRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectPlanAllowanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecureConnectAllowanceProvisioningServiceImpl
        implements SecureConnectAllowanceProvisioningService {

    private static final long SILVER_AUDIO_SECONDS = 120L * 60L;

    private static final long GOLD_AUDIO_SECONDS = 60L * 60L;
    private static final long GOLD_VIDEO_SECONDS = 60L * 60L;

    private static final String PLAN_CREDIT_PREFIX =
            "SECURE_CONNECT_PLAN_CREDIT:";

    private final SecureConnectPlanAllowanceRepository allowanceRepository;
    private final SecureConnectLedgerRepository ledgerRepository;

    @Override
    @Transactional
    public void provisionForMembership(Membership membership) {

        if (membership == null
                || membership.getId() == null
                || membership.getUser() == null
                || membership.getUser().getId() == null
                || membership.getPlan() == null) {

            throw new IllegalArgumentException(
                    "A valid membership is required to provision Secure Connect allowances."
            );
        }

        long multiplier = billingCycleMultiplier(
                membership.getBillingCycle()
        );

        switch (membership.getPlan()) {

            case SILVER -> provisionAllowance(
                    membership,
                    CallMediaType.AUDIO,
                    SILVER_AUDIO_SECONDS * multiplier
            );

            case GOLD -> {
                provisionAllowance(
                        membership,
                        CallMediaType.AUDIO,
                        GOLD_AUDIO_SECONDS * multiplier
                );

                provisionAllowance(
                        membership,
                        CallMediaType.VIDEO,
                        GOLD_VIDEO_SECONDS * multiplier
                );
            }

            case PLATINUM -> {
                /*
                 * Platinum uses the UNLIMITED_SECURE_CONNECT entitlement.
                 *
                 * No finite plan allowance is created and purchased
                 * top-up wallet balances remain untouched.
                 */
            }

            case FREE -> {
                /*
                 * Free membership has no Secure Connect allowance.
                 */
            }
        }
    }

    private long billingCycleMultiplier(
            BillingCycle billingCycle
    ) {
        if (billingCycle == null) {
            throw new IllegalArgumentException(
                    "Membership billing cycle is required."
            );
        }

        return switch (billingCycle) {
            case MONTHLY -> 1L;
            case QUARTERLY -> 3L;
            case YEARLY -> 12L;
        };
    }

    private void provisionAllowance(
            Membership membership,
            CallMediaType mediaType,
            long allowanceSeconds
    ) {

        if (allowanceSeconds <= 0L) {
            return;
        }

        if (allowanceRepository
                .findByMembershipIdAndMediaType(
                        membership.getId(),
                        mediaType
                )
                .isPresent()) {

            return;
        }

        User user = membership.getUser();

        SecureConnectPlanAllowance allowance =
                SecureConnectPlanAllowance.builder()
                        .user(user)
                        .membership(membership)
                        .mediaType(mediaType)
                        .allowanceSeconds(allowanceSeconds)
                        .consumedSeconds(0L)
                        .build();

        allowanceRepository.save(allowance);

        savePlanCreditLedger(
                user,
                membership,
                mediaType,
                allowanceSeconds
        );
    }

    private void savePlanCreditLedger(
            User user,
            Membership membership,
            CallMediaType mediaType,
            long seconds
    ) {

        String idempotencyKey =
                PLAN_CREDIT_PREFIX
                        + membership.getId()
                        + ":"
                        + mediaType.name();

        if (ledgerRepository.existsByIdempotencyKey(idempotencyKey)) {
            return;
        }

        SecureConnectLedgerEntry ledgerEntry =
                SecureConnectLedgerEntry.builder()
                        .user(user)
                        .membership(membership)
                        .payment(membership.getPayment())
                        .mediaType(mediaType)
                        .transactionType(
                                LedgerTransactionType.PLAN_CREDIT
                        )
                        .balanceSource(
                                BalanceSource.PLAN
                        )
                        .seconds(seconds)
                        .idempotencyKey(idempotencyKey)
                        .note(buildPlanCreditNote(
                                membership.getPlan(),
                                mediaType,
                                seconds
                        ))
                        .build();

        ledgerRepository.save(ledgerEntry);
    }

    private String buildPlanCreditNote(
            MembershipPlan plan,
            CallMediaType mediaType,
            long seconds
    ) {

        long minutes = seconds / 60L;

        return "Secure Connect "
                + plan.name()
                + " membership allowance: "
                + minutes
                + " "
                + mediaType.name().toLowerCase()
                + " minutes.";
    }
}
