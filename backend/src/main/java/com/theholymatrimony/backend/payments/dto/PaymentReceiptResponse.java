package com.theholymatrimony.backend.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReceiptResponse {

    private Long paymentRecordId;

    private String invoiceNumber;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String memberName;

    private String email;

    private String phone;

    private String plan;

    private String billingCycle;

    private Integer amountInPaise;

    private BigDecimal amountInRupees;

    private String currency;

    private String status;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;

    private String companyName;

    private String companyGstin;

    private String companyAddress;
}
