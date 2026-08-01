
package com.theholymatrimony.backend.privacy.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.privacy.dto.PrivacySettingsResponse;
import com.theholymatrimony.backend.privacy.dto.UpdatePrivacySettingsRequest;
import com.theholymatrimony.backend.privacy.entity.PrivacySettings;
import com.theholymatrimony.backend.privacy.repository.PrivacySettingsRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PrivacySettingsService {

    private final UserRepository userRepository;

    private final PrivacySettingsRepository
            privacySettingsRepository;

    @Transactional
    public PrivacySettingsResponse getMySettings(
            String authenticatedEmail
    ) {
        User user =
                getUserByEmail(
                        authenticatedEmail
                );

        PrivacySettings settings =
                getOrCreateSettings(user);

        return toResponse(settings);
    }

    @Transactional
    public PrivacySettingsResponse updateMySettings(
            String authenticatedEmail,
            UpdatePrivacySettingsRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Privacy settings request is required"
            );
        }

        User user =
                getUserByEmail(
                        authenticatedEmail
                );

        PrivacySettings settings =
                getOrCreateSettings(user);

        applyUpdates(
                settings,
                request
        );

        PrivacySettings savedSettings =
                privacySettingsRepository.save(
                        settings
                );

        return toResponse(
                savedSettings
        );
    }

    @Transactional(readOnly = true)
    public PrivacySettings getSettingsForUser(
            User user
    ) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException(
                    "User is required"
            );
        }

        return privacySettingsRepository
                .findByUserId(user.getId())
                .orElseGet(() ->
                        buildDefaultSettings(user)
                );
    }

    private PrivacySettings getOrCreateSettings(
            User user
    ) {
        return privacySettingsRepository
                .findByUserId(user.getId())
                .orElseGet(() ->
                        privacySettingsRepository.save(
                                buildDefaultSettings(user)
                        )
                );
    }

    private PrivacySettings buildDefaultSettings(
            User user
    ) {
        return PrivacySettings.builder()
                .user(user)
                .build();
    }

    private void applyUpdates(
            PrivacySettings settings,
            UpdatePrivacySettingsRequest request
    ) {
        if (request.getProfileVisibility() != null) {
            settings.setProfileVisibility(
                    request.getProfileVisibility()
            );
        }

        if (request.getPhotoVisibility() != null) {
            settings.setPhotoVisibility(
                    request.getPhotoVisibility()
            );
        }

        if (request.getPhoneVisibility() != null) {
            settings.setPhoneVisibility(
                    request.getPhoneVisibility()
            );
        }

        if (request.getEmailVisibility() != null) {
            settings.setEmailVisibility(
                    request.getEmailVisibility()
            );
        }

        if (request.getAddressVisibility() != null) {
            settings.setAddressVisibility(
                    request.getAddressVisibility()
            );
        }

        if (request.getChurchVisibility() != null) {
            settings.setChurchVisibility(
                    request.getChurchVisibility()
            );
        }

        if (request.getFamilyVisibility() != null) {
            settings.setFamilyVisibility(
                    request.getFamilyVisibility()
            );
        }

        if (request.getOnlineVisibility() != null) {
            settings.setOnlineVisibility(
                    request.getOnlineVisibility()
            );
        }

        if (request.getLastSeenVisibility() != null) {
            settings.setLastSeenVisibility(
                    request.getLastSeenVisibility()
            );
        }

        if (request.getAudioCallPermission() != null) {
            settings.setAudioCallPermission(
                    request.getAudioCallPermission()
            );
        }

        if (request.getVideoCallPermission() != null) {
            settings.setVideoCallPermission(
                    request.getVideoCallPermission()
            );
        }

        if (request.getAllowPhotoRequests() != null) {
            settings.setAllowPhotoRequests(
                    request.getAllowPhotoRequests()
            );
        }

        if (request.getAllowContactRequests() != null) {
            settings.setAllowContactRequests(
                    request.getAllowContactRequests()
            );
        }
    }

    private PrivacySettingsResponse toResponse(
            PrivacySettings settings
    ) {
        return PrivacySettingsResponse.builder()
                .id(settings.getId())
                .userId(
                        settings.getUser().getId()
                )
                .profileVisibility(
                        settings.getProfileVisibility()
                )
                .photoVisibility(
                        settings.getPhotoVisibility()
                )
                .phoneVisibility(
                        settings.getPhoneVisibility()
                )
                .emailVisibility(
                        settings.getEmailVisibility()
                )
                .addressVisibility(
                        settings.getAddressVisibility()
                )
                .churchVisibility(
                        settings.getChurchVisibility()
                )
                .familyVisibility(
                        settings.getFamilyVisibility()
                )
                .onlineVisibility(
                        settings.getOnlineVisibility()
                )
                .lastSeenVisibility(
                        settings.getLastSeenVisibility()
                )
                .audioCallPermission(
                        settings.getAudioCallPermission()
                )
                .videoCallPermission(
                        settings.getVideoCallPermission()
                )
                .allowPhotoRequests(
                        Boolean.TRUE.equals(
                                settings.getAllowPhotoRequests()
                        )
                )
                .allowContactRequests(
                        Boolean.TRUE.equals(
                                settings.getAllowContactRequests()
                        )
                )
                .createdAt(
                        settings.getCreatedAt()
                )
                .updatedAt(
                        settings.getUpdatedAt()
                )
                .build();
    }

    private User getUserByEmail(
            String email
    ) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException(
                    "Authenticated user is required"
            );
        }

        return userRepository
                .findByEmail(email.trim())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Authenticated user was not found"
                        )
                );
    }
}