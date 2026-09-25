package com.theholymatrimony.backend.secureconnect.topup.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSecureConnectTopUpRequest {

    @NotBlank
    private String packageCode;
}
