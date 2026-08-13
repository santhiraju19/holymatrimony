
package com.theholymatrimony.backend.safety.dto;

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
public class UserReportResponse {

    private UUID id;

    private UUID reportedUserId;

    private UUID conversationId;

    private ReportReason reason;

    private String details;

    private ReportStatus status;

    private LocalDateTime createdAt;
}