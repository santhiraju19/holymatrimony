package com.theholymatrimony.backend.secureconnect.balance.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SecureConnectMediaBalanceResponse {

    private CallMediaType mediaType;

    private boolean canInitiate;

    private boolean unlimited;

    private long planAllowanceSeconds;

    private long planConsumedSeconds;

    private long planRemainingSeconds;

    private long topUpRemainingSeconds;

    private long totalRemainingSeconds;
}
