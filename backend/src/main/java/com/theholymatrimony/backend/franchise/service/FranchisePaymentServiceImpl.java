package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchisePaymentResponse;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Read-only franchise payment operations.
 *
 * Payment visibility is derived entirely from the authenticated franchise
 * user's active canonical district allocation.
 */
@Service
@RequiredArgsConstructor
public class FranchisePaymentServiceImpl
        implements FranchisePaymentService {

    private final FranchiseAccessService franchiseAccessService;

    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FranchisePaymentResponse> listPayments(
            String email
    ) {

        /*
         * Authorization order is intentional:
         *
         * 1. PAYMENTS_VIEW
         * 2. Active district allocation
         * 3. Server-derived canonical district
         * 4. District-scoped payment query
         *
         * No client-supplied franchise, allocation, district, territory,
         * profile, member, or user identifier participates in authorization.
         */

        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.PAYMENTS_VIEW
        );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        UUID districtId =
                allocation
                        .getDistrict()
                        .getId();

        return paymentRepository
                .findAllForFranchiseDistrict(
                        districtId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FranchisePaymentResponse toResponse(
            Payment payment
    ) {

        return new FranchisePaymentResponse(
                payment.getId(),
                payment.getCustomerName(),
                payment.getEmail(),
                payment.getPhone(),
                payment.getPlan(),
                payment.getBillingCycle(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getPaymentSource(),
                payment.getPaymentMethod(),
                payment.getCouponCode(),
                payment.getOriginalAmount(),
                payment.getDiscountAmount(),
                payment.getDiscountPercent(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getPaidAt(),
                payment.getCreatedAt(),
                payment.getUpdatedAt()
        );
    }
}
