package com.theholymatrimony.backend.admin.franchise.service;

import com.theholymatrimony.backend.admin.access.AdminAccessService;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchisePageResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseStatusResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseTerritoryResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.admin.franchise.dto.UpdateFranchiseStatusRequest;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.Role;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.auth.passwordreset.PasswordResetService;
import com.theholymatrimony.backend.auth.passwordreset.dto.ForgotPasswordRequest;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.common.exception.ResourceAlreadyExistsException;
import com.theholymatrimony.backend.franchise.entity.Franchise;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.FranchiseTerritory;
import com.theholymatrimony.backend.franchise.entity.FranchiseUser;
import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.entity.GeoState;
import com.theholymatrimony.backend.franchise.enums.FranchiseStaffRole;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import com.theholymatrimony.backend.franchise.enums.FranchiseUserStatus;
import com.theholymatrimony.backend.franchise.repository.FranchiseDistrictAllocationRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseTerritoryRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseUserRepository;
import com.theholymatrimony.backend.franchise.repository.GeoDistrictRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;
import java.util.List;

/**
 * HQ provisioning implementation for District Franchises.
 *
 * Geographic authority is derived from the selected persisted district.
 * State scope is never accepted independently from the client.
 *
 * The initial owner account receives ROLE_FRANCHISE and an active
 * FRANCHISE_OWNER membership. The bootstrap password is random and is
 * never exposed. The owner establishes the real password through the
 * existing OTP-backed password-reset flow.
 */
@Service
@RequiredArgsConstructor
public class AdminFranchiseManagementServiceImpl
        implements AdminFranchiseManagementService {


    @Override
    @Transactional
    public AdminFranchiseStatusResponse updateFranchiseStatus(
            String administratorEmail,
            UUID franchiseId,
            UpdateFranchiseStatusRequest request
    ) {

        String normalizedAdministratorEmail =
                normalizeRequiredEmail(
                        administratorEmail,
                        "Administrator email is required."
                );

        if (franchiseId == null) {
            throw new IllegalArgumentException(
                    "Franchise id is required."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Franchise status request is required."
            );
        }

        if (request.status() == null) {
            throw new IllegalArgumentException(
                    "Franchise status is required."
            );
        }

        adminAccessService.requireSuperAdmin(
                normalizedAdministratorEmail
        );

        Franchise franchise =
                franchiseRepository
                        .findById(franchiseId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Franchise not found."
                                )
                        );

        FranchiseStatus currentStatus =
                franchise.getStatus();

        FranchiseStatus requestedStatus =
                request.status();

        validateLifecycleTransition(
                currentStatus,
                requestedStatus
        );

        LocalDateTime now =
                LocalDateTime.now();

        switch (requestedStatus) {

            case ACTIVE -> {
                franchise.setStatus(
                        FranchiseStatus.ACTIVE
                );

                if (franchise.getActivatedAt() == null) {
                    franchise.setActivatedAt(now);
                }

                franchise.setSuspendedAt(null);
            }

            case SUSPENDED -> {
                franchise.setStatus(
                        FranchiseStatus.SUSPENDED
                );

                franchise.setSuspendedAt(now);
            }

            default -> throw new IllegalArgumentException(
                    "Unsupported operational franchise status: "
                            + requestedStatus
            );
        }

        Franchise saved =
                franchiseRepository.save(franchise);

        return toStatusResponse(saved);
    }

    private void validateLifecycleTransition(
            FranchiseStatus currentStatus,
            FranchiseStatus requestedStatus
    ) {

        if (currentStatus == null) {
            throw new IllegalStateException(
                    "Franchise lifecycle status is not configured."
            );
        }

        if (currentStatus == requestedStatus) {
            throw new IllegalArgumentException(
                    "Franchise is already in status "
                            + requestedStatus
                            + "."
            );
        }

        boolean allowed =
                switch (currentStatus) {

                    case ONBOARDING ->
                            requestedStatus
                                    == FranchiseStatus.ACTIVE;

                    case ACTIVE ->
                            requestedStatus
                                    == FranchiseStatus.SUSPENDED;

                    case SUSPENDED ->
                            requestedStatus
                                    == FranchiseStatus.ACTIVE;

                    default -> false;
                };

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Invalid franchise lifecycle transition: "
                            + currentStatus
                            + " -> "
                            + requestedStatus
                            + "."
            );
        }
    }

    private AdminFranchiseStatusResponse toStatusResponse(
            Franchise franchise
    ) {

        return new AdminFranchiseStatusResponse(
                franchise.getId(),
                franchise.getFranchiseCode(),
                franchise.getDisplayName(),
                franchise.getStatus(),
                franchise.getActivatedAt(),
                franchise.getSuspendedAt(),
                franchise.getTerminatedAt(),
                franchise.getUpdatedAt()
        );
    }

    private static final int BOOTSTRAP_SECRET_BYTES = 48;

    private final AdminAccessService adminAccessService;
    private final GeoDistrictRepository geoDistrictRepository;
    private final FranchiseRepository franchiseRepository;
    private final FranchiseDistrictAllocationRepository
            franchiseDistrictAllocationRepository;
    private final FranchiseUserRepository franchiseUserRepository;
    private final FranchiseTerritoryRepository franchiseTerritoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Override
    @Transactional
    public AdminFranchiseResponse createDistrictFranchise(
            String administratorEmail,
            CreateDistrictFranchiseRequest request
    ) {
        adminAccessService.requireSuperAdmin(
                normalizeRequiredEmail(
                        administratorEmail,
                        "Administrator email is required."
                )
        );

        if (request == null) {
            throw new IllegalArgumentException(
                    "Franchise provisioning request is required."
            );
        }

        String franchiseCode =
                normalizeFranchiseCode(
                        request.franchiseCode()
                );

        String franchiseName =
                normalizeRequiredText(
                        request.franchiseName(),
                        "Franchise name is required."
                );

        String ownerFullName =
                normalizeRequiredText(
                        request.ownerFullName(),
                        "Owner full name is required."
                );

        String ownerEmail =
                normalizeRequiredEmail(
                        request.ownerEmail(),
                        "Owner email is required."
                );

        String ownerMobile =
                normalizeOptionalText(
                        request.ownerMobile()
                );

        if (request.districtId() == null) {
            throw new IllegalArgumentException(
                    "District is required."
            );
        }

        GeoDistrict district =
                geoDistrictRepository
                        .findById(
                                request.districtId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Selected district was not found."
                                        )
                        );

        if (!Boolean.TRUE.equals(district.getActive())) {
            throw new IllegalStateException(
                    "Selected district is not active."
            );
        }

        GeoState state =
                district.getState();

        if (state == null) {
            throw new IllegalStateException(
                    "Selected district does not have a state."
            );
        }

        if (!Boolean.TRUE.equals(state.getActive())) {
            throw new IllegalStateException(
                    "Selected district belongs to an inactive state."
            );
        }

        if (
                franchiseRepository
                        .existsByFranchiseCode(
                                franchiseCode
                        )
        ) {
            throw new ResourceAlreadyExistsException(
                    "A franchise already exists with this code."
            );
        }

        if (
                franchiseDistrictAllocationRepository
                        .existsByDistrictIdAndActiveTrue(
                                district.getId()
                        )
        ) {
            throw new ResourceAlreadyExistsException(
                    "This district already has an active franchise."
            );
        }

        if (
                userRepository
                        .findByEmail(
                                ownerEmail
                        )
                        .isPresent()
        ) {
            throw new ResourceAlreadyExistsException(
                    "An account already exists with this owner email."
            );
        }

        if (
                ownerMobile != null
                        && userRepository.existsByMobile(
                                ownerMobile
                        )
        ) {
            throw new ResourceAlreadyExistsException(
                    "An account already exists with this owner mobile."
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        Franchise franchise =
                Franchise
                        .builder()
                        .franchiseCode(franchiseCode)
                        .legalName(franchiseName)
                        .displayName(franchiseName)
                        .status(FranchiseStatus.ONBOARDING)
                        .contactName(ownerFullName)
                        .contactEmail(ownerEmail)
                        .contactMobile(ownerMobile)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        Franchise savedFranchise =
                franchiseRepository.save(
                        franchise
                );

        FranchiseDistrictAllocation allocation =
                FranchiseDistrictAllocation
                        .builder()
                        .franchise(savedFranchise)
                        .district(district)
                        .active(true)
                        .allocatedAt(now)
                        .endedAt(null)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        FranchiseDistrictAllocation savedAllocation =
                franchiseDistrictAllocationRepository.save(
                        allocation
                );

        User owner =
                new User();

        owner.setFullName(
                ownerFullName
        );

        owner.setEmail(
                ownerEmail
        );

        owner.setMobile(
                ownerMobile
        );

        owner.setPassword(
                passwordEncoder.encode(
                        generateBootstrapSecret()
                )
        );

        owner.setRole(
                Role.ROLE_FRANCHISE
        );

        owner.setAdminAccessLevel(
                null
        );

        owner.setStatus(
                UserStatus.ACTIVE
        );

        owner.setEnabled(
                true
        );

        /*
         * The owner account is provisioned by HQ.
         *
         * The real password is established through the existing
         * OTP-backed password-reset flow sent to this email.
         */
        owner.setEmailVerified(
                true
        );

        owner.setEmailVerifiedAt(
                now
        );

        User savedOwner =
                userRepository.save(
                        owner
                );

        FranchiseUser franchiseOwner =
                FranchiseUser
                        .builder()
                        .franchise(savedFranchise)
                        .user(savedOwner)
                        .staffRole(
                                FranchiseStaffRole.FRANCHISE_OWNER
                        )
                        .status(
                                FranchiseUserStatus.ACTIVE
                        )
                        .joinedAt(now)
                        .deactivatedAt(null)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        FranchiseUser savedFranchiseOwner =
                franchiseUserRepository.save(
                        franchiseOwner
                );

        /*
         * Nobody, including HQ, receives or knows the random
         * bootstrap password.
         *
         * The owner establishes the real password through the
         * existing secure OTP-backed password-reset flow.
         */
        passwordResetService.requestOtp(
                new ForgotPasswordRequest(
                        savedOwner.getEmail()
                )
        );

        return toResponse(
                savedFranchise,
                savedAllocation,
                district,
                state,
                savedOwner,
                savedFranchiseOwner
        );
    }

    private AdminFranchiseResponse toResponse(
            Franchise franchise,
            FranchiseDistrictAllocation allocation,
            GeoDistrict district,
            GeoState state,
            User owner,
            FranchiseUser franchiseOwner
    ) {
        return new AdminFranchiseResponse(
                franchise.getId(),
                franchise.getFranchiseCode(),
                franchise.getDisplayName(),
                franchise.getStatus(),

                allocation.getId(),

                state.getId(),
                state.getLgdCode(),
                state.getName(),

                district.getId(),
                district.getLgdCode(),
                district.getName(),

                owner.getId(),
                owner.getFullName(),
                owner.getEmail(),
                owner.getMobile(),
                owner.getStatus(),

                franchiseOwner.getId(),
                franchiseOwner.getStaffRole(),
                franchiseOwner.getStatus(),

                allocation.getAllocatedAt(),
                franchise.getCreatedAt(),
                franchise.getUpdatedAt()
        );
    }

    private String normalizeFranchiseCode(
            String value
    ) {
        String normalized =
                normalizeRequiredText(
                        value,
                        "Franchise code is required."
                )
                        .toUpperCase(
                                Locale.ROOT
                        );

        if (normalized.length() > 40) {
            throw new IllegalArgumentException(
                    "Franchise code must not exceed 40 characters."
            );
        }

        return normalized;
    }

    private String normalizeRequiredEmail(
            String value,
            String requiredMessage
    ) {
        return normalizeRequiredText(
                value,
                requiredMessage
        )
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String normalizeRequiredText(
            String value,
            String requiredMessage
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    requiredMessage
            );
        }

        return value.trim();
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private String generateBootstrapSecret() {
        byte[] bytes =
                new byte[
                        BOOTSTRAP_SECRET_BYTES
                ];

        secureRandom.nextBytes(
                bytes
        );

        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        bytes
                );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminFranchisePageResponse listFranchises(
            String administratorEmail,
            String search,
            FranchiseStatus status,
            int page,
            int size
    ) {
        adminAccessService.requireSuperAdmin(
                administratorEmail
        );

        int normalizedPage =
                Math.max(
                        page,
                        0
                );

        int normalizedSize =
                Math.min(
                        Math.max(
                                size,
                                1
                        ),
                        100
                );

        String normalizedSearch =
                normalizeOptionalSearch(
                        search
                );

        Page<Franchise> franchisePage =
                franchiseRepository.searchAdminFranchises(
                        normalizedSearch,
                        status,
                        PageRequest.of(
                                normalizedPage,
                                normalizedSize,
                                Sort.by(
                                        Sort.Direction.DESC,
                                        "createdAt"
                                )
                        )
                );

        List<AdminFranchiseResponse> content =
                franchisePage
                        .getContent()
                        .stream()
                        .map(
                                this::toAdminFranchiseResponse
                        )
                        .toList();

        return AdminFranchisePageResponse
                .builder()
                .content(
                        content
                )
                .page(
                        franchisePage.getNumber()
                )
                .size(
                        franchisePage.getSize()
                )
                .totalElements(
                        franchisePage.getTotalElements()
                )
                .totalPages(
                        franchisePage.getTotalPages()
                )
                .first(
                        franchisePage.isFirst()
                )
                .last(
                        franchisePage.isLast()
                )
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminFranchiseResponse getFranchise(
            String administratorEmail,
            UUID franchiseId
    ) {
        String normalizedAdministratorEmail =
                normalizeRequiredEmail(
                        administratorEmail,
                        "Administrator email is required."
                );

        if (franchiseId == null) {
            throw new IllegalArgumentException(
                    "Franchise ID is required."
            );
        }

        adminAccessService.requireSuperAdmin(
                normalizedAdministratorEmail
        );

        Franchise franchise =
                franchiseRepository
                        .findById(
                                franchiseId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Franchise was not found."
                                        )
                        );

        return toAdminFranchiseResponse(
                franchise
        );
    }


    private AdminFranchiseResponse toAdminFranchiseResponse(
            Franchise franchise
    ) {
        FranchiseDistrictAllocation allocation =
                franchiseDistrictAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                franchise.getId()
                        )
                        .or(
                                () ->
                                        franchiseDistrictAllocationRepository
                                                .findFirstByFranchiseIdOrderByAllocatedAtDescCreatedAtDesc(
                                                        franchise.getId()
                                                )
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "District allocation history was not found for franchise."
                                        )
                        );

        FranchiseUser ownerMembership =
                franchiseUserRepository
                        .findByFranchiseIdAndStaffRoleAndStatus(
                                franchise.getId(),
                                FranchiseStaffRole.FRANCHISE_OWNER,
                                FranchiseUserStatus.ACTIVE
                        )
                        .or(
                                () ->
                                        franchiseUserRepository
                                                .findFirstByFranchiseIdAndStaffRoleOrderByJoinedAtDescCreatedAtDesc(
                                                        franchise.getId(),
                                                        FranchiseStaffRole.FRANCHISE_OWNER
                                                )
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Franchise owner history was not found."
                                        )
                        );

        User owner =
                ownerMembership.getUser();

        GeoDistrict district =
                allocation.getDistrict();

        GeoState state =
                district.getState();

        return new AdminFranchiseResponse(
                franchise.getId(),
                franchise.getFranchiseCode(),
                franchise.getDisplayName(),
                franchise.getStatus(),

                allocation.getId(),

                state.getId(),
                state.getLgdCode(),
                state.getName(),

                district.getId(),
                district.getLgdCode(),
                district.getName(),

                owner.getId(),
                owner.getFullName(),
                owner.getEmail(),
                owner.getMobile(),
                owner.getStatus(),

                ownerMembership.getId(),
                ownerMembership.getStaffRole(),
                ownerMembership.getStatus(),

                allocation.getAllocatedAt(),
                franchise.getCreatedAt(),
                franchise.getUpdatedAt()
        );
    }


    @Override
    @Transactional
    public AdminFranchiseTerritoryResponse createTerritory(
            String administratorEmail,
            UUID franchiseId,
            CreateFranchiseTerritoryRequest request
    ) {
        String normalizedAdministratorEmail =
                normalizeRequiredEmail(
                        administratorEmail,
                        "Administrator email is required."
                );

        if (franchiseId == null) {
            throw new IllegalArgumentException(
                    "Franchise ID is required."
            );
        }

        adminAccessService.requireSuperAdmin(
                normalizedAdministratorEmail
        );

        if (request == null) {
            throw new IllegalArgumentException(
                    "Territory creation request is required."
            );
        }

        Franchise franchise =
                franchiseRepository
                        .findById(franchiseId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Franchise was not found."
                                        )
                        );

        FranchiseDistrictAllocation allocation =
                franchiseDistrictAllocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                franchise.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Active district allocation was not found for franchise."
                                        )
                        );

        String territoryCode =
                normalizeTerritoryCode(
                        request.territoryCode()
                );

        String territoryName =
                normalizeRequiredText(
                        request.name(),
                        "Territory name is required."
                );

        if (territoryName.length() > 180) {
            throw new IllegalArgumentException(
                    "Territory name must not exceed 180 characters."
            );
        }

        if (request.territoryType() == null) {
            throw new IllegalArgumentException(
                    "Territory type is required."
            );
        }

        String coverageDescription =
                normalizeOptionalText(
                        request.coverageDescription()
                );

        if (
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndTerritoryCode(
                                allocation.getId(),
                                territoryCode
                        )
        ) {
            throw new ResourceAlreadyExistsException(
                    "A territory already exists with this code for the franchise."
            );
        }

        if (
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndName(
                                allocation.getId(),
                                territoryName
                        )
        ) {
            throw new ResourceAlreadyExistsException(
                    "A territory already exists with this name for the franchise."
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        FranchiseTerritory territory =
                FranchiseTerritory
                        .builder()
                        .districtAllocation(allocation)
                        .territoryCode(territoryCode)
                        .name(territoryName)
                        .territoryType(request.territoryType())
                        .coverageDescription(coverageDescription)
                        .active(true)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        FranchiseTerritory savedTerritory =
                franchiseTerritoryRepository.save(
                        territory
                );

        return toAdminFranchiseTerritoryResponse(
                savedTerritory
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminFranchiseTerritoryResponse> listTerritories(
            String administratorEmail,
            UUID franchiseId
    ) {
        String normalizedAdministratorEmail =
                normalizeRequiredEmail(
                        administratorEmail,
                        "Administrator email is required."
                );

        if (franchiseId == null) {
            throw new IllegalArgumentException(
                    "Franchise ID is required."
            );
        }

        adminAccessService.requireSuperAdmin(
                normalizedAdministratorEmail
        );

        franchiseRepository
                .findById(franchiseId)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Franchise was not found."
                                )
                );

        return franchiseTerritoryRepository
                .findAllForAdminFranchise(
                        franchiseId
                )
                .stream()
                .map(
                        this::toAdminFranchiseTerritoryResponse
                )
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminFranchiseTerritoryResponse getTerritory(
            String administratorEmail,
            UUID franchiseId,
            UUID territoryId
    ) {
        String normalizedAdministratorEmail =
                normalizeRequiredEmail(
                        administratorEmail,
                        "Administrator email is required."
                );

        if (franchiseId == null) {
            throw new IllegalArgumentException(
                    "Franchise ID is required."
            );
        }

        if (territoryId == null) {
            throw new IllegalArgumentException(
                    "Territory ID is required."
            );
        }

        adminAccessService.requireSuperAdmin(
                normalizedAdministratorEmail
        );

        franchiseRepository
                .findById(franchiseId)
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Franchise was not found."
                                )
                );

        FranchiseTerritory territory =
                franchiseTerritoryRepository
                        .findForAdminFranchise(
                                franchiseId,
                                territoryId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Territory was not found for this franchise."
                                        )
                        );

        return toAdminFranchiseTerritoryResponse(
                territory
        );
    }

    private AdminFranchiseTerritoryResponse
    toAdminFranchiseTerritoryResponse(
            FranchiseTerritory territory
    ) {
        FranchiseDistrictAllocation allocation =
                territory.getDistrictAllocation();

        if (allocation == null) {
            throw new IllegalStateException(
                    "Territory does not have a district allocation."
            );
        }

        Franchise franchise =
                allocation.getFranchise();

        if (franchise == null) {
            throw new IllegalStateException(
                    "Territory allocation does not have a franchise."
            );
        }

        GeoDistrict district =
                allocation.getDistrict();

        if (district == null) {
            throw new IllegalStateException(
                    "Territory allocation does not have a district."
            );
        }

        GeoState state =
                district.getState();

        if (state == null) {
            throw new IllegalStateException(
                    "Territory district does not have a state."
            );
        }

        return new AdminFranchiseTerritoryResponse(
                territory.getId(),

                territory.getTerritoryCode(),
                territory.getName(),
                territory.getTerritoryType(),
                territory.getCoverageDescription(),
                territory.getActive(),

                franchise.getId(),
                franchise.getFranchiseCode(),
                franchise.getDisplayName(),

                allocation.getId(),

                state.getId(),
                state.getLgdCode(),
                state.getName(),

                district.getId(),
                district.getLgdCode(),
                district.getName(),

                territory.getCreatedAt(),
                territory.getUpdatedAt()
        );
    }

    private String normalizeTerritoryCode(
            String value
    ) {
        String normalized =
                normalizeRequiredText(
                        value,
                        "Territory code is required."
                )
                        .toUpperCase(
                                Locale.ROOT
                        );

        if (normalized.length() > 60) {
            throw new IllegalArgumentException(
                    "Territory code must not exceed 60 characters."
            );
        }

        return normalized;
    }

    private String normalizeOptionalSearch(
            String search
    ) {
        if (search == null) {
            return null;
        }

        String normalized =
                search.trim();

        if (normalized.isEmpty()) {
            return null;
        }

        return normalized;
    }

}
