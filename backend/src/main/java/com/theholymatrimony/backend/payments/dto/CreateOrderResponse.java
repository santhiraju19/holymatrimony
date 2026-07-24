package com.theholymatrimony.backend.payments.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateOrderResponse {

    private String orderId;

    private Integer amount;

    private String currency;

    private String key;
}