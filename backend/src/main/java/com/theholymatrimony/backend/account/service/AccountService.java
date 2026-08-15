package com.theholymatrimony.backend.account.service;

import com.theholymatrimony.backend.account.dto.AccountActionResponse;
import com.theholymatrimony.backend.account.dto.AccountResponse;
import com.theholymatrimony.backend.account.dto.ChangePasswordRequest;
import com.theholymatrimony.backend.account.dto.UpdateAccountRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.auth.service.RefreshTokenService;
import com.theholymatrimony.backend.account.dto.DeactivateAccountRequest;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.account.dto.ReactivateAccountRequest;
import com.theholymatrimony.backend.account.dto.DeleteAccountRequest;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.profile.service.PhotoService;


import java.util.UUID;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService refreshTokenService;

    private final ProfileRepository profileRepository;

private final PhotoService photoService;

    @Transactional(readOnly = true)
    public AccountResponse getAccount(
            String email
    ) {
        User user = findUser(email);

        return toResponse(user);
    }

    @Transactional
public AccountActionResponse reactivateAccount(
        ReactivateAccountRequest request
) {
    String normalizedEmail =
            request.email()
                    .trim()
                    .toLowerCase(Locale.ROOT);

    User user =
            userRepository
                    .findByEmail(normalizedEmail)
                    .orElseThrow(
                            () -> new IllegalArgumentException(
                                    "Invalid email address or password."
                            )
                    );

    if (
            !passwordEncoder.matches(
                    request.password(),
                    user.getPassword()
            )
    ) {
        throw new IllegalArgumentException(
                "Invalid email address or password."
        );
    }

    if (user.getStatus() == UserStatus.SUSPENDED) {
        throw new IllegalStateException(
                "Your account has been suspended. Please contact support."
        );
    }

    if (user.getStatus() == UserStatus.BLOCKED) {
        throw new IllegalStateException(
                "Your account has been blocked. Please contact support."
        );
    }

    if (user.getStatus() == UserStatus.DELETED) {
    throw new IllegalStateException(
            "This account has been permanently deleted and cannot be reactivated."
    );
}

    if (user.getStatus() == UserStatus.ACTIVE) {
        return new AccountActionResponse(
                "Your account is already active. Please sign in."
        );
    }

    if (user.getStatus() != UserStatus.DEACTIVATED) {
        throw new IllegalStateException(
                "This account cannot be reactivated."
        );
    }

    user.changeStatus(
            UserStatus.ACTIVE,
            "Reactivated by user",
            user.getId()
    );

    userRepository.save(user);

    return new AccountActionResponse(
            "Your account has been reactivated successfully. You can now sign in."
    );
}

@Transactional
public AccountActionResponse deactivateAccount(
        String email,
        DeactivateAccountRequest request,
        String clientIp
) {
    User user = findUser(email);

    if (
            !passwordEncoder.matches(
                    request.password(),
                    user.getPassword()
            )
    ) {
        throw new IllegalArgumentException(
                "Password is incorrect."
        );
    }

    if (user.getStatus() == UserStatus.DEACTIVATED) {
        throw new IllegalStateException(
                "Your account is already deactivated."
        );
    }

    if (user.getStatus() != UserStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only an active account can be deactivated."
        );
    }

    String reason =
            request.reason() == null ||
            request.reason().isBlank()
                    ? "Deactivated by user"
                    : request.reason().trim();

    user.changeStatus(
            UserStatus.DEACTIVATED,
            reason,
            user.getId()
    );

    userRepository.save(user);

    refreshTokenService.revokeAllUserTokens(
            user,
            clientIp,
            "Account deactivated by user"
    );

    return new AccountActionResponse(
            "Your account has been deactivated successfully."
    );
}

@Transactional
public AccountActionResponse deleteAccount(
        String email,
        DeleteAccountRequest request,
        String clientIp
) {

    User user = findUser(email);

    if (user.getRole() == Role.ROLE_ADMIN) {
        throw new IllegalStateException(
                "Administrator accounts cannot be deleted from account settings."
        );
    }

    if (user.getStatus() == UserStatus.DELETED) {
        throw new IllegalStateException(
                "This account has already been deleted."
        );
    }

    if (user.getStatus() != UserStatus.ACTIVE) {
        throw new IllegalStateException(
                "Only an active account can be permanently deleted."
        );
    }

    if (!passwordEncoder.matches(
            request.password(),
            user.getPassword()
    )) {
        throw new IllegalArgumentException(
                "Password is incorrect."
        );
    }

    if (!"DELETE".equals(request.confirmation().trim())) {
        throw new IllegalArgumentException(
                "Type DELETE to confirm permanent account deletion."
        );
    }

    /*
     * Revoke every active session before anonymizing
     * the authentication identity.
     */
    refreshTokenService.revokeAllUserTokens(
            user,
            clientIp,
            "Account permanently deleted by user"
    );

    /*
     * Remove physical profile photos and their
     * database records.
     */
    photoService.deleteAllPhotosForUser(
            user.getEmail()
    );

    /*
     * Erase personally identifiable profile data
     * while preserving the profile row and user
     * relationship for relational integrity.
     */
    profileRepository
            .findByUser(user)
            .ifPresent(profile -> {
                anonymizeProfile(profile);
                profileRepository.save(profile);
            });

    /*
     * Keep the User UUID because historical records
     * such as payments, memberships, conversations,
     * reports and interests may reference it.
     *
     * Replace identity data instead of deleting the row.
     */
    String anonymousIdentity =
            user.getId()
                    .toString()
                    .replace("-", "");

    user.setFullName("Deleted User");

    user.setEmail(
            "deleted+" +
            anonymousIdentity +
            "@deleted.theholymatrimony.local"
    );

    user.setMobile(null);

    /*
     * Replace the password with a random BCrypt value.
     * The original password can never authenticate again.
     */
    user.setPassword(
            passwordEncoder.encode(
                    UUID.randomUUID().toString()
            )
    );

    user.setEmailVerified(false);
    user.setEmailVerifiedAt(null);

    user.setProfileCompletion(0);
    user.setMembershipType("DELETED");

    user.setLastLoginAt(null);
    user.setLastSeenAt(null);

    user.changeStatus(
            UserStatus.DELETED,
            "Permanently deleted by user",
            user.getId()
    );

    userRepository.save(user);

    return new AccountActionResponse(
            "Your account has been permanently deleted."
    );
}

    @Transactional
    public AccountResponse updateAccount(
            String email,
            UpdateAccountRequest request
    ) {
        User user = findUser(email);

        String fullName = request.fullName().trim();
        String mobile = normalizeMobile(request.mobile());

        if (
                mobile != null &&
                userRepository.existsByMobile(mobile) &&
                !mobile.equals(user.getMobile())
        ) {
            throw new IllegalArgumentException(
                    "Mobile number is already registered."
            );
        }

        user.setFullName(fullName);
        user.setMobile(mobile);

        User savedUser =
                userRepository.save(user);

        return toResponse(savedUser);
    }

    @Transactional
    public AccountActionResponse changePassword(
            String email,
            ChangePasswordRequest request,
            String clientIp
    ) {
        User user = findUser(email);

        if (
                !passwordEncoder.matches(
                        request.currentPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }

        if (
                !request.newPassword()
                        .equals(request.confirmPassword())
        ) {
            throw new IllegalArgumentException(
                    "New password and confirmation do not match."
            );
        }

        if (
                passwordEncoder.matches(
                        request.newPassword(),
                        user.getPassword()
                )
        ) {
            throw new IllegalArgumentException(
                    "New password must be different from the current password."
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);

        /*
         * Password changes are security-sensitive.
         *
         * Revoke every refresh token so all existing
         * browser/device sessions must authenticate again.
         */
        refreshTokenService.revokeAllUserTokens(
                user,
                clientIp,
                "Password changed"
        );

        return new AccountActionResponse(
                "Password changed successfully. Please sign in again."
        );
    }

    @Transactional
    public AccountActionResponse logoutAll(
            String email,
            String clientIp
    ) {
        User user = findUser(email);

        refreshTokenService.revokeAllUserTokens(
                user,
                clientIp,
                "User requested logout from all devices"
        );

        return new AccountActionResponse(
                "You have been logged out from all devices."
        );
    }

    private User findUser(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user is unavailable."
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        return userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User account not found."
                        )
                );
    }

private void anonymizeProfile(Profile profile) {

    // Basic
    profile.setMobile(null);
    profile.setDateOfBirth(null);
    profile.setGender(null);
    profile.setAge(null);
    profile.setMaritalStatus(null);

    // Church
    profile.setDenomination(null);
    profile.setChurchName(null);
    profile.setPastorName(null);
    profile.setBaptized(null);
    profile.setMembershipId(null);
    profile.setChurchAddress(null);

    // Education
    profile.setHighestEducation(null);
    profile.setProfession(null);
    profile.setCompany(null);
    profile.setAnnualIncome(null);

    // Family
    profile.setFatherName(null);
    profile.setMotherName(null);
    profile.setSiblings(null);
    profile.setFamilyLocation(null);

    // Preferences
    profile.setPreferredAgeFrom(null);
    profile.setPreferredAgeTo(null);
    profile.setPreferredDenomination(null);
    profile.setPreferredEducation(null);

    // Location
    profile.setCity(null);
    profile.setState(null);
    profile.setCountry(null);

    // About
    profile.setAboutMe(null);

    // Completion
    profile.setCompletionPercentage(0);
    profile.setProfileCompleted(false);

    // Verification
    profile.setVerificationStatus(
            ProfileVerificationStatus.NOT_SUBMITTED
    );

    profile.setVerificationSubmittedAt(null);
    profile.setVerificationReviewedAt(null);
    profile.setVerificationReviewedBy(null);
    profile.setVerificationReason(null);
}

    private String normalizeMobile(
            String mobile
    ) {
        if (mobile == null) {
            return null;
        }

        String normalized =
                mobile.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

    private AccountResponse toResponse(
            User user
    ) {
        return new AccountResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobile(),
                user.isEmailVerificationComplete(),
                user.getStatus(),
                user.getMembershipType(),
                user.getProfileCompletion(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}
