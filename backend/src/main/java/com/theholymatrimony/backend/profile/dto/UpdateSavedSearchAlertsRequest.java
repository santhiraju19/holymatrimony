package com.theholymatrimony.backend.profile.dto;

import com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSavedSearchAlertsRequest {

    @NotNull
    private Boolean enabled;

    private SavedSearchAlertFrequency frequency;
}