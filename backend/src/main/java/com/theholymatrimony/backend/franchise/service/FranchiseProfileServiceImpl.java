package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchiseAccessResponse;
import com.theholymatrimony.backend.franchise.entity.Franchise;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseUser;
import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.entity.GeoState;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class FranchiseProfileServiceImpl
        implements FranchiseProfileService {

    private final FranchiseAccessService franchiseAccessService;

    @Override
    @Transactional(readOnly = true)
    public FranchiseAccessResponse getCurrentFranchiseAccess(
            String email
    ) {

        FranchiseUser franchiseUser =
                franchiseAccessService.requireFranchiseUser(
                        email
                );

        FranchiseDistrictAllocation allocation =
                franchiseAccessService
                        .requireActiveDistrictAllocation(
                                email
                        );

        Set<FranchisePermission> permissions =
                franchiseAccessService
                        .getEffectivePermissions(
                                email
                        );

        User user = franchiseUser.getUser();
        Franchise franchise = franchiseUser.getFranchise();
        GeoDistrict district = allocation.getDistrict();
        GeoState state = district.getState();

        return new FranchiseAccessResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),

                franchiseUser.getId(),
                franchiseUser.getStaffRole(),

                franchise.getId(),
                franchise.getFranchiseCode(),
                franchise.getDisplayName(),
                franchise.getStatus(),

                state.getId(),
                state.getLgdCode(),
                state.getName(),

                district.getId(),
                district.getLgdCode(),
                district.getName(),

                Set.copyOf(permissions)
        );
    }
}
