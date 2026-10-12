package com.theholymatrimony.backend.admin.adminuser.service;

import com.theholymatrimony.backend.admin.adminuser.dto.CreateSubAdminRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminPageResponse;
import com.theholymatrimony.backend.admin.adminuser.dto.SubAdminResponse;
import com.theholymatrimony.backend.admin.adminuser.dto.UpdateSubAdminPermissionsRequest;
import com.theholymatrimony.backend.admin.adminuser.dto.UpdateSubAdminStatusRequest;
import com.theholymatrimony.backend.auth.enums.UserStatus;

import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SubAdminManagementService {

    SubAdminPageResponse getSubAdmins(
            String search,
            UserStatus status,
            Pageable pageable
    );

    SubAdminResponse getSubAdmin(
            UUID userId
    );

    SubAdminResponse createSubAdmin(
            CreateSubAdminRequest request
    );

    SubAdminResponse updatePermissions(
            UUID userId,
            UpdateSubAdminPermissionsRequest request
    );

    SubAdminResponse updateStatus(
            UUID userId,
            UpdateSubAdminStatusRequest request,
            String clientIp
    );

    void resendSetupOtp(
            UUID userId
    );
}
