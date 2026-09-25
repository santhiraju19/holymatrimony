package com.theholymatrimony.backend.secureconnect.balance.dto;

import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SecureConnectBalanceResponse {

    private MembershipPlan plan;

    private boolean activeMembership;

    private SecureConnectMediaBalanceResponse audio;

    private SecureConnectMediaBalanceResponse video;
}
