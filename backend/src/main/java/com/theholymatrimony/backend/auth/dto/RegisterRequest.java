package com.theholymatrimony.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Full name is required.")
    @Size(
            max = 120,
            message = "Full name cannot exceed 120 characters."
    )
    private String fullName;

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required.")
    @Size(
            max = 150,
            message = "Email cannot exceed 150 characters."
    )
    private String email;

    @NotBlank(message = "Mobile number is required.")
    @Pattern(
            regexp = "^\\+[1-9]\\d{7,14}$",
            message = "Enter a valid mobile number with country code, for example +919876543210."
    )
    private String mobile;

    @NotBlank(message = "Password is required.")
    @Size(
            min = 8,
            max = 100,
            message = "Password must contain at least 8 characters."
    )
    private String password;
}