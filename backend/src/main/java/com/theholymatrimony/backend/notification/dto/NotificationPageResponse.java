package com.theholymatrimony.backend.notification.dto;

import java.util.List;

public record NotificationPageResponse(

        List<NotificationResponse> notifications,

        int page,

        int size,

        long totalElements,

        int totalPages,

        boolean first,

        boolean last

) {
}
