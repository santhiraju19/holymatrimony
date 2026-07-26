package com.theholymatrimony.backend.profile.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhotoOrderRequest {

    @NotNull(message = "Photo IDs are required")
    private List<UUID> photoIds;
}