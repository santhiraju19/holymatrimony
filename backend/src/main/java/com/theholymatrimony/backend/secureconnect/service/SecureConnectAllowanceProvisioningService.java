package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.payments.entity.Membership;

public interface SecureConnectAllowanceProvisioningService {

    void provisionForMembership(Membership membership);
}
