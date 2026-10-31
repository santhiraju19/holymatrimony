package com.theholymatrimony.backend.admin.franchise.service;

import com.theholymatrimony.backend.admin.access.AdminAccessService;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchiseTerritoryResponse;
import com.theholymatrimony.backend.admin.franchise.dto.AdminFranchisePageResponse;
import com.theholymatrimony.backend.admin.franchise.dto.CreateDistrictFranchiseRequest;
import com.theholymatrimony.backend.admin.franchise.dto.CreateFranchiseTerritoryRequest;
import com.theholymatrimony.backend.admin.franchise.dto.UpdateFranchiseStatusRequest;
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
import com.theholymatrimony.backend.franchise.enums.FranchiseTerritoryType;
import com.theholymatrimony.backend.franchise.enums.FranchiseUserStatus;
import com.theholymatrimony.backend.franchise.repository.FranchiseDistrictAllocationRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseTerritoryRepository;
import com.theholymatrimony.backend.franchise.repository.FranchiseUserRepository;
import com.theholymatrimony.backend.franchise.repository.GeoDistrictRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.mockito.ArgumentCaptor;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class AdminFranchiseManagementServiceImplTests {

    private GeoDistrictRepository geoDistrictRepository;
    private FranchiseRepository franchiseRepository;
    private FranchiseDistrictAllocationRepository allocationRepository;
    private FranchiseTerritoryRepository franchiseTerritoryRepository;
    private UserRepository userRepository;
    private FranchiseUserRepository franchiseUserRepository;
    private AdminAccessService adminAccessService;
    private PasswordEncoder passwordEncoder;
    private PasswordResetService passwordResetService;

    private AdminFranchiseManagementServiceImpl service;

    @BeforeEach
    void setUp() {
        geoDistrictRepository =
                mock(GeoDistrictRepository.class);

        franchiseRepository =
                mock(FranchiseRepository.class);

        allocationRepository =
                mock(FranchiseDistrictAllocationRepository.class);

        franchiseTerritoryRepository =
                mock(FranchiseTerritoryRepository.class);

        userRepository =
                mock(UserRepository.class);

        franchiseUserRepository =
                mock(FranchiseUserRepository.class);

        adminAccessService =
                mock(AdminAccessService.class);

        passwordEncoder =
                mock(PasswordEncoder.class);

        passwordResetService =
                mock(PasswordResetService.class);

        service =
                new AdminFranchiseManagementServiceImpl(
                        adminAccessService,
                        geoDistrictRepository,
                        franchiseRepository,
                        allocationRepository,
                        franchiseUserRepository,
                        franchiseTerritoryRepository,
                        userRepository,
                        passwordEncoder,
                        passwordResetService
                );
    }

    @Test
    void createDistrictFranchiseProvisionsFranchiseAllocationAndOwner() {
        String administratorEmail =
                "primary@example.com";

        UUID stateId =
                UUID.randomUUID();

        UUID districtId =
                UUID.randomUUID();

        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        UUID ownerId =
                UUID.randomUUID();

        UUID membershipId =
                UUID.randomUUID();

        GeoState state =
                GeoState.builder()
                        .id(stateId)
                        .lgdCode(28)
                        .name("Andhra Pradesh")
                        .countryCode("IN")
                        .active(true)
                        .build();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .state(state)
                        .lgdCode(506)
                        .name("Guntur")
                        .active(true)
                        .build();

        CreateDistrictFranchiseRequest request =
                new CreateDistrictFranchiseRequest(
                        " hm-gnt-001 ",
                        " Holy Matrimony Guntur ",
                        districtId,
                        " District Owner ",
                        " OWNER@EXAMPLE.COM ",
                        " 9876543210 "
                );

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(district)
        );

        when(
                franchiseRepository.existsByFranchiseCode(
                        "HM-GNT-001"
                )
        ).thenReturn(false);

        when(
                allocationRepository
                        .existsByDistrictIdAndActiveTrue(
                                districtId
                        )
        ).thenReturn(false);

        when(
                userRepository.findByEmail(
                        "owner@example.com"
                )
        ).thenReturn(
                Optional.empty()
        );

        when(
                passwordEncoder.encode(
                        any(CharSequence.class)
                )
        ).thenReturn(
                "encoded-bootstrap-secret"
        );

        when(
                franchiseRepository.save(
                        any(Franchise.class)
                )
        ).thenAnswer(
                invocation -> {
                    Franchise franchise =
                            invocation.getArgument(0);

                    franchise.setId(franchiseId);

                    return franchise;
                }
        );

        when(
                allocationRepository.save(
                        any(FranchiseDistrictAllocation.class)
                )
        ).thenAnswer(
                invocation -> {
                    FranchiseDistrictAllocation allocation =
                            invocation.getArgument(0);

                    allocation.setId(allocationId);

                    return allocation;
                }
        );

        when(
                userRepository.save(
                        any(User.class)
                )
        ).thenAnswer(
                invocation -> {
                    User user =
                            invocation.getArgument(0);

                    user.setId(ownerId);

                    return user;
                }
        );

        when(
                franchiseUserRepository.save(
                        any(FranchiseUser.class)
                )
        ).thenAnswer(
                invocation -> {
                    FranchiseUser franchiseUser =
                            invocation.getArgument(0);

                    franchiseUser.setId(membershipId);

                    return franchiseUser;
                }
        );

        AdminFranchiseResponse response =
                service.createDistrictFranchise(
                        administratorEmail,
                        request
                );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                franchiseRepository
        ).save(
                argThat(
                        franchise ->
                                "HM-GNT-001".equals(
                                        franchise.getFranchiseCode()
                                )
                                        && "Holy Matrimony Guntur".equals(
                                        franchise.getLegalName()
                                )
                                        && "Holy Matrimony Guntur".equals(
                                        franchise.getDisplayName()
                                )
                                        && franchise.getStatus()
                                        == FranchiseStatus.ONBOARDING
                                        && "District Owner".equals(
                                        franchise.getContactName()
                                )
                                        && "owner@example.com".equals(
                                        franchise.getContactEmail()
                                )
                                        && "9876543210".equals(
                                        franchise.getContactMobile()
                                )
                )
        );

        verify(
                allocationRepository
        ).save(
                argThat(
                        allocation ->
                                allocation.getFranchise() != null
                                        && franchiseId.equals(
                                        allocation
                                                .getFranchise()
                                                .getId()
                                )
                                        && districtId.equals(
                                        allocation
                                                .getDistrict()
                                                .getId()
                                )
                                        && Boolean.TRUE.equals(
                                        allocation.getActive()
                                )
                                        && allocation.getAllocatedAt()
                                        != null
                                        && allocation.getEndedAt()
                                        == null
                )
        );

        verify(
                userRepository
        ).save(
                argThat(
                        user ->
                                "District Owner".equals(
                                        user.getFullName()
                                )
                                        && "owner@example.com".equals(
                                        user.getEmail()
                                )
                                        && "encoded-bootstrap-secret".equals(
                                        user.getPassword()
                                )
                                        && user.getRole()
                                        == Role.ROLE_FRANCHISE
                                        && user.getStatus()
                                        == UserStatus.ACTIVE
                                        && Boolean.TRUE.equals(
                                        user.getEnabled()
                                )
                                        && Boolean.TRUE.equals(
                                        user.getEmailVerified()
                                )
                )
        );

        verify(
                franchiseUserRepository
        ).save(
                argThat(
                        franchiseUser ->
                                franchiseUser.getFranchise() != null
                                        && franchiseId.equals(
                                        franchiseUser
                                                .getFranchise()
                                                .getId()
                                )
                                        && franchiseUser.getUser()
                                        != null
                                        && ownerId.equals(
                                        franchiseUser
                                                .getUser()
                                                .getId()
                                )
                                        && franchiseUser.getStaffRole()
                                        == FranchiseStaffRole.FRANCHISE_OWNER
                                        && franchiseUser.getStatus()
                                        == FranchiseUserStatus.ACTIVE
                                        && franchiseUser.getJoinedAt()
                                        != null
                                        && franchiseUser.getDeactivatedAt()
                                        == null
                )
        );

        verify(
                passwordResetService
        ).requestOtp(
                argThat(
                        otpRequest ->
                                otpRequest != null
                                        && "owner@example.com".equals(
                                        otpRequest.email()
                                )
                )
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );

        assertEquals(
                allocationId,
                response.allocationId()
        );

        assertEquals(
                "HM-GNT-001",
                response.franchiseCode()
        );

        assertEquals(
                "Holy Matrimony Guntur",
                response.franchiseName()
        );

        assertEquals(
                FranchiseStatus.ONBOARDING,
                response.franchiseStatus()
        );

        assertEquals(
                stateId,
                response.stateId()
        );

        assertEquals(
                28,
                response.stateLgdCode()
        );

        assertEquals(
                "Andhra Pradesh",
                response.stateName()
        );

        assertEquals(
                districtId,
                response.districtId()
        );

        assertEquals(
                506,
                response.districtLgdCode()
        );

        assertEquals(
                "Guntur",
                response.districtName()
        );

        assertEquals(
                ownerId,
                response.ownerUserId()
        );

        assertEquals(
                "District Owner",
                response.ownerFullName()
        );

        assertEquals(
                "owner@example.com",
                response.ownerEmail()
        );

        assertEquals(
                "9876543210",
                response.ownerMobile()
        );

        assertEquals(
                FranchiseStaffRole.FRANCHISE_OWNER,
                response.ownerStaffRole()
        );

    }

    @Test
    void createDistrictFranchiseRejectsUnknownDistrictBeforeWrites() {
        String administratorEmail =
                "primary@example.com";

        UUID districtId =
                UUID.randomUUID();

        CreateDistrictFranchiseRequest request =
                request(districtId);

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.empty()
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createDistrictFranchise(
                                        administratorEmail,
                                        request
                                )
                );

        assertEquals(
                "Selected district was not found.",
                exception.getMessage()
        );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                any(ForgotPasswordRequest.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsInactiveDistrictBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        GeoState state =
                GeoState.builder()
                        .id(UUID.randomUUID())
                        .lgdCode(28)
                        .name("Andhra Pradesh")
                        .active(true)
                        .build();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .state(state)
                        .lgdCode(506)
                        .name("Guntur")
                        .active(false)
                        .build();

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(district)
        );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request(districtId)
                                )
                );

        assertEquals(
                "Selected district is not active.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsInactiveStateBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        GeoState state =
                GeoState.builder()
                        .id(UUID.randomUUID())
                        .lgdCode(28)
                        .name("Andhra Pradesh")
                        .active(false)
                        .build();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(districtId)
                        .state(state)
                        .lgdCode(506)
                        .name("Guntur")
                        .active(true)
                        .build();

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(district)
        );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request(districtId)
                                )
                );

        assertEquals(
                "Selected district belongs to an inactive state.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsDuplicateFranchiseCodeBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(
                        activeDistrict(districtId)
                )
        );

        when(
                franchiseRepository.existsByFranchiseCode(
                        "HM-GNT-001"
                )
        ).thenReturn(true);

        ResourceAlreadyExistsException exception =
                assertThrows(
                        ResourceAlreadyExistsException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request(districtId)
                                )
                );

        assertEquals(
                "A franchise already exists with this code.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsDistrictWithActiveFranchiseBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(
                        activeDistrict(districtId)
                )
        );

        when(
                franchiseRepository.existsByFranchiseCode(
                        "HM-GNT-001"
                )
        ).thenReturn(false);

        when(
                allocationRepository
                        .existsByDistrictIdAndActiveTrue(
                                districtId
                        )
        ).thenReturn(true);

        ResourceAlreadyExistsException exception =
                assertThrows(
                        ResourceAlreadyExistsException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request(districtId)
                                )
                );

        assertEquals(
                "This district already has an active franchise.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsExistingOwnerEmailBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(
                        activeDistrict(districtId)
                )
        );

        when(
                franchiseRepository.existsByFranchiseCode(
                        "HM-GNT-001"
                )
        ).thenReturn(false);

        when(
                allocationRepository
                        .existsByDistrictIdAndActiveTrue(
                                districtId
                        )
        ).thenReturn(false);

        when(
                userRepository.findByEmail(
                        "owner@example.com"
                )
        ).thenReturn(
                Optional.of(
                        User.builder()
                                .id(UUID.randomUUID())
                                .email("owner@example.com")
                                .build()
                )
        );

        ResourceAlreadyExistsException exception =
                assertThrows(
                        ResourceAlreadyExistsException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request(districtId)
                                )
                );

        assertEquals(
                "An account already exists with this owner email.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                any(ForgotPasswordRequest.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsExistingOwnerMobileBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        when(
                geoDistrictRepository.findById(
                        districtId
                )
        ).thenReturn(
                Optional.of(
                        activeDistrict(districtId)
                )
        );

        when(
                franchiseRepository.existsByFranchiseCode(
                        "HM-GNT-001"
                )
        ).thenReturn(false);

        when(
                allocationRepository
                        .existsByDistrictIdAndActiveTrue(
                                districtId
                        )
        ).thenReturn(false);

        when(
                userRepository.findByEmail(
                        "owner@example.com"
                )
        ).thenReturn(
                Optional.empty()
        );

        when(
                userRepository.existsByMobile(
                        "9876543210"
                )
        ).thenReturn(true);

        ResourceAlreadyExistsException exception =
                assertThrows(
                        ResourceAlreadyExistsException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request(districtId)
                                )
                );

        assertEquals(
                "An account already exists with this owner mobile.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                allocationRepository,
                never()
        ).save(
                any(FranchiseDistrictAllocation.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );

        verify(
                franchiseUserRepository,
                never()
        ).save(
                any(FranchiseUser.class)
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                any(ForgotPasswordRequest.class)
        );
    }

    @Test
    void createDistrictFranchiseRejectsCodeLongerThanDatabaseLimitBeforeWrites() {
        UUID districtId =
                UUID.randomUUID();

        String franchiseCode =
                "F".repeat(41);

        CreateDistrictFranchiseRequest request =
                new CreateDistrictFranchiseRequest(
                        franchiseCode,
                        "Holy Matrimony Guntur",
                        districtId,
                        "District Owner",
                        "owner@example.com",
                        "9876543210"
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createDistrictFranchise(
                                        "primary@example.com",
                                        request
                                )
                );

        assertEquals(
                "Franchise code must not exceed 40 characters.",
                exception.getMessage()
        );

        verify(
                franchiseRepository,
                never()
        ).save(
                any(Franchise.class)
        );

        verify(
                allocationRepository,
                never()
        ).save(
                any(FranchiseDistrictAllocation.class)
        );

        verify(
                userRepository,
                never()
        ).save(
                any(User.class)
        );

        verify(
                franchiseUserRepository,
                never()
        ).save(
                any(FranchiseUser.class)
        );

        verify(
                passwordResetService,
                never()
        ).requestOtp(
                any(ForgotPasswordRequest.class)
        );
    }

    private CreateDistrictFranchiseRequest request(
            UUID districtId
    ) {
        return new CreateDistrictFranchiseRequest(
                "HM-GNT-001",
                "Holy Matrimony Guntur",
                districtId,
                "District Owner",
                "owner@example.com",
                "9876543210"
        );
    }

    private GeoDistrict activeDistrict(
            UUID districtId
    ) {
        GeoState state =
                GeoState.builder()
                        .id(UUID.randomUUID())
                        .lgdCode(28)
                        .name("Andhra Pradesh")
                        .countryCode("IN")
                        .active(true)
                        .build();

        return GeoDistrict.builder()
                .id(districtId)
                .state(state)
                .lgdCode(506)
                .name("Guntur")
                .active(true)
                .build();
    }

    @Test
    void listFranchisesRequiresSuperAdminBeforeRepositoryAccess() {
        String administratorEmail =
                "subadmin@theholymatrimony.com";

        doThrow(
                new org.springframework.security.access.AccessDeniedException(
                        "SUPER_ADMIN access required."
                )
        ).when(
                adminAccessService
        ).requireSuperAdmin(
                administratorEmail
        );

        assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () ->
                        service.listFranchises(
                                administratorEmail,
                                null,
                                null,
                                0,
                                20
                        )
        );

        verify(
                franchiseRepository,
                never()
        ).searchAdminFranchises(
                any(),
                any(),
                any()
        );
    }

    @Test
    void listFranchisesNormalizesBlankSearchPageAndSizeAndSortsNewestFirst() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        when(
                franchiseRepository.searchAdminFranchises(
                        any(),
                        any(),
                        any()
                )
        ).thenReturn(
                new PageImpl<>(
                        java.util.List.of(),
                        PageRequest.of(
                                0,
                                1,
                                Sort.by(
                                        Sort.Direction.DESC,
                                        "createdAt"
                                )
                        ),
                        0
                )
        );

        AdminFranchisePageResponse response =
                service.listFranchises(
                        administratorEmail,
                        "   ",
                        null,
                        -5,
                        0
                );

        ArgumentCaptor<Pageable> pageableCaptor =
                ArgumentCaptor.forClass(
                        Pageable.class
                );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                franchiseRepository
        ).searchAdminFranchises(
                org.mockito.ArgumentMatchers.isNull(),
                org.mockito.ArgumentMatchers.isNull(),
                pageableCaptor.capture()
        );

        Pageable pageable =
                pageableCaptor.getValue();

        assertEquals(
                0,
                pageable.getPageNumber()
        );

        assertEquals(
                1,
                pageable.getPageSize()
        );

        Sort.Order createdAtOrder =
                pageable
                        .getSort()
                        .getOrderFor(
                                "createdAt"
                        );

        org.junit.jupiter.api.Assertions.assertNotNull(
                createdAtOrder
        );

        assertEquals(
                Sort.Direction.DESC,
                createdAtOrder.getDirection()
        );

        assertEquals(
                0,
                response.getPage()
        );

        assertEquals(
                1,
                response.getSize()
        );

        assertEquals(
                0,
                response.getContent().size()
        );
    }

    @Test
    void listFranchisesTrimsSearchPreservesStatusAndCapsPageSizeAtOneHundred() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        when(
                franchiseRepository.searchAdminFranchises(
                        any(),
                        any(),
                        any()
                )
        ).thenReturn(
                new PageImpl<>(
                        java.util.List.of(),
                        PageRequest.of(
                                2,
                                100,
                                Sort.by(
                                        Sort.Direction.DESC,
                                        "createdAt"
                                )
                        ),
                        0
                )
        );

        service.listFranchises(
                administratorEmail,
                "  Guntur  ",
                FranchiseStatus.ACTIVE,
                2,
                500
        );

        ArgumentCaptor<Pageable> pageableCaptor =
                ArgumentCaptor.forClass(
                        Pageable.class
                );

        verify(
                franchiseRepository
        ).searchAdminFranchises(
                org.mockito.ArgumentMatchers.eq(
                        "Guntur"
                ),
                org.mockito.ArgumentMatchers.eq(
                        FranchiseStatus.ACTIVE
                ),
                pageableCaptor.capture()
        );

        assertEquals(
                2,
                pageableCaptor
                        .getValue()
                        .getPageNumber()
        );

        assertEquals(
                100,
                pageableCaptor
                        .getValue()
                        .getPageSize()
        );
    }


    @Test
    void getFranchiseRequiresSuperAdminBeforeRepositoryAccess() {
        UUID franchiseId =
                UUID.randomUUID();

        doThrow(
                new AccessDeniedException(
                        "Forbidden"
                )
        ).when(
                adminAccessService
        ).requireSuperAdmin(
                "admin@theholymatrimony.com"
        );

        assertThrows(
                AccessDeniedException.class,
                () ->
                        service.getFranchise(
                                " ADMIN@THEHOLYMATRIMONY.COM ",
                                franchiseId
                        )
        );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                "admin@theholymatrimony.com"
        );

        verify(
                franchiseRepository,
                never()
        ).findById(
                any()
        );

        verifyNoInteractions(
                allocationRepository,
                franchiseUserRepository
        );
    }

    @Test
    void getFranchiseRejectsNullIdBeforeAuthorizationAndRepositoryAccess() {
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.getFranchise(
                                "admin@theholymatrimony.com",
                                null
                        )
        );

        verifyNoInteractions(
                adminAccessService,
                franchiseRepository,
                allocationRepository,
                franchiseUserRepository
        );
    }

    @Test
    void getFranchiseRejectsMissingFranchiseAfterAuthorization() {
        UUID franchiseId =
                UUID.randomUUID();

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.getFranchise(
                                "admin@theholymatrimony.com",
                                franchiseId
                        )
        );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                "admin@theholymatrimony.com"
        );

        verify(
                franchiseRepository
        ).findById(
                franchiseId
        );

        verifyNoInteractions(
                allocationRepository,
                franchiseUserRepository
        );
    }

    @Test
    void getFranchiseMapsPersistedFranchiseAllocationGeographyAndOwner() {
        UUID franchiseId =
                UUID.randomUUID();
        UUID allocationId =
                UUID.randomUUID();
        UUID stateId =
                UUID.randomUUID();
        UUID districtId =
                UUID.randomUUID();
        UUID ownerId =
                UUID.randomUUID();
        UUID ownerMembershipId =
                UUID.randomUUID();

        Franchise franchise =
                mock(
                        Franchise.class
                );

        FranchiseDistrictAllocation allocation =
                mock(
                        FranchiseDistrictAllocation.class
                );

        GeoDistrict district =
                mock(
                        GeoDistrict.class
                );

        GeoState state =
                mock(
                        GeoState.class
                );

        FranchiseUser ownerMembership =
                mock(
                        FranchiseUser.class
                );

        User owner =
                mock(
                        User.class
                );

        when(
                franchise.getId()
        ).thenReturn(
                franchiseId
        );

        when(
                franchise.getFranchiseCode()
        ).thenReturn(
                "HM-GUNTUR-001"
        );

        when(
                franchise.getDisplayName()
        ).thenReturn(
                "Holy Matrimony Guntur"
        );

        when(
                franchise.getStatus()
        ).thenReturn(
                FranchiseStatus.ONBOARDING
        );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(
                        franchise
                )
        );

        when(
                allocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                franchiseId
                        )
        ).thenReturn(
                Optional.of(
                        allocation
                )
        );

        when(
                franchiseUserRepository
                        .findByFranchiseIdAndStaffRoleAndStatus(
                                franchiseId,
                                FranchiseStaffRole.FRANCHISE_OWNER,
                                FranchiseUserStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.of(
                        ownerMembership
                )
        );

        when(
                allocation.getId()
        ).thenReturn(
                allocationId
        );

        when(
                allocation.getDistrict()
        ).thenReturn(
                district
        );

        when(
                district.getId()
        ).thenReturn(
                districtId
        );

        when(
                district.getLgdCode()
        ).thenReturn(
                505
        );

        when(
                district.getName()
        ).thenReturn(
                "Guntur"
        );

        when(
                district.getState()
        ).thenReturn(
                state
        );

        when(
                state.getId()
        ).thenReturn(
                stateId
        );

        when(
                state.getLgdCode()
        ).thenReturn(
                28
        );

        when(
                state.getName()
        ).thenReturn(
                "Andhra Pradesh"
        );

        when(
                ownerMembership.getId()
        ).thenReturn(
                ownerMembershipId
        );

        when(
                ownerMembership.getStaffRole()
        ).thenReturn(
                FranchiseStaffRole.FRANCHISE_OWNER
        );

        when(
                ownerMembership.getStatus()
        ).thenReturn(
                FranchiseUserStatus.ACTIVE
        );

        when(
                ownerMembership.getUser()
        ).thenReturn(
                owner
        );

        when(
                owner.getId()
        ).thenReturn(
                ownerId
        );

        when(
                owner.getFullName()
        ).thenReturn(
                "Guntur Franchise Owner"
        );

        when(
                owner.getEmail()
        ).thenReturn(
                "owner@example.com"
        );

        AdminFranchiseResponse response =
                service.getFranchise(
                        " ADMIN@THEHOLYMATRIMONY.COM ",
                        franchiseId
                );

        assertNotNull(
                response
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );

        assertEquals(
                "HM-GUNTUR-001",
                response.franchiseCode()
        );

        assertEquals(
                "Guntur",
                response.districtName()
        );

        assertEquals(
                "Andhra Pradesh",
                response.stateName()
        );

        assertEquals(
                ownerId,
                response.ownerUserId()
        );

        assertEquals(
                "owner@example.com",
                response.ownerEmail()
        );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                "admin@theholymatrimony.com"
        );

        verify(
                franchiseRepository
        ).findById(
                franchiseId
        );
    }

    @Test
    void getFranchiseFallsBackToLatestHistoricalDistrictAllocation() {

        UUID franchiseId = UUID.randomUUID();
        UUID allocationId = UUID.randomUUID();
        UUID stateId = UUID.randomUUID();
        UUID districtId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID ownerMembershipId = UUID.randomUUID();

        Franchise franchise = mock(Franchise.class);
        FranchiseDistrictAllocation allocation =
                mock(FranchiseDistrictAllocation.class);
        GeoDistrict district = mock(GeoDistrict.class);
        GeoState state = mock(GeoState.class);
        FranchiseUser ownerMembership = mock(FranchiseUser.class);
        User owner = mock(User.class);

        when(franchise.getId()).thenReturn(franchiseId);
        when(franchise.getFranchiseCode()).thenReturn("HM-GUNTUR-001");
        when(franchise.getDisplayName()).thenReturn("Holy Matrimony Guntur");
        when(franchise.getStatus()).thenReturn(FranchiseStatus.TERMINATED);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        when(allocationRepository.findByFranchiseIdAndActiveTrue(franchiseId))
                .thenReturn(Optional.empty());

        when(
                allocationRepository
                        .findFirstByFranchiseIdOrderByAllocatedAtDescCreatedAtDesc(
                                franchiseId
                        )
        ).thenReturn(Optional.of(allocation));

        when(
                franchiseUserRepository
                        .findByFranchiseIdAndStaffRoleAndStatus(
                                franchiseId,
                                FranchiseStaffRole.FRANCHISE_OWNER,
                                FranchiseUserStatus.ACTIVE
                        )
        ).thenReturn(Optional.of(ownerMembership));

        when(allocation.getId()).thenReturn(allocationId);
        when(allocation.getDistrict()).thenReturn(district);

        when(district.getId()).thenReturn(districtId);
        when(district.getLgdCode()).thenReturn(506);
        when(district.getName()).thenReturn("Guntur");
        when(district.getState()).thenReturn(state);

        when(state.getId()).thenReturn(stateId);
        when(state.getLgdCode()).thenReturn(28);
        when(state.getName()).thenReturn("Andhra Pradesh");

        when(ownerMembership.getId()).thenReturn(ownerMembershipId);
        when(ownerMembership.getStaffRole())
                .thenReturn(FranchiseStaffRole.FRANCHISE_OWNER);
        when(ownerMembership.getStatus())
                .thenReturn(FranchiseUserStatus.ACTIVE);
        when(ownerMembership.getUser()).thenReturn(owner);

        when(owner.getId()).thenReturn(ownerId);
        when(owner.getFullName()).thenReturn("District Owner");
        when(owner.getEmail()).thenReturn("owner@example.com");
        when(owner.getStatus()).thenReturn(UserStatus.ACTIVE);

        AdminFranchiseResponse response =
                service.getFranchise(
                        "admin@theholymatrimony.com",
                        franchiseId
                );

        assertEquals(franchiseId, response.franchiseId());
        assertEquals(allocationId, response.allocationId());
        assertEquals(districtId, response.districtId());
        assertEquals("Guntur", response.districtName());
        assertEquals(ownerMembershipId, response.franchiseUserId());

        verify(
                allocationRepository
        ).findFirstByFranchiseIdOrderByAllocatedAtDescCreatedAtDesc(
                franchiseId
        );
    }

    @Test
    void getFranchiseFallsBackToLatestHistoricalOwnerMembership() {

        UUID franchiseId = UUID.randomUUID();
        UUID allocationId = UUID.randomUUID();
        UUID stateId = UUID.randomUUID();
        UUID districtId = UUID.randomUUID();
        UUID ownerId = UUID.randomUUID();
        UUID ownerMembershipId = UUID.randomUUID();

        Franchise franchise = mock(Franchise.class);
        FranchiseDistrictAllocation allocation =
                mock(FranchiseDistrictAllocation.class);
        GeoDistrict district = mock(GeoDistrict.class);
        GeoState state = mock(GeoState.class);
        FranchiseUser ownerMembership = mock(FranchiseUser.class);
        User owner = mock(User.class);

        when(franchise.getId()).thenReturn(franchiseId);
        when(franchise.getFranchiseCode()).thenReturn("HM-GUNTUR-001");
        when(franchise.getDisplayName()).thenReturn("Holy Matrimony Guntur");
        when(franchise.getStatus()).thenReturn(FranchiseStatus.TERMINATED);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        when(allocationRepository.findByFranchiseIdAndActiveTrue(franchiseId))
                .thenReturn(Optional.of(allocation));

        when(
                franchiseUserRepository
                        .findByFranchiseIdAndStaffRoleAndStatus(
                                franchiseId,
                                FranchiseStaffRole.FRANCHISE_OWNER,
                                FranchiseUserStatus.ACTIVE
                        )
        ).thenReturn(Optional.empty());

        when(
                franchiseUserRepository
                        .findFirstByFranchiseIdAndStaffRoleOrderByJoinedAtDescCreatedAtDesc(
                                franchiseId,
                                FranchiseStaffRole.FRANCHISE_OWNER
                        )
        ).thenReturn(Optional.of(ownerMembership));

        when(allocation.getId()).thenReturn(allocationId);
        when(allocation.getDistrict()).thenReturn(district);

        when(district.getId()).thenReturn(districtId);
        when(district.getLgdCode()).thenReturn(506);
        when(district.getName()).thenReturn("Guntur");
        when(district.getState()).thenReturn(state);

        when(state.getId()).thenReturn(stateId);
        when(state.getLgdCode()).thenReturn(28);
        when(state.getName()).thenReturn("Andhra Pradesh");

        when(ownerMembership.getId()).thenReturn(ownerMembershipId);
        when(ownerMembership.getStaffRole())
                .thenReturn(FranchiseStaffRole.FRANCHISE_OWNER);
        when(ownerMembership.getStatus())
                .thenReturn(FranchiseUserStatus.DEACTIVATED);
        when(ownerMembership.getUser()).thenReturn(owner);

        when(owner.getId()).thenReturn(ownerId);
        when(owner.getFullName()).thenReturn("Former District Owner");
        when(owner.getEmail()).thenReturn("former.owner@example.com");
        when(owner.getStatus()).thenReturn(UserStatus.ACTIVE);

        AdminFranchiseResponse response =
                service.getFranchise(
                        "admin@theholymatrimony.com",
                        franchiseId
                );

        assertEquals(franchiseId, response.franchiseId());
        assertEquals(allocationId, response.allocationId());
        assertEquals(ownerMembershipId, response.franchiseUserId());
        assertEquals(
                FranchiseUserStatus.DEACTIVATED,
                response.franchiseUserStatus()
        );

        verify(
                franchiseUserRepository
        ).findFirstByFranchiseIdAndStaffRoleOrderByJoinedAtDescCreatedAtDesc(
                franchiseId,
                FranchiseStaffRole.FRANCHISE_OWNER
        );
    }

    @Test
    void getFranchiseRejectsFranchiseWithoutActiveDistrictAllocation() {
        UUID franchiseId =
                UUID.randomUUID();

        Franchise franchise =
                mock(
                        Franchise.class
                );

        when(
                franchise.getId()
        ).thenReturn(
                franchiseId
        );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(
                        franchise
                )
        );

        when(
                allocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                franchiseId
                        )
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        service.getFranchise(
                                "admin@theholymatrimony.com",
                                franchiseId
                        )
        );

        verifyNoInteractions(
                franchiseUserRepository
        );
    }

    @Test
    void getFranchiseRejectsFranchiseWithoutActiveOwner() {
        UUID franchiseId =
                UUID.randomUUID();

        Franchise franchise =
                mock(
                        Franchise.class
                );

        FranchiseDistrictAllocation allocation =
                mock(
                        FranchiseDistrictAllocation.class
                );

        when(
                franchise.getId()
        ).thenReturn(
                franchiseId
        );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(
                        franchise
                )
        );

        when(
                allocationRepository
                        .findByFranchiseIdAndActiveTrue(
                                franchiseId
                        )
        ).thenReturn(
                Optional.of(
                        allocation
                )
        );

        when(
                franchiseUserRepository
                        .findByFranchiseIdAndStaffRoleAndStatus(
                                franchiseId,
                                FranchiseStaffRole.FRANCHISE_OWNER,
                                FranchiseUserStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.empty()
        );

        assertThrows(
                IllegalStateException.class,
                () ->
                        service.getFranchise(
                                "admin@theholymatrimony.com",
                                franchiseId
                        )
        );
    }

    @Test
    void createTerritoryCreatesNormalizedTerritoryForOnboardingFranchise() {
        String administratorEmail =
                "admin@theholymatrimony.com";

        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        FranchiseDistrictAllocation allocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        CreateFranchiseTerritoryRequest request =
                new CreateFranchiseTerritoryRequest(
                        " gnt-city ",
                        " Guntur City ",
                        FranchiseTerritoryType.CITY,
                        " Urban Guntur "
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndTerritoryCode(
                                allocationId,
                                "GNT-CITY"
                        )
        ).thenReturn(false);

        when(
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndName(
                                allocationId,
                                "Guntur City"
                        )
        ).thenReturn(false);

        when(
                franchiseTerritoryRepository.save(
                        any(FranchiseTerritory.class)
                )
        ).thenAnswer(
                invocation -> {
                    FranchiseTerritory territory =
                            invocation.getArgument(0);

                    territory.setId(territoryId);

                    return territory;
                }
        );

        AdminFranchiseTerritoryResponse response =
                service.createTerritory(
                        administratorEmail,
                        franchiseId,
                        request
                );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                administratorEmail
        );

        verify(
                franchiseTerritoryRepository
        ).save(
                argThat(
                        territory ->
                                territory.getDistrictAllocation()
                                        == allocation
                                        && "GNT-CITY".equals(
                                        territory.getTerritoryCode()
                                )
                                        && "Guntur City".equals(
                                        territory.getName()
                                )
                                        && territory.getTerritoryType()
                                        == FranchiseTerritoryType.CITY
                                        && "Urban Guntur".equals(
                                        territory.getCoverageDescription()
                                )
                                        && Boolean.TRUE.equals(
                                        territory.getActive()
                                )
                )
        );

        assertEquals(
                territoryId,
                response.territoryId()
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );

        assertEquals(
                allocationId,
                response.allocationId()
        );

        assertEquals(
                "GNT-CITY",
                response.territoryCode()
        );

        assertEquals(
                "Guntur City",
                response.name()
        );

        assertEquals(
                FranchiseTerritoryType.CITY,
                response.territoryType()
        );

        assertEquals(
                "Urban Guntur",
                response.coverageDescription()
        );

        assertTrue(
                response.active()
        );
    }

    @Test
    void createTerritoryRequiresSuperAdminBeforeRepositoryAccess() {
        UUID franchiseId =
                UUID.randomUUID();

        doThrow(
                new AccessDeniedException(
                        "Forbidden"
                )
        ).when(
                adminAccessService
        ).requireSuperAdmin(
                "admin@theholymatrimony.com"
        );

        assertThrows(
                AccessDeniedException.class,
                () ->
                        service.createTerritory(
                                " ADMIN@THEHOLYMATRIMONY.COM ",
                                franchiseId,
                                territoryRequest()
                        )
        );

        verify(
                adminAccessService
        ).requireSuperAdmin(
                "admin@theholymatrimony.com"
        );

        verifyNoInteractions(
                franchiseRepository,
                allocationRepository,
                franchiseTerritoryRepository
        );
    }

    @Test
    void createTerritoryRejectsMissingActiveAllocationBeforeTerritoryAccess() {
        UUID franchiseId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.empty()
        );

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () ->
                                service.createTerritory(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        territoryRequest()
                                )
                );

        assertEquals(
                "Active district allocation was not found for franchise.",
                exception.getMessage()
        );

        verifyNoInteractions(
                franchiseTerritoryRepository
        );
    }

    @Test
    void createTerritoryRejectsDuplicateTerritoryCodeBeforeSave() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        FranchiseDistrictAllocation allocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndTerritoryCode(
                                allocationId,
                                "GNT-CITY"
                        )
        ).thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () ->
                        service.createTerritory(
                                "admin@theholymatrimony.com",
                                franchiseId,
                                territoryRequest()
                        )
        );

        verify(
                franchiseTerritoryRepository,
                never()
        ).save(
                any(FranchiseTerritory.class)
        );
    }

    @Test
    void createTerritoryRejectsDuplicateTerritoryNameBeforeSave() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        FranchiseDistrictAllocation allocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndTerritoryCode(
                                allocationId,
                                "GNT-CITY"
                        )
        ).thenReturn(false);

        when(
                franchiseTerritoryRepository
                        .existsByDistrictAllocationIdAndName(
                                allocationId,
                                "Guntur City"
                        )
        ).thenReturn(true);

        assertThrows(
                ResourceAlreadyExistsException.class,
                () ->
                        service.createTerritory(
                                "admin@theholymatrimony.com",
                                franchiseId,
                                territoryRequest()
                        )
        );

        verify(
                franchiseTerritoryRepository,
                never()
        ).save(
                any(FranchiseTerritory.class)
        );
    }

    @Test
    void listTerritoriesReturnsActiveAndInactiveTerritoriesInFranchiseScope() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        FranchiseDistrictAllocation allocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        FranchiseTerritory activeTerritory =
                territory(
                        UUID.randomUUID(),
                        allocation,
                        "GNT-CITY",
                        "Guntur City",
                        true
                );

        FranchiseTerritory inactiveTerritory =
                territory(
                        UUID.randomUUID(),
                        allocation,
                        "GNT-RURAL",
                        "Guntur Rural",
                        false
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                franchiseTerritoryRepository.findAllForAdminFranchise(
                        franchiseId
                )
        ).thenReturn(
                java.util.List.of(
                        activeTerritory,
                        inactiveTerritory
                )
        );

        java.util.List<AdminFranchiseTerritoryResponse> response =
                service.listTerritories(
                        "admin@theholymatrimony.com",
                        franchiseId
                );

        assertEquals(
                2,
                response.size()
        );

        assertTrue(
                response.get(0).active()
        );

        assertEquals(
                false,
                response.get(1).active()
        );

        verify(
                franchiseTerritoryRepository
        ).findAllForAdminFranchise(
                franchiseId
        );
    }

    @Test
    void listTerritoriesReturnsHistoricalTerritoriesWithoutActiveAllocation() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.TERMINATED
                );

        FranchiseDistrictAllocation historicalAllocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        historicalAllocation.setActive(false);
        historicalAllocation.setEndedAt(
                LocalDateTime.now()
        );

        FranchiseTerritory historicalTerritory =
                territory(
                        UUID.randomUUID(),
                        historicalAllocation,
                        "GNT-HIST",
                        "Historical Guntur Territory",
                        false
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                franchiseTerritoryRepository.findAllForAdminFranchise(
                        franchiseId
                )
        ).thenReturn(
                java.util.List.of(
                        historicalTerritory
                )
        );

        java.util.List<AdminFranchiseTerritoryResponse> response =
                service.listTerritories(
                        "admin@theholymatrimony.com",
                        franchiseId
                );

        assertEquals(
                1,
                response.size()
        );

        assertEquals(
                allocationId,
                response.get(0).allocationId()
        );

        assertEquals(
                franchiseId,
                response.get(0).franchiseId()
        );

        assertEquals(
                "Historical Guntur Territory",
                response.get(0).name()
        );

        assertEquals(
                false,
                response.get(0).active()
        );

        verify(
                allocationRepository,
                never()
        ).findByFranchiseIdAndActiveTrue(
                any()
        );

        verify(
                franchiseTerritoryRepository
        ).findAllForAdminFranchise(
                franchiseId
        );
    }

    @Test
    void getTerritoryReturnsTerritoryInsideRequestedFranchiseScope() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        FranchiseDistrictAllocation allocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        FranchiseTerritory territory =
                territory(
                        territoryId,
                        allocation,
                        "GNT-CITY",
                        "Guntur City",
                        true
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                franchiseTerritoryRepository.findForAdminFranchise(
                        franchiseId,
                        territoryId
                )
        ).thenReturn(
                Optional.of(territory)
        );

        AdminFranchiseTerritoryResponse response =
                service.getTerritory(
                        "admin@theholymatrimony.com",
                        franchiseId,
                        territoryId
                );

        assertEquals(
                territoryId,
                response.territoryId()
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );

        assertEquals(
                allocationId,
                response.allocationId()
        );

        assertEquals(
                "Guntur City",
                response.name()
        );
    }

    @Test
    void getTerritoryRejectsTerritoryOutsideRequestedFranchiseScope() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.ONBOARDING
                );

        FranchiseDistrictAllocation allocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                allocationRepository.findByFranchiseIdAndActiveTrue(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(allocation)
        );

        when(
                franchiseTerritoryRepository.findForAdminFranchise(
                        franchiseId,
                        territoryId
                )
        ).thenReturn(
                Optional.empty()
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.getTerritory(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        territoryId
                                )
                );

        assertEquals(
                "Territory was not found for this franchise.",
                exception.getMessage()
        );
    }

    @Test
    void getTerritoryReturnsTerritoryFromHistoricalAllocation() {
        UUID franchiseId =
                UUID.randomUUID();

        UUID allocationId =
                UUID.randomUUID();

        UUID territoryId =
                UUID.randomUUID();

        Franchise franchise =
                territoryFranchise(
                        franchiseId,
                        FranchiseStatus.TERMINATED
                );

        FranchiseDistrictAllocation historicalAllocation =
                territoryAllocation(
                        allocationId,
                        franchise
                );

        historicalAllocation.setActive(false);
        historicalAllocation.setEndedAt(
                LocalDateTime.now()
        );

        FranchiseTerritory historicalTerritory =
                territory(
                        territoryId,
                        historicalAllocation,
                        "GNT-HIST",
                        "Historical Guntur Territory",
                        false
                );

        when(
                franchiseRepository.findById(
                        franchiseId
                )
        ).thenReturn(
                Optional.of(franchise)
        );

        when(
                franchiseTerritoryRepository.findForAdminFranchise(
                        franchiseId,
                        territoryId
                )
        ).thenReturn(
                Optional.of(historicalTerritory)
        );

        AdminFranchiseTerritoryResponse response =
                service.getTerritory(
                        "admin@theholymatrimony.com",
                        franchiseId,
                        territoryId
                );

        assertEquals(
                territoryId,
                response.territoryId()
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );

        assertEquals(
                allocationId,
                response.allocationId()
        );

        assertEquals(
                "Historical Guntur Territory",
                response.name()
        );

        assertEquals(
                false,
                response.active()
        );

        verify(
                allocationRepository,
                never()
        ).findByFranchiseIdAndActiveTrue(
                any()
        );

        verify(
                franchiseTerritoryRepository
        ).findForAdminFranchise(
                franchiseId,
                territoryId
        );
    }

    private CreateFranchiseTerritoryRequest territoryRequest() {
        return new CreateFranchiseTerritoryRequest(
                " gnt-city ",
                " Guntur City ",
                FranchiseTerritoryType.CITY,
                " Urban Guntur "
        );
    }

    private Franchise territoryFranchise(
            UUID franchiseId,
            FranchiseStatus status
    ) {
        return Franchise.builder()
                .id(franchiseId)
                .franchiseCode("HM-GNT-001")
                .legalName("Holy Matrimony Guntur")
                .displayName("Holy Matrimony Guntur")
                .status(status)
                .build();
    }

    private FranchiseDistrictAllocation territoryAllocation(
            UUID allocationId,
            Franchise franchise
    ) {
        GeoState state =
                GeoState.builder()
                        .id(UUID.randomUUID())
                        .lgdCode(28)
                        .name("Andhra Pradesh")
                        .countryCode("IN")
                        .active(true)
                        .build();

        GeoDistrict district =
                GeoDistrict.builder()
                        .id(UUID.randomUUID())
                        .state(state)
                        .lgdCode(506)
                        .name("Guntur")
                        .active(true)
                        .build();

        return FranchiseDistrictAllocation.builder()
                .id(allocationId)
                .franchise(franchise)
                .district(district)
                .active(true)
                .build();
    }

    private FranchiseTerritory territory(
            UUID territoryId,
            FranchiseDistrictAllocation allocation,
            String territoryCode,
            String name,
            boolean active
    ) {
        return FranchiseTerritory.builder()
                .id(territoryId)
                .districtAllocation(allocation)
                .territoryCode(territoryCode)
                .name(name)
                .territoryType(FranchiseTerritoryType.CITY)
                .coverageDescription("Coverage")
                .active(active)
                .build();
    }

    @Test
    void updateFranchiseStatusActivatesOnboardingFranchise() {

        UUID franchiseId = UUID.randomUUID();

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.ONBOARDING);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        when(franchiseRepository.save(franchise))
                .thenReturn(franchise);

        var response =
                service.updateFranchiseStatus(
                        "admin@theholymatrimony.com",
                        franchiseId,
                        new UpdateFranchiseStatusRequest(
                                FranchiseStatus.ACTIVE,
                                "Onboarding completed"
                        )
                );

        verify(adminAccessService)
                .requireSuperAdmin(
                        "admin@theholymatrimony.com"
                );

        verify(franchiseRepository)
                .save(franchise);

        assertEquals(
                FranchiseStatus.ACTIVE,
                franchise.getStatus()
        );

        assertNotNull(
                franchise.getActivatedAt()
        );

        assertNull(
                franchise.getSuspendedAt()
        );

        assertEquals(
                FranchiseStatus.ACTIVE,
                response.status()
        );

        assertEquals(
                franchiseId,
                response.franchiseId()
        );
    }

    @Test
    void updateFranchiseStatusSuspendsActiveFranchise() {

        UUID franchiseId = UUID.randomUUID();

        LocalDateTime activatedAt =
                LocalDateTime.now().minusDays(10);

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.ACTIVE);
        franchise.setActivatedAt(activatedAt);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        when(franchiseRepository.save(franchise))
                .thenReturn(franchise);

        var response =
                service.updateFranchiseStatus(
                        "admin@theholymatrimony.com",
                        franchiseId,
                        new UpdateFranchiseStatusRequest(
                                FranchiseStatus.SUSPENDED,
                                "Temporary suspension"
                        )
                );

        assertEquals(
                FranchiseStatus.SUSPENDED,
                franchise.getStatus()
        );

        assertEquals(
                activatedAt,
                franchise.getActivatedAt()
        );

        assertNotNull(
                franchise.getSuspendedAt()
        );

        assertEquals(
                FranchiseStatus.SUSPENDED,
                response.status()
        );
    }

    @Test
    void updateFranchiseStatusReactivatesSuspendedFranchiseWithoutResettingActivationTime() {

        UUID franchiseId = UUID.randomUUID();

        LocalDateTime activatedAt =
                LocalDateTime.now().minusDays(20);

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.SUSPENDED);
        franchise.setActivatedAt(activatedAt);
        franchise.setSuspendedAt(
                LocalDateTime.now().minusDays(2)
        );

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        when(franchiseRepository.save(franchise))
                .thenReturn(franchise);

        service.updateFranchiseStatus(
                "admin@theholymatrimony.com",
                franchiseId,
                new UpdateFranchiseStatusRequest(
                        FranchiseStatus.ACTIVE,
                        "Suspension cleared"
                )
        );

        assertEquals(
                FranchiseStatus.ACTIVE,
                franchise.getStatus()
        );

        assertEquals(
                activatedAt,
                franchise.getActivatedAt()
        );

        assertNull(
                franchise.getSuspendedAt()
        );
    }

    @Test
    void updateFranchiseStatusRejectsTerminationFromActive() {

        UUID franchiseId = UUID.randomUUID();

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.ACTIVE);
        franchise.setActivatedAt(
                LocalDateTime.now().minusDays(30)
        );

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateFranchiseStatus(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        new UpdateFranchiseStatusRequest(
                                                FranchiseStatus.TERMINATED,
                                                "Agreement terminated"
                                        )
                                )
                );

        assertTrue(
                exception.getMessage().contains(
                        "ACTIVE -> TERMINATED"
                )
        );

        assertEquals(
                FranchiseStatus.ACTIVE,
                franchise.getStatus()
        );

        assertNull(
                franchise.getTerminatedAt()
        );

        verify(franchiseRepository, never())
                .save(any(Franchise.class));
    }

    @Test
    void updateFranchiseStatusRejectsTerminationFromSuspended() {

        UUID franchiseId = UUID.randomUUID();

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.SUSPENDED);
        franchise.setActivatedAt(
                LocalDateTime.now().minusDays(30)
        );
        franchise.setSuspendedAt(
                LocalDateTime.now().minusDays(5)
        );

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateFranchiseStatus(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        new UpdateFranchiseStatusRequest(
                                                FranchiseStatus.TERMINATED,
                                                "Agreement terminated"
                                        )
                                )
                );

        assertTrue(
                exception.getMessage().contains(
                        "SUSPENDED -> TERMINATED"
                )
        );

        assertEquals(
                FranchiseStatus.SUSPENDED,
                franchise.getStatus()
        );

        assertNull(
                franchise.getTerminatedAt()
        );

        verify(franchiseRepository, never())
                .save(any(Franchise.class));
    }

    @Test
    void updateFranchiseStatusRejectsInvalidTransition() {

        UUID franchiseId = UUID.randomUUID();

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.ONBOARDING);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateFranchiseStatus(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        new UpdateFranchiseStatusRequest(
                                                FranchiseStatus.SUSPENDED,
                                                "Invalid transition"
                                        )
                                )
                );

        assertTrue(
                exception.getMessage().contains(
                        "ONBOARDING -> SUSPENDED"
                )
        );

        verify(franchiseRepository, never())
                .save(any(Franchise.class));
    }

    @Test
    void updateFranchiseStatusRejectsSameStatus() {

        UUID franchiseId = UUID.randomUUID();

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.ACTIVE);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateFranchiseStatus(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        new UpdateFranchiseStatusRequest(
                                                FranchiseStatus.ACTIVE,
                                                null
                                        )
                                )
                );

        assertTrue(
                exception.getMessage().contains(
                        "already in status ACTIVE"
                )
        );

        verify(franchiseRepository, never())
                .save(any(Franchise.class));
    }

    @Test
    void updateFranchiseStatusRejectsUnsupportedPreOperationalTransition() {

        UUID franchiseId = UUID.randomUUID();

        Franchise franchise = new Franchise();
        franchise.setId(franchiseId);
        franchise.setFranchiseCode("HM-GNT");
        franchise.setDisplayName("Guntur District Franchise");
        franchise.setStatus(FranchiseStatus.APPROVED);

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.of(franchise));

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.updateFranchiseStatus(
                                "admin@theholymatrimony.com",
                                franchiseId,
                                new UpdateFranchiseStatusRequest(
                                        FranchiseStatus.ACTIVE,
                                        null
                                )
                        )
        );

        verify(franchiseRepository, never())
                .save(any(Franchise.class));
    }

    @Test
    void updateFranchiseStatusRejectsMissingFranchise() {

        UUID franchiseId = UUID.randomUUID();

        when(franchiseRepository.findById(franchiseId))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.updateFranchiseStatus(
                                        "admin@theholymatrimony.com",
                                        franchiseId,
                                        new UpdateFranchiseStatusRequest(
                                                FranchiseStatus.ACTIVE,
                                                null
                                        )
                                )
                );

        assertEquals(
                "Franchise not found.",
                exception.getMessage()
        );

        verify(franchiseRepository, never())
                .save(any(Franchise.class));
    }

}
