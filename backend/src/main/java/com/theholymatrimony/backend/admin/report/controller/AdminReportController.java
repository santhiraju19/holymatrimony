package com.theholymatrimony.backend.admin.report.controller;

import com.theholymatrimony.backend.admin.report.dto.AdminReportDetailResponse;
import com.theholymatrimony.backend.admin.report.dto.AdminReportPageResponse;
import com.theholymatrimony.backend.admin.report.dto.UpdateReportStatusRequest;

import com.theholymatrimony.backend.admin.report.service.AdminReportService;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.safety.enums.ReportReason;
import com.theholymatrimony.backend.safety.enums.ReportStatus;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(
        "/api/v1/admin/reports"
)
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService
            adminReportService;


    @GetMapping
    public ResponseEntity<
            ApiResponse<AdminReportPageResponse>
            >
    getReports(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size,

            @RequestParam(
                    required = false
            )
            String search,

            @RequestParam(
                    required = false
            )
            ReportStatus status,

            @RequestParam(
                    required = false
            )
            ReportReason reason

    ) {

        AdminReportPageResponse response =
                adminReportService
                        .getReports(
                                page,
                                size,
                                search,
                                status,
                                reason
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }


    @GetMapping(
            "/{reportId}"
    )
    public ResponseEntity<
            ApiResponse<AdminReportDetailResponse>
            >
    getReport(

            @PathVariable
            UUID reportId

    ) {

        AdminReportDetailResponse response =
                adminReportService
                        .getReport(
                                reportId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }


    @PatchMapping(
            "/{reportId}/status"
    )
    public ResponseEntity<
            ApiResponse<AdminReportDetailResponse>
            >
    updateReportStatus(

            @PathVariable
            UUID reportId,

            @Valid
            @RequestBody
            UpdateReportStatusRequest request

    ) {

        AdminReportDetailResponse response =
                adminReportService
                        .updateReportStatus(
                                reportId,
                                request
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Report status updated successfully.",
                        response
                )
        );
    }
}