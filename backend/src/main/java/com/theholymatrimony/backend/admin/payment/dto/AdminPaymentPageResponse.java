// src/main/java/com/theholymatrimony/backend/admin/payment/dto/AdminPaymentPageResponse.java

package com.theholymatrimony.backend.admin.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentPageResponse {

    private List<AdminPaymentResponse> content;

    private int page;

    private int size;

    private long totalElements;

    private int totalPages;

    private boolean first;

    private boolean last;
}