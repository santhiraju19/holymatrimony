package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminProfileDetailResponse;
import com.theholymatrimony.backend.admin.dto.AdminProfilePageResponse;
import com.theholymatrimony.backend.admin.dto.UpdateProfileVerificationRequest;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import java.util.UUID;

public interface AdminProfileVerificationService {

    AdminProfilePageResponse getProfiles(
            int page,
            int size,
            String search,
            ProfileVerificationStatus status
    );

    AdminProfileDetailResponse getProfile(
            UUID profileId
    );

    AdminProfileDetailResponse updateVerification(
            UUID profileId,
            UpdateProfileVerificationRequest request
    );
}