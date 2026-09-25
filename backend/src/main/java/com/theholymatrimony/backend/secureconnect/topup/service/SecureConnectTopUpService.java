package com.theholymatrimony.backend.secureconnect.topup.service;

import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.secureconnect.topup.dto.CreateSecureConnectTopUpResponse;
import com.theholymatrimony.backend.secureconnect.topup.dto.SecureConnectTopUpPackageResponse;
import com.theholymatrimony.backend.secureconnect.topup.dto.SecureConnectTopUpStatusResponse;

import java.util.List;
import java.util.UUID;

public interface SecureConnectTopUpService {

    List<SecureConnectTopUpPackageResponse> getPackages();

    SecureConnectTopUpStatusResponse getStatus(
            UUID topUpPaymentId,
            String authenticatedEmail
    );

    CreateSecureConnectTopUpResponse createOrder(
            String packageCode,
            String authenticatedEmail
    ) throws Exception;

    void verifyPayment(
            VerifyPaymentRequest request,
            String authenticatedEmail
    ) throws Exception;
}
