package com.theholymatrimony.backend.admin.report.dto;

import com.theholymatrimony.backend.safety.enums.ReportStatus;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateReportStatusRequest {

    @NotNull(
            message = "Report status is required"
    )
    private ReportStatus status;
}