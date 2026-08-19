package com.theholymatrimony.backend.payments.dto;

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
public class PaymentReceiptResponse {

    private UUID paymentRecordId;

    private String invoiceNumber;

    /*
     * Razorpay identifiers are null for coupon transactions.
     */
    private String razorpayOrderId;

    private String razorpayPaymentId;

    /*
     * RAZORPAY / COUPON
     */
    private String paymentSource;

    /*
     * UPI / CARD / NETBANKING / WALLET / COUPON
     */
    private String paymentMethod;

    /*
     * Example: HOLY100
     */
    private String couponCode;

    /*
     * Member details
     */
    private String memberName;

    private String email;

    private String phone;

    /*
     * Membership details
     */
    private String plan;

    private String billingCycle;

    /*
     * Transaction amount
     */
    private Integer amountInPaise;

    private BigDecimal amountInRupees;

    private String currency;

    private String status;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;

    /*
     * Company details printed on receipt
     */
    private String companyName;

    private String companyGstin;

    private String companyAddress;

    private String companyEmail;

    private String companyWebsite;
}
