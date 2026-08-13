
package com.theholymatrimony.backend.safety.repository;

import com.theholymatrimony.backend.safety.entity.UserReport;
import com.theholymatrimony.backend.safety.enums.ReportReason;
import com.theholymatrimony.backend.safety.enums.ReportStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserReportRepository
        extends JpaRepository<UserReport, UUID> {

    Page<UserReport>
    findAllByReporterIdOrderByCreatedAtDesc(
            UUID reporterId,
            Pageable pageable
    );

    Page<UserReport>
    findAllByReportedUserIdOrderByCreatedAtDesc(
            UUID reportedUserId,
            Pageable pageable
    );

    Page<UserReport>
    findAllByStatusOrderByCreatedAtAsc(
            ReportStatus status,
            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "reporter",
                    "reportedUser"
            }
    )
    @Query("""
            SELECT report
            FROM UserReport report
            WHERE
                (:status IS NULL OR report.status = :status)
                AND
                (:reason IS NULL OR report.reason = :reason)
                AND
                (
                    :search = ''
                    OR LOWER(report.reporter.fullName)
                        LIKE CONCAT('%', :search, '%')
                    OR LOWER(report.reporter.email)
                        LIKE CONCAT('%', :search, '%')
                    OR LOWER(report.reportedUser.fullName)
                        LIKE CONCAT('%', :search, '%')
                    OR LOWER(report.reportedUser.email)
                        LIKE CONCAT('%', :search, '%')
                )
            """)
    Page<UserReport> searchAdminReports(
            @Param("search")
            String search,

            @Param("status")
            ReportStatus status,

            @Param("reason")
            ReportReason reason,

            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "reporter",
                    "reportedUser",
                    "reviewedBy",
                    "conversation"
            }
    )
    @Query("""
            SELECT report
            FROM UserReport report
            WHERE report.id = :reportId
            """)
    Optional<UserReport> findAdminReportById(
            @Param("reportId")
            UUID reportId
    );
}