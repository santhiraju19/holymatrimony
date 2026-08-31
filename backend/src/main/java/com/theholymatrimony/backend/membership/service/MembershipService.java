package com.theholymatrimony.backend.membership.service;

import com.theholymatrimony.backend.membership.dto.MembershipResponse;

import java.util.UUID;

public interface MembershipService {

    MembershipResponse getMembership(UUID userId);
}
