package com.theholymatrimony.backend.payments.service;

import com.theholymatrimony.backend.payments.coupon.dto.CouponCalculation;
import com.theholymatrimony.backend.payments.coupon.entity.MembershipCoupon;
import com.theholymatrimony.backend.payments.coupon.repository.MembershipCouponRedemptionRepository;
import com.theholymatrimony.backend.payments.coupon.repository.MembershipCouponRepository;
import com.theholymatrimony.backend.payments.coupon.service.MembershipCouponService;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class MembershipCouponPricingMatrixTest {

    private MembershipCouponRepository couponRepository;

    private MembershipCouponService couponService;

    private RazorpayServiceImpl razorpayService;

    private Method calculateAmountInPaise;

    @BeforeEach
    void setUp() throws Exception {

        couponRepository =
                Mockito.mock(
                        MembershipCouponRepository.class
                );

        MembershipCouponRedemptionRepository
                redemptionRepository =
                Mockito.mock(
                        MembershipCouponRedemptionRepository.class
                );

        couponService =
                new MembershipCouponService(
                        couponRepository,
                        redemptionRepository
                );

        /*
         * We only invoke calculateAmountInPaise().
         *
         * The remaining RazorpayServiceImpl dependencies are
         * irrelevant for this pricing-unit test and may safely
         * be Mockito mocks.
         */
        var constructors =
                RazorpayServiceImpl.class
                        .getDeclaredConstructors();

        if (constructors.length != 1) {
            throw new IllegalStateException(
                    "Expected one RazorpayServiceImpl constructor."
            );
        }

        var constructor =
                constructors[0];

        constructor.setAccessible(true);

        Class<?>[] parameterTypes =
                constructor.getParameterTypes();

        Object[] dependencies =
                new Object[
                        parameterTypes.length
                ];

        for (
                int i = 0;
                i < parameterTypes.length;
                i++
        ) {
            if (
                    parameterTypes[i]
                            .equals(
                                    MembershipCouponService.class
                            )
            ) {
                dependencies[i] =
                        couponService;
            } else {
                dependencies[i] =
                        Mockito.mock(
                                parameterTypes[i]
                        );
            }
        }

        razorpayService =
                (RazorpayServiceImpl)
                        constructor.newInstance(
                                dependencies
                        );

        calculateAmountInPaise =
                RazorpayServiceImpl.class
                        .getDeclaredMethod(
                                "calculateAmountInPaise",
                                MembershipPlan.class,
                                BillingCycle.class
                        );

        calculateAmountInPaise
                .setAccessible(
                        true
                );
    }

    @ParameterizedTest(
            name =
                    "{0} {1} {2}: original={3} paise, final={4} paise"
    )
    @MethodSource("couponPricingMatrix")
    @DisplayName(
            "all paid plans and billing cycles use authoritative coupon pricing"
    )
    void allPaidPlansAndBillingCyclesUseCouponPricing(
            MembershipPlan plan,
            BillingCycle billingCycle,
            String couponCode,
            int expectedOriginalAmount,
            int expectedFinalAmount
    ) throws Exception {

        int discountPercent =
                switch (couponCode) {
                    case "HM30" -> 30;
                    case "HM50" -> 50;
                    case "HM100" -> 100;

                    default ->
                            throw new IllegalArgumentException(
                                    "Unexpected coupon."
                            );
                };

        MembershipCoupon coupon =
                MembershipCoupon
                        .builder()
                        .code(
                                couponCode
                        )
                        .discountPercent(
                                discountPercent
                        )
                        .active(
                                true
                        )
                        .validFrom(
                                LocalDateTime
                                        .now()
                                        .minusDays(
                                                1
                                        )
                        )
                        .validUntil(
                                LocalDateTime
                                        .now()
                                        .plusDays(
                                                1
                                        )
                        )
                        .redemptionCount(
                                0
                        )
                        .build();

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                couponCode
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        int actualOriginalAmount =
                (int)
                        calculateAmountInPaise
                                .invoke(
                                        razorpayService,
                                        plan,
                                        billingCycle
                                );

        assertEquals(
                expectedOriginalAmount,
                actualOriginalAmount,
                "Unexpected server price."
        );

        CouponCalculation calculation =
                couponService.calculate(
                        couponCode,
                        actualOriginalAmount
                );

        assertNotNull(
                calculation
        );

        assertEquals(
                couponCode,
                calculation.code()
        );

        assertEquals(
                discountPercent,
                calculation.discountPercent()
        );

        assertEquals(
                expectedOriginalAmount,
                calculation.originalAmount()
        );

        assertEquals(
                expectedOriginalAmount
                        - expectedFinalAmount,
                calculation.discountAmount()
        );

        assertEquals(
                expectedFinalAmount,
                calculation.finalAmount()
        );
    }

    private static Stream<Arguments>
    couponPricingMatrix() {

        return Stream.of(

                /*
                 * SILVER
                 *
                 * ₹499 + rounded 18% GST ₹90
                 * = ₹589 = 58,900 paise
                 */
                cases(
                        MembershipPlan.SILVER,
                        BillingCycle.MONTHLY,
                        58900
                ),

                /*
                 * ₹1,299 + ₹234 GST
                 * = ₹1,533 = 153,300 paise
                 */
                cases(
                        MembershipPlan.SILVER,
                        BillingCycle.QUARTERLY,
                        153300
                ),

                /*
                 * ₹4,499 + ₹810 GST
                 * = ₹5,309 = 530,900 paise
                 */
                cases(
                        MembershipPlan.SILVER,
                        BillingCycle.YEARLY,
                        530900
                ),

                /*
                 * GOLD
                 *
                 * ₹799 + ₹144 GST
                 * = ₹943 = 94,300 paise
                 */
                cases(
                        MembershipPlan.GOLD,
                        BillingCycle.MONTHLY,
                        94300
                ),

                /*
                 * ₹2,199 + ₹396 GST
                 * = ₹2,595 = 259,500 paise
                 */
                cases(
                        MembershipPlan.GOLD,
                        BillingCycle.QUARTERLY,
                        259500
                ),

                /*
                 * ₹7,499 + ₹1,350 GST
                 * = ₹8,849 = 884,900 paise
                 */
                cases(
                        MembershipPlan.GOLD,
                        BillingCycle.YEARLY,
                        884900
                ),

                /*
                 * PLATINUM
                 *
                 * ₹1,199 + ₹216 GST
                 * = ₹1,415 = 141,500 paise
                 */
                cases(
                        MembershipPlan.PLATINUM,
                        BillingCycle.MONTHLY,
                        141500
                ),

                /*
                 * ₹3,299 + ₹594 GST
                 * = ₹3,893 = 389,300 paise
                 */
                cases(
                        MembershipPlan.PLATINUM,
                        BillingCycle.QUARTERLY,
                        389300
                ),

                /*
                 * ₹10,999 + ₹1,980 GST
                 * = ₹12,979 = 1,297,900 paise
                 */
                cases(
                        MembershipPlan.PLATINUM,
                        BillingCycle.YEARLY,
                        1297900
                )
        )
        .flatMap(
                stream -> stream
        );
    }

    private static Stream<Arguments> cases(
            MembershipPlan plan,
            BillingCycle billingCycle,
            int originalAmount
    ) {

        return Stream.of(
                argumentsFor(
                        plan,
                        billingCycle,
                        "HM30",
                        30,
                        originalAmount
                ),
                argumentsFor(
                        plan,
                        billingCycle,
                        "HM50",
                        50,
                        originalAmount
                ),
                argumentsFor(
                        plan,
                        billingCycle,
                        "HM100",
                        100,
                        originalAmount
                )
        );
    }

    private static Arguments argumentsFor(
            MembershipPlan plan,
            BillingCycle billingCycle,
            String coupon,
            int discountPercent,
            int originalAmount
    ) {

        /*
         * Must exactly match MembershipCouponService:
         *
         * discount =
         *   round(originalAmount * percent / 100)
         *
         * using integer paise arithmetic.
         */
        long numerator =
                (long)
                        originalAmount
                        * discountPercent;

        int discountAmount =
                (int)
                        (
                                (
                                        numerator
                                                + 50L
                                )
                                        / 100L
                        );

        discountAmount =
                Math.min(
                        discountAmount,
                        originalAmount
                );

        int finalAmount =
                originalAmount
                        - discountAmount;

        return Arguments.of(
                plan,
                billingCycle,
                coupon,
                originalAmount,
                finalAmount
        );
    }
}
