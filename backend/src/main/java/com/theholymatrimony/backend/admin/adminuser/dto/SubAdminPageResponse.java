package com.theholymatrimony.backend.admin.adminuser.dto;

import java.util.List;

public record SubAdminPageResponse(

        List<SubAdminResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages

) {
}
