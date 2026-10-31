package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseMemberResponse;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Member operations restricted to the authenticated franchise user's
 * canonical district scope.
 */
@Service
@RequiredArgsConstructor
public class FranchiseMemberServiceImpl
        implements FranchiseMemberService {

    private final FranchiseAccessService franchiseAccessService;

    private final ProfileRepository profileRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FranchiseMemberResponse> listMembers(
            String email
    ) {

        /*
         * Authorization order is intentional:
         *
         * 1. Require MEMBERS_VIEW.
         * 2. Derive the active district allocation from authenticated identity.
         * 3. Query profiles only by that canonical district ID.
         *
         * No client-supplied franchise or geographic identifier participates
         * in authorization.
         */
        franchiseAccessService.requirePermission(
                email,
                FranchisePermission.MEMBERS_VIEW
        );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        UUID districtId =
                allocation
                        .getDistrict()
                        .getId();

        return profileRepository
                .findAllByCanonicalDistrictIdOrderByCreatedAtDesc(
                        districtId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FranchiseMemberResponse toResponse(
            Profile profile
    ) {

        return new FranchiseMemberResponse(
                profile.getId(),
                profile.getMemberId(),
                profile.getUser().getFullName(),
                profile.getUser().getEmail(),
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getDenomination(),
                profile.getChurchName(),
                profile.getCity(),
                profile.getDistrict(),
                profile.getState(),
                profile.getCountry(),
                profile.getProfileCompleted(),
                profile.getProfileLive()
        );
    }
}
