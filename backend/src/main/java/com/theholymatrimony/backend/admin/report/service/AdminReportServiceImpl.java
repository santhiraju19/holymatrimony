package com.theholymatrimony.backend.admin.report.service;

import com.theholymatrimony.backend.admin.report.dto.AdminReportDetailResponse;
import com.theholymatrimony.backend.admin.report.dto.AdminReportPageResponse;
import com.theholymatrimony.backend.admin.report.dto.AdminReportResponse;
import com.theholymatrimony.backend.admin.report.dto.UpdateReportStatusRequest;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.safety.entity.UserReport;
import com.theholymatrimony.backend.safety.enums.ReportReason;
import com.theholymatrimony.backend.safety.enums.ReportStatus;
import com.theholymatrimony.backend.safety.repository.UserReportRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportServiceImpl
        implements AdminReportService {

    private static final int DEFAULT_PAGE_SIZE = 20;

    private static final int MAX_PAGE_SIZE = 100;

    private final UserReportRepository
            userReportRepository;

    private final UserRepository
            userRepository;


    @Override
    public AdminReportPageResponse getReports(
            int page,
            int size,
            String search,
            ReportStatus status,
            ReportReason reason
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                normalizePageSize(
                        size
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<UserReport> reports =
                userReportRepository
                        .searchAdminReports(
                                normalizeSearch(
                                        search
                                ),
                                status,
                                reason,
                                pageable
                        );

        return AdminReportPageResponse
                .builder()
                .content(
                        reports
                                .getContent()
                                .stream()
                                .map(
                                        this::toListResponse
                                )
                                .toList()
                )
                .page(
                        reports.getNumber()
                )
                .size(
                        reports.getSize()
                )
                .totalElements(
                        reports.getTotalElements()
                )
                .totalPages(
                        reports.getTotalPages()
                )
                .first(
                        reports.isFirst()
                )
                .last(
                        reports.isLast()
                )
                .build();
    }


    @Override
    public AdminReportDetailResponse getReport(
            UUID reportId
    ) {

        UserReport report =
                findReport(
                        reportId
                );

        return toDetailResponse(
                report
        );
    }


    @Override
    @Transactional
    public AdminReportDetailResponse updateReportStatus(
            UUID reportId,
            UpdateReportStatusRequest request
    ) {

        UserReport report =
                findReport(
                        reportId
                );

        User currentAdmin =
                getCurrentAdmin();

        ReportStatus newStatus =
                request.getStatus();

        report.setStatus(
                newStatus
        );

        if (
                newStatus
                        == ReportStatus.PENDING
        ) {

            report.setReviewedAt(
                    null
            );

            report.setReviewedBy(
                    null
            );

        } else {

            report.setReviewedAt(
                    LocalDateTime.now()
            );

            report.setReviewedBy(
                    currentAdmin
            );
        }

        UserReport saved =
                userReportRepository
                        .save(
                                report
                        );

        return toDetailResponse(
                saved
        );
    }


    private UserReport findReport(
            UUID reportId
    ) {

        return userReportRepository
                .findAdminReportById(
                        reportId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Report not found: "
                                                + reportId
                                )
                );
    }


    private User getCurrentAdmin() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                        || !authentication
                        .isAuthenticated()
        ) {

            throw new IllegalStateException(
                    "Authenticated administrator not found."
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(
                        email
                )
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Administrator account not found."
                                )
                );
    }


    private AdminReportResponse toListResponse(
            UserReport report
    ) {

        User reporter =
                report.getReporter();

        User reportedUser =
                report.getReportedUser();

        return AdminReportResponse
                .builder()
                .id(
                        report.getId()
                )
                .reporterId(
                        reporter.getId()
                )
                .reporterName(
                        reporter.getFullName()
                )
                .reporterEmail(
                        reporter.getEmail()
                )
                .reportedUserId(
                        reportedUser.getId()
                )
                .reportedUserName(
                        reportedUser.getFullName()
                )
                .reportedUserEmail(
                        reportedUser.getEmail()
                )
                .conversationId(
                        report.getConversation()
                                == null
                                ? null
                                : report
                                .getConversation()
                                .getId()
                )
                .reason(
                        report.getReason()
                )
                .status(
                        report.getStatus()
                )
                .createdAt(
                        report.getCreatedAt()
                )
                .reviewedAt(
                        report.getReviewedAt()
                )
                .build();
    }


    private AdminReportDetailResponse toDetailResponse(
            UserReport report
    ) {

        User reporter =
                report.getReporter();

        User reportedUser =
                report.getReportedUser();

        User reviewedBy =
                report.getReviewedBy();

        return AdminReportDetailResponse
                .builder()
                .id(
                        report.getId()
                )
                .reporterId(
                        reporter.getId()
                )
                .reporterName(
                        reporter.getFullName()
                )
                .reporterEmail(
                        reporter.getEmail()
                )
                .reporterMobile(
                        reporter.getMobile()
                )
                .reportedUserId(
                        reportedUser.getId()
                )
                .reportedUserName(
                        reportedUser.getFullName()
                )
                .reportedUserEmail(
                        reportedUser.getEmail()
                )
                .reportedUserMobile(
                        reportedUser.getMobile()
                )
                .conversationId(
                        report.getConversation()
                                == null
                                ? null
                                : report
                                .getConversation()
                                .getId()
                )
                .reason(
                        report.getReason()
                )
                .details(
                        report.getDetails()
                )
                .status(
                        report.getStatus()
                )
                .createdAt(
                        report.getCreatedAt()
                )
                .reviewedAt(
                        report.getReviewedAt()
                )
                .reviewedById(
                        reviewedBy == null
                                ? null
                                : reviewedBy.getId()
                )
                .reviewedByName(
                        reviewedBy == null
                                ? null
                                : reviewedBy.getFullName()
                )
                .reviewedByEmail(
                        reviewedBy == null
                                ? null
                                : reviewedBy.getEmail()
                )
                .build();
    }


    private int normalizePageSize(
            int size
    ) {

        if (
                size <= 0
        ) {

            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }


    private String normalizeSearch(
            String search
    ) {

        if (
                search == null
        ) {

            return "";
        }

        return search
                .trim()
                .toLowerCase();
    }
}