package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.PaymentHistoryResponse;
import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;

import java.util.List;

public interface PaymentService {

    CreateOrderResponse createOrder(
            CreateOrderRequest request,
            String authenticatedEmail
    ) throws Exception;

    void verifyPayment(
            VerifyPaymentRequest request,
            String authenticatedEmail
    ) throws Exception;

    List<PaymentHistoryResponse> getPaymentHistory(
            String authenticatedEmail
    );

    PaymentReceiptResponse getPaymentReceipt(
            Long paymentId,
            String authenticatedEmail
    );
}
