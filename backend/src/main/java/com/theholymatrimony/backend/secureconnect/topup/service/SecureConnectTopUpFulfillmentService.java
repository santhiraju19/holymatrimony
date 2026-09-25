package com.theholymatrimony.backend.secureconnect.topup.service;

public interface SecureConnectTopUpFulfillmentService {

    void finalizeCapturedPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String paymentMethod
    );

    void markPaymentFailed(
            String razorpayOrderId,
            String razorpayPaymentId,
            String paymentMethod
    );
}
