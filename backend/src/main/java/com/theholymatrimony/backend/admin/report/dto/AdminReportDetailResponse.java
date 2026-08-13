package com.theholymatrimony.backend.admin.report.dto;

import com.theholymatrimony.backend.safety.enums.ReportReason;
import com.theholymatrimony.backend.safety.enums.ReportStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDetailResponse {

    private UUID id;

    private UUID reporterId;
    private String reporterName;
    private String reporterEmail;
    private String reporterMobile;

    private UUID reportedUserId;
    private String reportedUserName;
    private String reportedUserEmail;
    private String reportedUserMobile;

    private UUID conversationId;

    private ReportReason reason;

    private String details;

    private ReportStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    private UUID reviewedById;
    private String reviewedByName;
    private String reviewedByEmail;
}