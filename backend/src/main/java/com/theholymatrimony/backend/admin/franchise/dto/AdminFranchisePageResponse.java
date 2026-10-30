package com.theholymatrimony.backend.admin.franchise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated HQ District Franchise response.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFranchisePageResponse {

    private List<AdminFranchiseResponse> content;

    private int page;

    private int size;

    private long totalElements;

    private int totalPages;

    private boolean first;

    private boolean last;
}
