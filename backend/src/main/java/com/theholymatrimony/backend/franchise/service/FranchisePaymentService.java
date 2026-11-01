package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.dto.FranchisePaymentResponse;

import java.util.List;

/**
 * Read-only franchise payment operations.
 *
 * Geographic authorization is derived server-side from the authenticated
 * franchise user's active district allocation.
 */
public interface FranchisePaymentService {

    List<FranchisePaymentResponse> listPayments(
            String email
    );
}
