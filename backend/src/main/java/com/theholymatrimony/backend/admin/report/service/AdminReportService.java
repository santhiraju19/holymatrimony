package com.theholymatrimony.backend.admin.report.service;

import com.theholymatrimony.backend.admin.report.dto.AdminReportDetailResponse;
import com.theholymatrimony.backend.admin.report.dto.AdminReportPageResponse;
import com.theholymatrimony.backend.admin.report.dto.UpdateReportStatusRequest;

import com.theholymatrimony.backend.safety.enums.ReportReason;
import com.theholymatrimony.backend.safety.enums.ReportStatus;

import java.util.UUID;

public interface AdminReportService {

    AdminReportPageResponse getReports(
            int page,
            int size,
            String search,
            ReportStatus status,
            ReportReason reason
    );

    AdminReportDetailResponse getReport(
            UUID reportId
    );

    AdminReportDetailResponse updateReportStatus(
            UUID reportId,
            UpdateReportStatusRequest request
    );
}