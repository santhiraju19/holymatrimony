package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationPageResponse;
import com.theholymatrimony.backend.admin.dto.AdminMemberVerificationResponse;
import com.theholymatrimony.backend.admin.dto.UpdateMemberVerificationRequest;

import com.theholymatrimony.backend.verification.enums.VerificationStatus;
import com.theholymatrimony.backend.verification.enums.VerificationType;

import java.util.UUID;

public interface AdminMemberVerificationService {

    AdminMemberVerificationPageResponse getVerifications(
            int page,
            int size,
            String search,
            VerificationStatus status,
            VerificationType type
    );

    AdminMemberVerificationResponse getVerification(
            UUID verificationId
    );

    AdminMemberVerificationResponse updateVerification(
            UUID verificationId,
            UpdateMemberVerificationRequest request
    );
}
