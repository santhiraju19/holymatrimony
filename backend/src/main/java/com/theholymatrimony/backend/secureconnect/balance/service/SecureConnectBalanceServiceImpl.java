package com.theholymatrimony.backend.secureconnect.balance.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectBalanceResponse;
import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectWallet;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectPlanAllowanceRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecureConnectBalanceServiceImpl
        implements SecureConnectBalanceService {

    private final UserRepository userRepository;

    private final MembershipRepository membershipRepository;

    private final SecureConnectPlanAllowanceRepository
            planAllowanceRepository;

    private final SecureConnectWalletRepository
            walletRepository;

    @Override
    public SecureConnectMediaBalanceResponse getBalanceForMembership(
            User user,
            Membership membership,
            CallMediaType mediaType
    ) {
        if (user == null
                || user.getId() == null
                || membership == null
                || membership.getId() == null
                || membership.getUser() == null
                || !user.getId().equals(membership.getUser().getId())
                || membership.getPlan() == null
                || membership.getPlan() == MembershipPlan.FREE
                || membership.getStatus() != MembershipStatus.ACTIVE
                || !membership.isActive()
                || mediaType == null) {
            throw new IllegalStateException(
                    "A valid caller membership and media type are required."
            );
        }

        return buildForMembership(
                user,
                membership,
                membership.getPlan(),
                mediaType
        );
    }

    @Override
    @Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.MANDATORY
    )
    public SecureConnectMediaBalanceResponse getLockedBalanceForMembership(
            User user,
            Membership membership,
            CallMediaType mediaType
    ) {
        if (user == null
                || user.getId() == null
                || membership == null
                || membership.getId() == null
                || membership.getUser() == null
                || !user.getId().equals(membership.getUser().getId())
                || membership.getPlan() == null
                || membership.getPlan() == MembershipPlan.FREE
                || membership.getStatus() != MembershipStatus.ACTIVE
                || !membership.isActive()
                || mediaType == null) {
            throw new IllegalStateException(
                    "A valid caller membership and media type are required."
            );
        }

        MembershipPlan plan = membership.getPlan();

        boolean canInitiate = canInitiate(plan, mediaType);
        boolean unlimited =
                plan == MembershipPlan.PLATINUM && canInitiate;

        // Match usage charging's lock order: plan, then wallet.
        SecureConnectPlanAllowance allowance = unlimited
                ? null
                : planAllowanceRepository.findForUpdate(
                        membership.getId(),
                        mediaType
                ).orElse(null);

        SecureConnectWallet wallet = walletRepository.findForUpdate(
                user.getId(),
                mediaType
        ).orElse(null);

        long topUpRemaining = wallet == null
                ? 0L
                : Math.max(0L, wallet.getBalanceSeconds());

        if (unlimited) {
            return new SecureConnectMediaBalanceResponse(
                    mediaType,
                    true,
                    true,
                    0L,
                    0L,
                    0L,
                    topUpRemaining,
                    Long.MAX_VALUE
            );
        }

        long allowanceSeconds = allowance == null
                ? 0L
                : Math.max(0L, allowance.getAllowanceSeconds());

        long consumedSeconds = allowance == null
                ? 0L
                : Math.max(0L, allowance.getConsumedSeconds());

        long planRemaining = allowance == null
                ? 0L
                : Math.max(0L, allowance.getRemainingSeconds());

        return new SecureConnectMediaBalanceResponse(
                mediaType,
                canInitiate,
                false,
                allowanceSeconds,
                consumedSeconds,
                planRemaining,
                topUpRemaining,
                safeAdd(planRemaining, topUpRemaining)
        );
    }

    @Override
    public SecureConnectBalanceResponse getBalance(
            String authenticatedEmail
    ) {

        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        User user =
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

        Membership membership =
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
                        .filter(
                                Membership::isActive
                        )
                        .orElse(null);

        /*
         * No active paid membership:
         *
         * Keep purchased wallet balances visible, but initiation
         * remains disabled until an eligible active membership
         * exists.
         *
         * Purchased top-up minutes do not expire with membership.
         */

        if (membership == null) {

            return new SecureConnectBalanceResponse(
                    MembershipPlan.FREE,
                    false,
                    buildWithoutMembership(
                            user,
                            CallMediaType.AUDIO
                    ),
                    buildWithoutMembership(
                            user,
                            CallMediaType.VIDEO
                    )
            );
        }

        MembershipPlan plan =
                membership.getPlan();

        return new SecureConnectBalanceResponse(
                plan,
                true,
                buildForMembership(
                        user,
                        membership,
                        plan,
                        CallMediaType.AUDIO
                ),
                buildForMembership(
                        user,
                        membership,
                        plan,
                        CallMediaType.VIDEO
                )
        );
    }

    private SecureConnectMediaBalanceResponse
    buildWithoutMembership(
            User user,
            CallMediaType mediaType
    ) {

        long topUpRemaining =
                getWalletBalance(
                        user.getId(),
                        mediaType
                );

        return new SecureConnectMediaBalanceResponse(
                mediaType,
                false,
                false,
                0L,
                0L,
                0L,
                topUpRemaining,
                topUpRemaining
        );
    }

    private SecureConnectMediaBalanceResponse
    buildForMembership(
            User user,
            Membership membership,
            MembershipPlan plan,
            CallMediaType mediaType
    ) {

        boolean canInitiate =
                canInitiate(
                        plan,
                        mediaType
                );

        boolean unlimited =
                plan == MembershipPlan.PLATINUM &&
                canInitiate;

        long topUpRemaining =
                getWalletBalance(
                        user.getId(),
                        mediaType
                );

        /*
         * Platinum is unlimited.
         *
         * Existing wallet credit is intentionally preserved but
         * not required while Platinum is active.
         */

        if (unlimited) {

            return new SecureConnectMediaBalanceResponse(
                    mediaType,
                    true,
                    true,
                    0L,
                    0L,
                    0L,
                    topUpRemaining,
                    Long.MAX_VALUE
            );
        }

        SecureConnectPlanAllowance allowance =
                planAllowanceRepository
                        .findByMembershipIdAndMediaType(
                                membership.getId(),
                                mediaType
                        )
                        .orElse(null);

        long allowanceSeconds =
                allowance == null
                        ? 0L
                        : Math.max(
                                0L,
                                allowance.getAllowanceSeconds()
                        );

        long consumedSeconds =
                allowance == null
                        ? 0L
                        : Math.max(
                                0L,
                                allowance.getConsumedSeconds()
                        );

        long planRemaining =
                allowance == null
                        ? 0L
                        : allowance.getRemainingSeconds();

        long totalRemaining =
                safeAdd(
                        planRemaining,
                        topUpRemaining
                );

        return new SecureConnectMediaBalanceResponse(
                mediaType,
                canInitiate,
                false,
                allowanceSeconds,
                consumedSeconds,
                planRemaining,
                topUpRemaining,
                totalRemaining
        );
    }

    private long getWalletBalance(
            java.util.UUID userId,
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
                .map(
                        value ->
                                Math.max(
                                        0L,
                                        value
                                )
                )
                .orElse(0L);
    }

    private boolean canInitiate(
            MembershipPlan plan,
            CallMediaType mediaType
    ) {

        if (plan == null) {
            return false;
        }

        return switch (plan) {

            case SILVER ->
                    mediaType == CallMediaType.AUDIO;

            case GOLD,
                 PLATINUM ->
                    true;

            case FREE ->
                    false;
        };
    }

    private long safeAdd(
            long first,
            long second
    ) {

        if (
                Long.MAX_VALUE - first < second
        ) {
            return Long.MAX_VALUE;
        }

        return first + second;
    }
}
