package com.theholymatrimony.backend.safety.repository;

import com.theholymatrimony.backend.safety.entity.UserReport;
import com.theholymatrimony.backend.safety.enums.ReportStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}