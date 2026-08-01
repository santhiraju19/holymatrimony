package com.theholymatrimony.backend.payments.dto;

import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentHistoryResponse {

    private Long id;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String plan;

    private String billingCycle;

    private Integer amountInPaise;

    private Double amountInRupees;

    private String currency;

    private PaymentStatus status;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}