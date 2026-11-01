package com.theholymatrimony.backend.franchise.dto;

import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Read-only franchise-facing payment representation.
 *
 * Payments returned by the franchise API are already restricted to the
 * authenticated franchise user's active canonical district scope.
 *
 * Internal authorization identifiers such as franchise ID, allocation ID,
 * canonical district ID, profile ID, and user ID are intentionally not
 * exposed.
 */
public record FranchisePaymentResponse(
        UUID paymentId,
        String customerName,
        String email,
        String phone,
        String plan,
        String billingCycle,
        Integer amount,
        String currency,
        PaymentStatus status,
        PaymentSource paymentSource,
        String paymentMethod,
        String couponCode,
        Integer originalAmount,
        Integer discountAmount,
        Integer discountPercent,
        String razorpayOrderId,
        String razorpayPaymentId,
        LocalDateTime paidAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
