package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.dto.FranchiseAccessResponse;

/**
 * Read service for the authenticated franchise user's own context.
 */
public interface FranchiseProfileService {

    FranchiseAccessResponse getCurrentFranchiseAccess(
            String email
    );
}
