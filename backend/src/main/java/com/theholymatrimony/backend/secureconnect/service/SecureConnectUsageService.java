package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageBalance;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectUsageResult;

import java.util.UUID;

public interface SecureConnectUsageService {

    SecureConnectUsageBalance getRemainingBalance(
            UUID callSessionId
    );

    SecureConnectUsageResult finalizeUsage(
            UUID callSessionId,
            long connectedDurationSeconds
    );
}
