package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.access.FranchiseAccessService;
import com.theholymatrimony.backend.franchise.dto.FranchisePaymentResponse;
import com.theholymatrimony.backend.franchise.entity.FranchiseDistrictAllocation;
import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.enums.FranchisePermission;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FranchisePaymentServiceImplTests {

    private static final String EMAIL =
            "franchise@example.com";

    @Mock
    private FranchiseAccessService franchiseAccessService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private FranchiseDistrictAllocation allocation;

    @Mock
    private GeoDistrict district;

    private FranchisePaymentServiceImpl service;

    @BeforeEach
    void setUp() {

        service = new FranchisePaymentServiceImpl(
                franchiseAccessService,
                paymentRepository
        );
    }

    @Test
    void listPaymentsRequiresViewPermissionBeforeAllocationLookup() {

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        EMAIL
                )
        ).thenReturn(
                allocation
        );

        when(
                allocation.getDistrict()
        ).thenReturn(
                district
        );

        UUID districtId = UUID.randomUUID();

        when(
                district.getId()
        ).thenReturn(
                districtId
        );

        when(
                paymentRepository.findAllForFranchiseDistrict(
                        districtId
                )
        ).thenReturn(
                List.of()
        );

        service.listPayments(
                EMAIL
        );

        InOrder order = inOrder(
                franchiseAccessService,
                allocation,
                district,
                paymentRepository
        );

        order.verify(
                franchiseAccessService
        ).requirePermission(
                EMAIL,
                FranchisePermission.PAYMENTS_VIEW
        );

        order.verify(
                franchiseAccessService
        ).requireActiveDistrictAllocation(
                EMAIL
        );

        order.verify(
                allocation
        ).getDistrict();

        order.verify(
                district
        ).getId();

        order.verify(
                paymentRepository
        ).findAllForFranchiseDistrict(
                districtId
        );
    }

    @Test
    void listPaymentsStopsWhenPermissionIsDenied() {

        when(
                franchiseAccessService.requirePermission(
                        EMAIL,
                        FranchisePermission.PAYMENTS_VIEW
                )
        ).thenThrow(
                new AccessDeniedException(
                        "Permission denied"
                )
        );

        try {
            service.listPayments(
                    EMAIL
            );
        } catch (AccessDeniedException ignored) {
            // Expected.
        }

        verify(
                franchiseAccessService,
                never()
        ).requireActiveDistrictAllocation(
                EMAIL
        );

        verifyNoInteractions(
                paymentRepository
        );
    }

    @Test
    void listPaymentsStopsWhenActiveAllocationIsDenied() {

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        EMAIL
                )
        ).thenThrow(
                new AccessDeniedException(
                        "No active district allocation"
                )
        );

        try {
            service.listPayments(
                    EMAIL
            );
        } catch (AccessDeniedException ignored) {
            // Expected.
        }

        verify(
                franchiseAccessService
        ).requirePermission(
                EMAIL,
                FranchisePermission.PAYMENTS_VIEW
        );

        verifyNoInteractions(
                paymentRepository
        );
    }

    @Test
    void listPaymentsUsesOnlyServerDerivedDistrictId() {

        UUID districtId = UUID.randomUUID();

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        EMAIL
                )
        ).thenReturn(
                allocation
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
                paymentRepository.findAllForFranchiseDistrict(
                        districtId
                )
        ).thenReturn(
                List.of()
        );

        service.listPayments(
                EMAIL
        );

        verify(
                paymentRepository
        ).findAllForFranchiseDistrict(
                districtId
        );
    }

    @Test
    void listPaymentsReturnsEmptyListWhenDistrictHasNoPayments() {

        UUID districtId = UUID.randomUUID();

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        EMAIL
                )
        ).thenReturn(
                allocation
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
                paymentRepository.findAllForFranchiseDistrict(
                        districtId
                )
        ).thenReturn(
                List.of()
        );

        List<FranchisePaymentResponse> result =
                service.listPayments(
                        EMAIL
                );

        assertTrue(
                result.isEmpty()
        );
    }

    @Test
    void listPaymentsMapsPaymentResponseWithoutOwnershipIds() {

        UUID districtId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();

        LocalDateTime paidAt =
                LocalDateTime.of(
                        2026,
                        10,
                        15,
                        12,
                        30
                );

        LocalDateTime createdAt =
                LocalDateTime.of(
                        2026,
                        10,
                        15,
                        12,
                        0
                );

        LocalDateTime updatedAt =
                LocalDateTime.of(
                        2026,
                        10,
                        15,
                        12,
                        31
                );

        when(
                franchiseAccessService.requireActiveDistrictAllocation(
                        EMAIL
                )
        ).thenReturn(
                allocation
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

        Payment payment = new Payment();

        payment.setId(
                paymentId
        );

        payment.setCustomerName(
                "Test Member"
        );

        payment.setEmail(
                "member@example.com"
        );

        payment.setPhone(
                "9999999999"
        );

        payment.setPlan(
                "PREMIUM"
        );

        payment.setBillingCycle(
                "YEARLY"
        );

        payment.setAmount(
                499900
        );

        payment.setCurrency(
                "INR"
        );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setPaymentSource(
                PaymentSource.RAZORPAY
        );

        payment.setPaymentMethod(
                "upi"
        );

        payment.setCouponCode(
                "WELCOME"
        );

        payment.setOriginalAmount(
                599900
        );

        payment.setDiscountAmount(
                100000
        );

        payment.setDiscountPercent(
                16
        );

        payment.setRazorpayOrderId(
                "order_test"
        );

        payment.setRazorpayPaymentId(
                "pay_test"
        );

        payment.setPaidAt(
                paidAt
        );

        payment.setCreatedAt(
                createdAt
        );

        payment.setUpdatedAt(
                updatedAt
        );

        when(
                paymentRepository.findAllForFranchiseDistrict(
                        districtId
                )
        ).thenReturn(
                List.of(
                        payment
                )
        );

        List<FranchisePaymentResponse> result =
                service.listPayments(
                        EMAIL
                );

        assertEquals(
                1,
                result.size()
        );

        FranchisePaymentResponse response =
                result.getFirst();

        assertEquals(
                paymentId,
                response.paymentId()
        );

        assertEquals(
                "Test Member",
                response.customerName()
        );

        assertEquals(
                "member@example.com",
                response.email()
        );

        assertEquals(
                "9999999999",
                response.phone()
        );

        assertEquals(
                "PREMIUM",
                response.plan()
        );

        assertEquals(
                "YEARLY",
                response.billingCycle()
        );

        assertEquals(
                499900,
                response.amount()
        );

        assertEquals(
                "INR",
                response.currency()
        );

        assertEquals(
                PaymentStatus.SUCCESS,
                response.status()
        );

        assertEquals(
                PaymentSource.RAZORPAY,
                response.paymentSource()
        );

        assertEquals(
                "upi",
                response.paymentMethod()
        );

        assertEquals(
                "WELCOME",
                response.couponCode()
        );

        assertEquals(
                599900,
                response.originalAmount()
        );

        assertEquals(
                100000,
                response.discountAmount()
        );

        assertEquals(
                16,
                response.discountPercent()
        );

        assertEquals(
                "order_test",
                response.razorpayOrderId()
        );

        assertEquals(
                "pay_test",
                response.razorpayPaymentId()
        );

        assertEquals(
                paidAt,
                response.paidAt()
        );

        assertEquals(
                createdAt,
                response.createdAt()
        );

        assertEquals(
                updatedAt,
                response.updatedAt()
        );
    }
}
