package com.theholymatrimony.backend.secureconnect.topup.dto;

import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateSecureConnectTopUpResponse {

    private UUID topUpPaymentId;

    private String packageCode;

    private CallMediaType mediaType;

    private int minutes;

    private long seconds;

    private Integer amount;

    private String currency;

    private String orderId;

    private String key;
}
