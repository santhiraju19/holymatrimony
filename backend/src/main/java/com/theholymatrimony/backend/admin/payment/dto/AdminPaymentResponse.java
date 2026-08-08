// src/main/java/com/theholymatrimony/backend/admin/payment/dto/AdminPaymentResponse.java

package com.theholymatrimony.backend.admin.payment.dto;

import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentResponse {

    private UUID paymentId;

    private UUID userId;

    private String fullName;

    private String accountEmail;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String plan;

    private String billingCycle;

    private String customerName;

    private String email;

    private String phone;

    private Integer amountInPaise;

    private Double amountInRupees;

    private String currency;

    private PaymentStatus status;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}