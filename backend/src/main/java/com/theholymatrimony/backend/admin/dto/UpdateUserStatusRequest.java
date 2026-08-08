package com.theholymatrimony.backend.admin.dto;

import com.theholymatrimony.backend.auth.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateUserStatusRequest {

    @NotNull(message = "Status is required")
    private UserStatus status;

    @Size(
            max = 500,
            message = "Status reason cannot exceed 500 characters"
    )
    private String reason;
}