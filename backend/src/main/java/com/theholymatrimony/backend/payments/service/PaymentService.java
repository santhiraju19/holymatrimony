package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;

public interface PaymentService {

    CreateOrderResponse createOrder(
            CreateOrderRequest request
    ) throws Exception;

    void verifyPayment(
            VerifyPaymentRequest request
    ) throws Exception;
}