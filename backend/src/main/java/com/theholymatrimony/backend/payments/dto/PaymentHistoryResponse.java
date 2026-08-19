package com.theholymatrimony.backend.payments.dto;

import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PaymentHistoryResponse {

    private UUID id;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String plan;

    private String billingCycle;

    private Integer amountInPaise;

    private Double amountInRupees;

    private String currency;

    private PaymentStatus status;

    private PaymentSource paymentSource;

    private String paymentMethod;

    private String couponCode;

    /*
     * Successful Razorpay payments and successful coupon
     * activations both have downloadable receipts.
     */
    private Boolean receiptAvailable;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}
