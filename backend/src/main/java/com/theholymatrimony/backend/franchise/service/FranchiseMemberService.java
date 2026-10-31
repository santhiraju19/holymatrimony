package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.dto.FranchiseMemberResponse;

import java.util.List;

/**
 * Franchise-user member operations.
 *
 * Geographic authorization scope is always derived server-side from the
 * authenticated franchise user's active district allocation.
 */
public interface FranchiseMemberService {

    List<FranchiseMemberResponse> listMembers(
            String email
    );
}
