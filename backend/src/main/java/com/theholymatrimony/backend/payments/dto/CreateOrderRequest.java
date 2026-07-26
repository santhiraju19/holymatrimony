package com.theholymatrimony.backend.payments.dto;

import lombok.Data;

@Data
public class CreateOrderRequest {

    private String plan;

    private String billingCycle;

    private String fullName;

    private String email;

    private String phone;
}