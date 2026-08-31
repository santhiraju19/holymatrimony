package com.theholymatrimony.backend.admin.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsDetailResponse {

    private String metric;
    private String title;

    private LocalDate from;
    private LocalDate to;

    private long totalElements;
    private int page;
    private int size;
    private int totalPages;

    private List<AdminAnalyticsDetailRow> rows;
}
