package com.theholymatrimony.backend.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDetailRow {

    private UUID id;
    private UUID userId;

    private String name;
    private String email;
    private String mobile;

    private String gender;
    private String location;

    private Integer completionPercentage;
    private Boolean profileCompleted;
    private String verificationStatus;

    private String membershipPlan;
    private String membershipStatus;

    private String paymentStatus;
    private String paymentSource;
    private String paymentMethod;

    private BigDecimal amount;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    private LocalDateTime registeredAt;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
}
