package com.theholymatrimony.backend.admin.membership.service;

import com.theholymatrimony.backend.admin.membership.dto.AdminMembershipPageResponse;
import com.theholymatrimony.backend.admin.membership.dto.AdminMembershipResponse;

import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminMembershipService {

    private final MembershipRepository
            membershipRepository;

    public AdminMembershipPageResponse getMemberships(
            int page,
            int size,
            String search,
            MembershipStatus status,
            MembershipPlan plan
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                Math.min(
                        Math.max(
                                size,
                                1
                        ),
                        100
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<Membership> memberships =
                membershipRepository
                        .searchAdminMemberships(
                                normalizeSearch(search),
                                status,
                                plan,
                                pageable
                        );

        return AdminMembershipPageResponse
                .builder()
                .content(
                        memberships
                                .getContent()
                                .stream()
                                .map(this::map)
                                .toList()
                )
                .page(
                        memberships.getNumber()
                )
                .size(
                        memberships.getSize()
                )
                .totalElements(
                        memberships.getTotalElements()
                )
                .totalPages(
                        memberships.getTotalPages()
                )
                .first(
                        memberships.isFirst()
                )
                .last(
                        memberships.isLast()
                )
                .build();
    }

    public AdminMembershipResponse getMembership(
            UUID membershipId
    ) {

        Membership membership =
                membershipRepository
                        .findAdminMembershipById(
                                membershipId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Membership was not found."
                                        )
                        );

        return map(
                membership
        );
    }

    private AdminMembershipResponse map(
            Membership membership
    ) {

        MembershipStatus effectiveStatus =
                resolveEffectiveStatus(
                        membership
                );

        return AdminMembershipResponse
                .builder()
                .membershipId(
                        membership.getId()
                )
                .userId(
                        membership
                                .getUser()
                                .getId()
                )
                .fullName(
                        membership
                                .getUser()
                                .getFullName()
                )
                .email(
                        membership
                                .getUser()
                                .getEmail()
                )
                .mobile(
                        membership
                                .getUser()
                                .getMobile()
                )
                .plan(
                        membership.getPlan()
                )
                .billingCycle(
                        membership.getBillingCycle()
                )
                .status(
                        effectiveStatus
                )
                .startDate(
                        membership.getStartDate()
                )
                .expiryDate(
                        membership.getExpiryDate()
                )
                .daysRemaining(
                        calculateDaysRemaining(
                                membership.getExpiryDate(),
                                effectiveStatus
                        )
                )
                .autoRenew(
                        Boolean.TRUE.equals(
                                membership.getAutoRenew()
                        )
                )
                .paymentId(
                        membership.getPayment() == null
                                ? null
                                : membership
                                        .getPayment()
                                        .getId()
                )
                .createdAt(
                        membership.getCreatedAt()
                )
                .updatedAt(
                        membership.getUpdatedAt()
                )
                .build();
    }

    private MembershipStatus resolveEffectiveStatus(
            Membership membership
    ) {

        if (
                membership.getStatus()
                        != MembershipStatus.ACTIVE
        ) {
            return membership.getStatus();
        }

        LocalDateTime expiryDate =
                membership.getExpiryDate();

        if (
                expiryDate == null
                        || !expiryDate.isAfter(
                                LocalDateTime.now()
                        )
        ) {
            return MembershipStatus.EXPIRED;
        }

        return MembershipStatus.ACTIVE;
    }

    private long calculateDaysRemaining(
            LocalDateTime expiryDate,
            MembershipStatus status
    ) {

        if (
                expiryDate == null
                        || status
                        != MembershipStatus.ACTIVE
        ) {
            return 0L;
        }

        long days =
                ChronoUnit.DAYS.between(
                        LocalDateTime.now(),
                        expiryDate
                );

        return Math.max(
                days,
                0L
        );
    }

    private String normalizeSearch(
            String search
    ) {

        if (
                search == null
                        || search.isBlank()
        ) {
            return null;
        }

        return search.trim();
    }
}