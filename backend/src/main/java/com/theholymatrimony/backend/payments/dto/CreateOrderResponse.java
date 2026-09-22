package com.theholymatrimony.backend.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateOrderResponse {

    /*
     * RAZORPAY
     * COUPON
     */
    private String checkoutType;

    /*
     * Local Holy Matrimony payment record.
     */
    private UUID paymentId;

    /*
     * Razorpay values are null for a 100% coupon checkout.
     */
    private String orderId;

    private String key;

    /*
     * Final amount payable after coupon discount, in paise.
     */
    private Integer amount;

    private String currency;

    /*
     * Coupon pricing information.
     *
     * couponCode is null when no coupon was supplied.
     */
    private String couponCode;

    private Integer discountPercent;

    private Integer originalAmount;

    private Integer discountAmount;

    /*
     * True only when checkout has already been completed
     * server-side and membership has been activated.
     *
     * HM100 -> true
     * Razorpay checkout -> false
     */
    private boolean completed;
}
