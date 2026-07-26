package com.theholymatrimony.backend.payments.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateOrderResponse {

    private String orderId;

    private String key;

    private Integer amount;

    private String currency;
}