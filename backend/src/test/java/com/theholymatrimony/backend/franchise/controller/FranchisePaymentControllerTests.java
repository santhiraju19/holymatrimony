package com.theholymatrimony.backend.franchise.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.franchise.dto.FranchisePaymentResponse;
import com.theholymatrimony.backend.franchise.service.FranchisePaymentService;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FranchisePaymentControllerTests {

    @Mock
    private FranchisePaymentService franchisePaymentService;

    @Mock
    private Authentication authentication;

    private FranchisePaymentController controller;

    @BeforeEach
    void setUp() {

        controller = new FranchisePaymentController(
                franchisePaymentService
        );
    }

    @Test
    void listPaymentsUsesAuthenticatedIdentity() {

        String email =
                "franchise@example.com";

        when(
                authentication.getName()
        ).thenReturn(
                email
        );

        when(
                franchisePaymentService.listPayments(
                        email
                )
        ).thenReturn(
                List.of()
        );

        controller.listPayments(
                authentication
        );

        verify(
                franchisePaymentService
        ).listPayments(
                email
        );
    }

    @Test
    void listPaymentsReturnsServiceDataInsideApiResponse() {

        String email =
                "franchise@example.com";

        FranchisePaymentResponse payment =
                new FranchisePaymentResponse(
                        UUID.randomUUID(),
                        "Test Member",
                        "member@example.com",
                        "9999999999",
                        "PREMIUM",
                        "YEARLY",
                        499900,
                        "INR",
                        PaymentStatus.SUCCESS,
                        PaymentSource.RAZORPAY,
                        "upi",
                        null,
                        499900,
                        0,
                        0,
                        "order_test",
                        "pay_test",
                        LocalDateTime.of(
                                2026,
                                10,
                                15,
                                12,
                                30
                        ),
                        LocalDateTime.of(
                                2026,
                                10,
                                15,
                                12,
                                0
                        ),
                        LocalDateTime.of(
                                2026,
                                10,
                                15,
                                12,
                                31
                        )
                );

        when(
                authentication.getName()
        ).thenReturn(
                email
        );

        when(
                franchisePaymentService.listPayments(
                        email
                )
        ).thenReturn(
                List.of(
                        payment
                )
        );

        ApiResponse<List<FranchisePaymentResponse>> response =
                controller.listPayments(
                        authentication
                );

        assertEquals(
                List.of(payment),
                response.getData()
        );

        verify(
                franchisePaymentService
        ).listPayments(
                email
        );
    }
}
