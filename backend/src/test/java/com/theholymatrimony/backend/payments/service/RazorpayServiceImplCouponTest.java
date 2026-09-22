package com.theholymatrimony.backend.payments.service;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.coupon.dto.CouponCalculation;
import com.theholymatrimony.backend.payments.coupon.entity.MembershipCoupon;
import com.theholymatrimony.backend.payments.coupon.service.MembershipCouponService;
import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RazorpayServiceImplCouponTest {

    @Mock
    private RazorpayClient razorpayClient;

    @Mock
    private OrderClient orderClient;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PaymentFinalizationService paymentFinalizationService;

    @Mock
    private MembershipCouponService membershipCouponService;

    private RazorpayServiceImpl service;

    private User user;

    @BeforeEach
    void setUp() {
        service =
                new RazorpayServiceImpl(
                        razorpayClient,
                        paymentRepository,
                        userRepository,
                        membershipCouponService,
                        paymentFinalizationService
                );

        ReflectionTestUtils.setField(
                service,
                "keyId",
                "rzp_test_holy_matrimony"
        );

        ReflectionTestUtils.setField(
                service,
                "keySecret",
                "test-secret"
        );

        user =
                User.builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .email(
                                "member@example.com"
                        )
                        .build();
    }

    @Test
    void hm100BypassesRazorpayAndFinalizesMembershipDirectly()
            throws Exception {

        CreateOrderRequest request =
                request(
                        "silver",
                        "monthly",
                        "HM100"
                );

        /*
         * SILVER monthly:
         *
         * ₹499 base
         * GST rounded by the current server pricing implementation:
         * ₹90
         * Total = ₹589 = 58,900 paise
         */
        MembershipCoupon coupon =
                MembershipCoupon
                        .builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .code(
                                "HM100"
                        )
                        .discountPercent(
                                100
                        )
                        .active(
                                true
                        )
                        .redemptionCount(
                                0
                        )
                        .build();

        CouponCalculation calculation =
                new CouponCalculation(
                        coupon,
                        "HM100",
                        100,
                        58900,
                        58900,
                        0
                );

        when(
                userRepository.findByEmail(
                        "member@example.com"
                )
        ).thenReturn(
                Optional.of(
                        user
                )
        );

        when(
                membershipCouponService.calculate(
                        "HM100",
                        58900
                )
        ).thenReturn(
                calculation
        );

        /*
         * Simulate JPA assigning/preserving the payment ID.
         */
        when(
                paymentRepository.saveAndFlush(
                        any(Payment.class)
                )
        ).thenAnswer(
                invocation -> {
                    Payment payment =
                            invocation.getArgument(
                                    0
                            );

                    if (payment.getId() == null) {
                        payment.setId(
                                UUID.randomUUID()
                        );
                    }

                    return payment;
                }
        );

        /*
         * Simulate centralized successful coupon finalization.
         */
        when(
                paymentFinalizationService
                        .finalizeSuccessfulCouponPayment(
                                any(Payment.class)
                        )
        ).thenAnswer(
                invocation -> {
                    Payment payment =
                            invocation.getArgument(
                                    0
                            );

                    payment.setStatus(
                            PaymentStatus.SUCCESS
                    );

                    payment.setPaymentSource(
                            PaymentSource.COUPON
                    );

                    payment.setPaymentMethod(
                            "COUPON"
                    );

                    return payment;
                }
        );

        CreateOrderResponse response =
                service.createOrder(
                        request,
                        "member@example.com"
                );

        /*
         * ========================================================
         * RESPONSE
         * ========================================================
         */
        assertEquals(
                "COUPON",
                response.getCheckoutType()
        );

        assertNotNull(
                response.getPaymentId()
        );

        assertNull(
                response.getOrderId()
        );

        assertNull(
                response.getKey()
        );

        assertEquals(
                0,
                response.getAmount()
        );

        assertEquals(
                "INR",
                response.getCurrency()
        );

        assertEquals(
                "HM100",
                response.getCouponCode()
        );

        assertEquals(
                100,
                response.getDiscountPercent()
        );

        assertEquals(
                58900,
                response.getOriginalAmount()
        );

        assertEquals(
                58900,
                response.getDiscountAmount()
        );

        assertTrue(
                response.isCompleted()
        );

        /*
         * ========================================================
         * LOCAL PAYMENT SNAPSHOT
         * ========================================================
         */
        ArgumentCaptor<Payment> paymentCaptor =
                ArgumentCaptor.forClass(
                        Payment.class
                );

        verify(
                paymentRepository
        ).saveAndFlush(
                paymentCaptor.capture()
        );

        Payment savedPayment =
                paymentCaptor.getValue();

        assertEquals(
                0,
                savedPayment.getAmount()
        );

        assertEquals(
                "HM100",
                savedPayment.getCouponCode()
        );

        assertEquals(
                58900,
                savedPayment.getOriginalAmount()
        );

        assertEquals(
                58900,
                savedPayment.getDiscountAmount()
        );

        assertEquals(
                100,
                savedPayment.getDiscountPercent()
        );

        assertEquals(
                PaymentSource.COUPON,
                savedPayment.getPaymentSource()
        );

        assertEquals(
                "COUPON",
                savedPayment.getPaymentMethod()
        );

        assertNull(
                savedPayment.getRazorpayOrderId()
        );

        assertNull(
                savedPayment.getRazorpayPaymentId()
        );

        /*
         * ========================================================
         * FINALIZATION + AUDIT
         * ========================================================
         */
        verify(
                paymentFinalizationService,
                times(1)
        ).finalizeSuccessfulCouponPayment(
                savedPayment
        );

        verify(
                membershipCouponService,
                times(1)
        ).recordSuccessfulRedemption(
                savedPayment
        );

        /*
         * Most important HM100 security/payment assertion:
         *
         * Razorpay must never be used for a zero-value checkout.
         */
        verifyNoInteractions(
                razorpayClient
        );
    }

    @Test
    void invalidCouponStopsBeforeRazorpayOrderCreation()
            throws Exception {

        CreateOrderRequest request =
                request(
                        "gold",
                        "monthly",
                        "INVALID"
                );

        when(
                userRepository.findByEmail(
                        "member@example.com"
                )
        ).thenReturn(
                Optional.of(
                        user
                )
        );

        when(
                membershipCouponService.calculate(
                        eq("INVALID"),
                        anyInt()
                )
        ).thenThrow(
                new IllegalArgumentException(
                        "Invalid coupon code."
                )
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createOrder(
                                        request,
                                        "member@example.com"
                                )
                );

        assertEquals(
                "Invalid coupon code.",
                exception.getMessage()
        );

        verifyNoInteractions(
                razorpayClient
        );

        verify(
                paymentRepository,
                never()
        ).save(
                any(Payment.class)
        );

        verify(
                paymentRepository,
                never()
        ).saveAndFlush(
                any(Payment.class)
        );

        verifyNoInteractions(
                paymentFinalizationService
        );
    }


    @Test
    void hm50CreatesRazorpayOrderForDiscountedAmount()
            throws Exception {

        CreateOrderRequest request =
                request(
                        "gold",
                        "monthly",
                        "HM50"
                );

        /*
         * GOLD monthly:
         *
         * ₹799 base
         * GST = ₹144
         * Total = ₹943 = 94,300 paise
         *
         * HM50:
         * discount = 47,150 paise
         * final = 47,150 paise
         */
        MembershipCoupon coupon =
                MembershipCoupon
                        .builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .code(
                                "HM50"
                        )
                        .discountPercent(
                                50
                        )
                        .active(
                                true
                        )
                        .redemptionCount(
                                0
                        )
                        .build();

        CouponCalculation calculation =
                new CouponCalculation(
                        coupon,
                        "HM50",
                        50,
                        94300,
                        47150,
                        47150
                );

        preparePaidCheckout(
                "HM50",
                94300,
                calculation,
                "order_hm50"
        );

        CreateOrderResponse response =
                service.createOrder(
                        request,
                        "member@example.com"
                );

        assertEquals(
                "RAZORPAY",
                response.getCheckoutType()
        );

        assertEquals(
                "order_hm50",
                response.getOrderId()
        );

        assertEquals(
                47150,
                response.getAmount()
        );

        assertEquals(
                "HM50",
                response.getCouponCode()
        );

        assertEquals(
                50,
                response.getDiscountPercent()
        );

        assertEquals(
                94300,
                response.getOriginalAmount()
        );

        assertEquals(
                47150,
                response.getDiscountAmount()
        );

        assertFalse(
                response.isCompleted()
        );

        assertRazorpayOrderAmount(
                47150,
                "HM50"
        );

        Payment payment =
                captureSavedPayment();

        assertEquals(
                47150,
                payment.getAmount()
        );

        assertEquals(
                94300,
                payment.getOriginalAmount()
        );

        assertEquals(
                47150,
                payment.getDiscountAmount()
        );

        assertEquals(
                50,
                payment.getDiscountPercent()
        );

        assertEquals(
                "HM50",
                payment.getCouponCode()
        );

        assertEquals(
                PaymentSource.RAZORPAY,
                payment.getPaymentSource()
        );

        assertEquals(
                PaymentStatus.PENDING,
                payment.getStatus()
        );

        verifyNoInteractions(
                paymentFinalizationService
        );

        verify(
                membershipCouponService,
                never()
        ).recordSuccessfulRedemption(
                any(Payment.class)
        );
    }

    @Test
    void hm30CreatesRazorpayOrderForDiscountedAmount()
            throws Exception {

        CreateOrderRequest request =
                request(
                        "platinum",
                        "monthly",
                        "HM30"
                );

        /*
         * PLATINUM monthly:
         *
         * ₹1199 base
         * GST = ₹216
         * Total = ₹1415 = 141,500 paise
         *
         * HM30:
         * discount = 42,450 paise
         * final = 99,050 paise
         */
        MembershipCoupon coupon =
                MembershipCoupon
                        .builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .code(
                                "HM30"
                        )
                        .discountPercent(
                                30
                        )
                        .active(
                                true
                        )
                        .redemptionCount(
                                0
                        )
                        .build();

        CouponCalculation calculation =
                new CouponCalculation(
                        coupon,
                        "HM30",
                        30,
                        141500,
                        42450,
                        99050
                );

        preparePaidCheckout(
                "HM30",
                141500,
                calculation,
                "order_hm30"
        );

        CreateOrderResponse response =
                service.createOrder(
                        request,
                        "member@example.com"
                );

        assertEquals(
                "RAZORPAY",
                response.getCheckoutType()
        );

        assertEquals(
                "order_hm30",
                response.getOrderId()
        );

        assertEquals(
                99050,
                response.getAmount()
        );

        assertEquals(
                "HM30",
                response.getCouponCode()
        );

        assertEquals(
                30,
                response.getDiscountPercent()
        );

        assertEquals(
                141500,
                response.getOriginalAmount()
        );

        assertEquals(
                42450,
                response.getDiscountAmount()
        );

        assertFalse(
                response.isCompleted()
        );

        assertRazorpayOrderAmount(
                99050,
                "HM30"
        );

        Payment payment =
                captureSavedPayment();

        assertEquals(
                99050,
                payment.getAmount()
        );

        assertEquals(
                141500,
                payment.getOriginalAmount()
        );

        assertEquals(
                42450,
                payment.getDiscountAmount()
        );

        assertEquals(
                30,
                payment.getDiscountPercent()
        );

        assertEquals(
                "HM30",
                payment.getCouponCode()
        );
    }

    @Test
    void noCouponPreservesFullPriceRazorpayCheckout()
            throws Exception {

        CreateOrderRequest request =
                request(
                        "silver",
                        "monthly",
                        null
                );

        when(
                userRepository.findByEmail(
                        "member@example.com"
                )
        ).thenReturn(
                Optional.of(
                        user
                )
        );

        when(
                membershipCouponService.calculate(
                        null,
                        58900
                )
        ).thenReturn(
                null
        );

        prepareRazorpayOrder(
                "order_full_price"
        );

        when(
                paymentRepository.save(
                        any(Payment.class)
                )
        ).thenAnswer(
                invocation -> {
                    Payment payment =
                            invocation.getArgument(
                                    0
                            );

                    if (payment.getId() == null) {
                        payment.setId(
                                UUID.randomUUID()
                        );
                    }

                    return payment;
                }
        );

        CreateOrderResponse response =
                service.createOrder(
                        request,
                        "member@example.com"
                );

        assertEquals(
                "RAZORPAY",
                response.getCheckoutType()
        );

        assertEquals(
                58900,
                response.getAmount()
        );

        assertNull(
                response.getCouponCode()
        );

        assertNull(
                response.getDiscountPercent()
        );

        assertNull(
                response.getOriginalAmount()
        );

        assertNull(
                response.getDiscountAmount()
        );

        assertFalse(
                response.isCompleted()
        );

        assertRazorpayOrderAmount(
                58900,
                null
        );

        Payment payment =
                captureSavedPayment();

        assertEquals(
                58900,
                payment.getAmount()
        );

        assertNull(
                payment.getCouponCode()
        );

        assertNull(
                payment.getOriginalAmount()
        );

        assertNull(
                payment.getDiscountAmount()
        );

        assertNull(
                payment.getDiscountPercent()
        );

        assertEquals(
                PaymentSource.RAZORPAY,
                payment.getPaymentSource()
        );
    }

    private void preparePaidCheckout(
            String couponCode,
            int originalAmount,
            CouponCalculation calculation,
            String razorpayOrderId
    ) throws Exception {

        when(
                userRepository.findByEmail(
                        "member@example.com"
                )
        ).thenReturn(
                Optional.of(
                        user
                )
        );

        when(
                membershipCouponService.calculate(
                        couponCode,
                        originalAmount
                )
        ).thenReturn(
                calculation
        );

        prepareRazorpayOrder(
                razorpayOrderId
        );

        when(
                paymentRepository.save(
                        any(Payment.class)
                )
        ).thenAnswer(
                invocation -> {
                    Payment payment =
                            invocation.getArgument(
                                    0
                            );

                    if (payment.getId() == null) {
                        payment.setId(
                                UUID.randomUUID()
                        );
                    }

                    return payment;
                }
        );
    }

    private void prepareRazorpayOrder(
            String razorpayOrderId
    ) throws Exception {

        /*
         * RazorpayClient exposes OrderClient through a public
         * field in SDK 1.4.8.
         */
        razorpayClient.orders =
                orderClient;

        JSONObject razorpayJson =
                new JSONObject();

        razorpayJson.put(
                "id",
                razorpayOrderId
        );

        Order razorpayOrder =
                new Order(
                        razorpayJson
                );

        when(
                orderClient.create(
                        any(JSONObject.class)
                )
        ).thenReturn(
                razorpayOrder
        );
    }

    private void assertRazorpayOrderAmount(
            int expectedAmount,
            String expectedCoupon
    ) throws Exception {

        ArgumentCaptor<JSONObject> optionsCaptor =
                ArgumentCaptor.forClass(
                        JSONObject.class
                );

        verify(
                orderClient,
                times(1)
        ).create(
                optionsCaptor.capture()
        );

        JSONObject options =
                optionsCaptor.getValue();

        assertEquals(
                expectedAmount,
                options.getInt(
                        "amount"
                )
        );

        assertEquals(
                "INR",
                options.getString(
                        "currency"
                )
        );

        JSONObject notes =
                options.getJSONObject(
                        "notes"
                );

        if (expectedCoupon == null) {
            assertFalse(
                    notes.has(
                            "coupon"
                    )
            );
        } else {
            assertEquals(
                    expectedCoupon,
                    notes.getString(
                            "coupon"
                    )
            );
        }
    }

    private Payment captureSavedPayment() {

        ArgumentCaptor<Payment> paymentCaptor =
                ArgumentCaptor.forClass(
                        Payment.class
                );

        verify(
                paymentRepository
        ).save(
                paymentCaptor.capture()
        );

        return paymentCaptor.getValue();
    }

    private CreateOrderRequest request(
            String plan,
            String billingCycle,
            String coupon
    ) {
        CreateOrderRequest request =
                new CreateOrderRequest();

        request.setPlan(
                plan
        );

        request.setBillingCycle(
                billingCycle
        );

        request.setFullName(
                "Test Member"
        );

        request.setEmail(
                "member@example.com"
        );

        request.setPhone(
                "9876543210"
        );

        request.setCoupon(
                coupon
        );

        return request;
    }
}
