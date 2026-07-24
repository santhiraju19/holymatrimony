package com.theholymatrimony.backend.membership.service;

import com.theholymatrimony.backend.membership.dto.MembershipResponse;
import com.theholymatrimony.backend.membership.dto.UpgradeMembershipRequest;

import java.util.UUID;

public interface MembershipService {

    MembershipResponse getMembership(UUID userId);

    MembershipResponse upgradeMembership(
            UUID userId,
            UpgradeMembershipRequest request
    );
}