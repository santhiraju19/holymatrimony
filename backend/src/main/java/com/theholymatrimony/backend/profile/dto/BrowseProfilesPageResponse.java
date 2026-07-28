package com.theholymatrimony.backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BrowseProfilesPageResponse {

    private List<BrowseProfileResponse> profiles;

    private int page;
    private int size;

    private long totalElements;
    private int totalPages;

    private boolean first;
    private boolean last;
    private boolean hasNext;
    private boolean hasPrevious;
}