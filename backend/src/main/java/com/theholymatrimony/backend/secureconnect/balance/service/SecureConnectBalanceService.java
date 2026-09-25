package com.theholymatrimony.backend.secureconnect.balance.service;

import com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectBalanceResponse;

public interface SecureConnectBalanceService {

    SecureConnectBalanceResponse getBalance(
            String authenticatedEmail
    );

    com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse
    getBalanceForMembership(
            com.theholymatrimony.backend.auth.entity.User user,
            com.theholymatrimony.backend.payments.entity.Membership membership,
            com.theholymatrimony.backend.secureconnect.enums.CallMediaType mediaType
    );

    /**
     * Checks a specific membership while locking its allowance and wallet.
     * Must be called inside an existing write transaction.
     */
    com.theholymatrimony.backend.secureconnect.balance.dto.SecureConnectMediaBalanceResponse
    getLockedBalanceForMembership(
            com.theholymatrimony.backend.auth.entity.User user,
            com.theholymatrimony.backend.payments.entity.Membership membership,
            com.theholymatrimony.backend.secureconnect.enums.CallMediaType mediaType
    );

}
