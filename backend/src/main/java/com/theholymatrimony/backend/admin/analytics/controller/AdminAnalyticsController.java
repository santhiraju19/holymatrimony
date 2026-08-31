package com.theholymatrimony.backend.admin.analytics.controller;

import com.theholymatrimony.backend.admin.analytics.dto.AdminAnalyticsResponse;
import com.theholymatrimony.backend.admin.analytics.service.AdminAnalyticsExportService;
import com.theholymatrimony.backend.admin.analytics.service.AdminAnalyticsService;
import com.theholymatrimony.backend.common.response.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping(
        "/api/v1/admin/analytics"
)
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService
            adminAnalyticsService;

    private final AdminAnalyticsExportService
            adminAnalyticsExportService;

    @GetMapping
    public ResponseEntity<
            ApiResponse<AdminAnalyticsResponse>
            >
    getAnalytics(

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to

    ) {

        AdminAnalyticsResponse response =
                adminAnalyticsService
                        .getAnalytics(
                                from,
                                to
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    @GetMapping(
            value = "/export/users",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]>
    exportUsers(

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to

    ) {

        return csv(
                "holy-matrimony-users.csv",
                adminAnalyticsExportService
                        .exportUsers(
                                from,
                                to
                        )
        );
    }

    @GetMapping(
            value = "/export/profiles",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]>
    exportProfiles(

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to

    ) {

        return csv(
                "holy-matrimony-profiles.csv",
                adminAnalyticsExportService
                        .exportProfiles(
                                from,
                                to
                        )
        );
    }

    @GetMapping(
            value = "/export/memberships",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]>
    exportMemberships(

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to

    ) {

        return csv(
                "holy-matrimony-memberships.csv",
                adminAnalyticsExportService
                        .exportMemberships(
                                from,
                                to
                        )
        );
    }

    @GetMapping(
            value = "/export/payments",
            produces = "text/csv"
    )
    public ResponseEntity<byte[]>
    exportPayments(

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate from,

            @RequestParam(
                    required = false
            )
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate to

    ) {

        return csv(
                "holy-matrimony-payments.csv",
                adminAnalyticsExportService
                        .exportPayments(
                                from,
                                to
                        )
        );
    }

    private ResponseEntity<byte[]>
    csv(
            String fileName,
            byte[] content
    ) {

        return ResponseEntity
                .ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\""
                                + fileName
                                + "\""
                )
                .contentType(
                        MediaType.parseMediaType(
                                "text/csv;charset=UTF-8"
                        )
                )
                .body(
                        content
                );
    }
}
