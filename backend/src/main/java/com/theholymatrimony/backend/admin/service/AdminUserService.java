package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminUserDetailResponse;
import com.theholymatrimony.backend.admin.dto.AdminUserPageResponse;
import com.theholymatrimony.backend.admin.dto.UpdateUserStatusRequest;
import com.theholymatrimony.backend.auth.enums.UserStatus;

import java.util.UUID;

public interface AdminUserService {

    AdminUserPageResponse getUsers(
            int page,
            int size,
            String search,
            UserStatus status
    );

    AdminUserDetailResponse getUser(
            UUID userId
    );

    AdminUserDetailResponse updateUserStatus(
            UUID userId,
            UpdateUserStatusRequest request
    );
}