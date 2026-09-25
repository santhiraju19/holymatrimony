package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.secureconnect.service.SecureConnectAllowanceProvisioningService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentFinalizationServiceTests {

    private PaymentRepository paymentRepository;
    private UserRepository userRepository;
    private MembershipRepository membershipRepository;
    private SecureConnectAllowanceProvisioningService
            allowanceProvisioningService;

    private PaymentFinalizationService service;

    private User user;

    @BeforeEach
    void setUp() {

        paymentRepository =
                mock(PaymentRepository.class);

        userRepository =
                mock(UserRepository.class);

        membershipRepository =
                mock(MembershipRepository.class);

        allowanceProvisioningService =
                mock(SecureConnectAllowanceProvisioningService.class);

        service =
                new PaymentFinalizationService(
                        paymentRepository,
                        userRepository,
                        membershipRepository,
                        allowanceProvisioningService
                );

        user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Member")
                        .email("member@example.com")
                        .password("password")
                        .enabled(true)
                        .build();

        when(userRepository.findForUpdate(any(UUID.class)))
                .thenReturn(Optional.of(user));

        when(paymentRepository.saveAndFlush(any(Payment.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );

        when(membershipRepository.findByPaymentId(any(UUID.class)))
                .thenReturn(Optional.empty());

        when(membershipRepository
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        any(UUID.class),
                        eq(MembershipStatus.ACTIVE)
                ))
                .thenReturn(Optional.empty());

        when(membershipRepository.save(any(Membership.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );
    }

    @Test
    void activationLocksUserBeforeAccessingMemberships() {
        Payment payment = payment(
                MembershipPlan.GOLD,
                99900
        );

        service.finalizeSuccessfulPayment(
                payment,
                "pay_lock_order",
                "signature_lock_order"
        );

        org.mockito.InOrder order = inOrder(
                userRepository,
                membershipRepository
        );

        order.verify(userRepository)
                .findForUpdate(user.getId());

        order.verify(membershipRepository)
                .findByPaymentId(payment.getId());

        order.verify(membershipRepository)
                .findFirstByUserIdAndStatusOrderByStartDateDesc(
                        user.getId(),
                        MembershipStatus.ACTIVE
                );
    }

    @Test
    void razorpaySuccessActivatesMembershipAndProvisionsAllowance() {

        Payment payment =
                payment(
                        MembershipPlan.SILVER,
                        58900
                );

        Payment result =
                service.finalizeSuccessfulPayment(
                        payment,
                        "pay_test_123",
                        "signature_test"
                );

        assertSame(payment, result);

        assertEquals(
                PaymentStatus.SUCCESS,
                payment.getStatus()
        );

        assertEquals(
                PaymentSource.RAZORPAY,
                payment.getPaymentSource()
        );

        assertEquals(
                "pay_test_123",
                payment.getRazorpayPaymentId()
        );

        assertEquals(
                "signature_test",
                payment.getRazorpaySignature()
        );

        assertNotNull(
                payment.getPaidAt()
        );

        ArgumentCaptor<Membership> membershipCaptor =
                ArgumentCaptor.forClass(
                        Membership.class
                );

        verify(membershipRepository)
                .save(membershipCaptor.capture());

        Membership membership =
                membershipCaptor.getValue();

        assertEquals(
                MembershipPlan.SILVER,
                membership.getPlan()
        );

        assertEquals(
                MembershipStatus.ACTIVE,
                membership.getStatus()
        );

        assertSame(
                payment,
                membership.getPayment()
        );

        assertSame(
                user,
                membership.getUser()
        );

        verify(allowanceProvisioningService)
                .provisionForMembership(
                        same(membership)
                );
    }

    @Test
    void hm100SuccessActivatesMembershipAndProvisionsAllowance() {

        Payment payment =
                payment(
                        MembershipPlan.GOLD,
                        0
                );

        payment.setCouponCode(
                "HM100"
        );

        Payment result =
                service.finalizeSuccessfulCouponPayment(
                        payment
                );

        assertSame(payment, result);

        assertEquals(
                PaymentStatus.SUCCESS,
                payment.getStatus()
        );

        assertEquals(
                PaymentSource.COUPON,
                payment.getPaymentSource()
        );

        assertEquals(
                "COUPON",
                payment.getPaymentMethod()
        );

        assertNull(
                payment.getRazorpayOrderId()
        );

        assertNull(
                payment.getRazorpayPaymentId()
        );

        assertNull(
                payment.getRazorpaySignature()
        );

        ArgumentCaptor<Membership> membershipCaptor =
                ArgumentCaptor.forClass(
                        Membership.class
                );

        verify(membershipRepository)
                .save(membershipCaptor.capture());

        Membership membership =
                membershipCaptor.getValue();

        assertEquals(
                MembershipPlan.GOLD,
                membership.getPlan()
        );

        verify(allowanceProvisioningService)
                .provisionForMembership(
                        same(membership)
                );
    }

    @Test
    void alreadySuccessfulPaymentDoesNotCreateOrProvisionAgain() {

        Payment payment =
                payment(
                        MembershipPlan.SILVER,
                        58900
                );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        Payment result =
                service.finalizeSuccessfulPayment(
                        payment,
                        "pay_test_existing",
                        "signature_existing"
                );

        assertSame(payment, result);

        verifyNoInteractions(
                paymentRepository,
                membershipRepository,
                allowanceProvisioningService
        );
    }

    @Test
    void membershipAlreadyOwnedByPaymentIsNotProvisionedAgain() {

        Payment payment =
                payment(
                        MembershipPlan.GOLD,
                        58900
                );

        Membership existingMembership =
                Membership.builder()
                        .id(UUID.randomUUID())
                        .user(user)
                        .plan(MembershipPlan.GOLD)
                        .status(MembershipStatus.ACTIVE)
                        .build();

        when(membershipRepository.findByPaymentId(payment.getId()))
                .thenReturn(
                        Optional.of(
                                existingMembership
                        )
                );

        service.finalizeSuccessfulPayment(
                payment,
                "pay_test_duplicate",
                "signature_duplicate"
        );

        verify(membershipRepository, never())
                .save(any(Membership.class));

        verifyNoInteractions(
                allowanceProvisioningService
        );
    }

    private Payment payment(
            MembershipPlan plan,
            int amount
    ) {

        return Payment.builder()
                .id(UUID.randomUUID())
                .user(user)
                .plan(plan.name())
                .billingCycle("MONTHLY")
                .customerName("Member")
                .email("member@example.com")
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build();
    }
}
