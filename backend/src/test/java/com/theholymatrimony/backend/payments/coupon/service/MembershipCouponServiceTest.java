package com.theholymatrimony.backend.payments.coupon.service;

import com.theholymatrimony.backend.payments.coupon.dto.CouponCalculation;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.coupon.entity.MembershipCoupon;
import com.theholymatrimony.backend.payments.coupon.entity.MembershipCouponRedemption;
import com.theholymatrimony.backend.payments.coupon.repository.MembershipCouponRedemptionRepository;
import com.theholymatrimony.backend.payments.coupon.repository.MembershipCouponRepository;
import com.theholymatrimony.backend.payments.entity.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipCouponServiceTest {

    @Mock
    private MembershipCouponRepository couponRepository;

    @Mock
    private MembershipCouponRedemptionRepository redemptionRepository;

    private MembershipCouponService service;

    @BeforeEach
    void setUp() {
        service =
                new MembershipCouponService(
                        couponRepository,
                        redemptionRepository
                );
    }

    @Test
    void noCouponReturnsNull() {
        assertNull(
                service.calculate(
                        null,
                        100000
                )
        );

        assertNull(
                service.calculate(
                        "   ",
                        100000
                )
        );

        verifyNoInteractions(
                couponRepository,
                redemptionRepository
        );
    }

    @Test
    void hm100ProducesZeroFinalAmount() {
        MembershipCoupon coupon =
                coupon(
                        "HM100",
                        100
                );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM100"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        CouponCalculation result =
                service.calculate(
                        "HM100",
                        58900
                );

        assertNotNull(result);
        assertEquals(
                "HM100",
                result.code()
        );
        assertEquals(
                100,
                result.discountPercent()
        );
        assertEquals(
                58900,
                result.originalAmount()
        );
        assertEquals(
                58900,
                result.discountAmount()
        );
        assertEquals(
                0,
                result.finalAmount()
        );
        assertTrue(
                result.isFree()
        );
    }

    @Test
    void hm50ProducesFiftyPercentDiscount() {
        MembershipCoupon coupon =
                coupon(
                        "HM50",
                        50
                );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM50"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        CouponCalculation result =
                service.calculate(
                        "HM50",
                        94400
                );

        assertEquals(
                94400,
                result.originalAmount()
        );
        assertEquals(
                47200,
                result.discountAmount()
        );
        assertEquals(
                47200,
                result.finalAmount()
        );
        assertFalse(
                result.isFree()
        );
    }

    @Test
    void hm30ProducesThirtyPercentDiscount() {
        MembershipCoupon coupon =
                coupon(
                        "HM30",
                        30
                );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM30"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        CouponCalculation result =
                service.calculate(
                        "HM30",
                        141500
                );

        assertEquals(
                141500,
                result.originalAmount()
        );
        assertEquals(
                42450,
                result.discountAmount()
        );
        assertEquals(
                99050,
                result.finalAmount()
        );
    }

    @Test
    void couponCodeIsTrimmedAndCaseInsensitive() {
        MembershipCoupon coupon =
                coupon(
                        "HM50",
                        50
                );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM50"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        CouponCalculation result =
                service.calculate(
                        "  hm50  ",
                        10000
                );

        assertEquals(
                "HM50",
                result.code()
        );

        verify(
                couponRepository
        ).findByCodeIgnoreCase(
                "HM50"
        );
    }

    @Test
    void percentageCalculationRoundsToNearestPaise() {
        MembershipCoupon coupon =
                coupon(
                        "HM30",
                        30
                );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM30"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        CouponCalculation result =
                service.calculate(
                        "HM30",
                        101
                );

        /*
         * 30% of 101 paise = 30.3 paise.
         * Nearest paise = 30.
         */
        assertEquals(
                30,
                result.discountAmount()
        );
        assertEquals(
                71,
                result.finalAmount()
        );
    }

    @Test
    void invalidCouponIsRejected() {
        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "BADCODE"
                        )
        ).thenReturn(
                Optional.empty()
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.calculate(
                                        "badcode",
                                        10000
                                )
                );

        assertEquals(
                "Invalid coupon code.",
                exception.getMessage()
        );
    }

    @Test
    void inactiveCouponIsRejected() {
        MembershipCoupon coupon =
                coupon(
                        "HM50",
                        50
                );

        coupon.setActive(
                false
        );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM50"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.calculate(
                                        "HM50",
                                        10000
                                )
                );

        assertEquals(
                "This coupon is no longer active.",
                exception.getMessage()
        );
    }

    @Test
    void futureCouponIsRejected() {
        MembershipCoupon coupon =
                coupon(
                        "HM30",
                        30
                );

        coupon.setValidFrom(
                LocalDateTime.now()
                        .plusDays(
                                1
                        )
        );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM30"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.calculate(
                                "HM30",
                                10000
                        )
        );
    }

    @Test
    void expiredCouponIsRejected() {
        MembershipCoupon coupon =
                coupon(
                        "HM30",
                        30
                );

        coupon.setValidUntil(
                LocalDateTime.now()
                        .minusDays(
                                1
                        )
        );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM30"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.calculate(
                                        "HM30",
                                        10000
                                )
                );

        assertEquals(
                "This coupon has expired.",
                exception.getMessage()
        );
    }

    @Test
    void redemptionLimitIsEnforced() {
        MembershipCoupon coupon =
                coupon(
                        "HM50",
                        50
                );

        coupon.setMaxRedemptions(
                10
        );

        coupon.setRedemptionCount(
                10
        );

        when(
                couponRepository
                        .findByCodeIgnoreCase(
                                "HM50"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.calculate(
                                        "HM50",
                                        10000
                                )
                );

        assertEquals(
                "This coupon has reached its redemption limit.",
                exception.getMessage()
        );
    }

    @Test
    void negativeOriginalAmountIsRejected() {
        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.calculate(
                                        "HM50",
                                        -1
                                )
                );

        assertEquals(
                "Original payment amount cannot be negative.",
                exception.getMessage()
        );

        verifyNoInteractions(
                couponRepository,
                redemptionRepository
        );
    }

    @Test
    void successfulRedemptionCreatesAuditAndIncrementsCount() {
        MembershipCoupon coupon =
                coupon(
                        "HM50",
                        50
                );

        UUID paymentId =
                UUID.randomUUID();

        User user =
                User.builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .email(
                                "member@example.com"
                        )
                        .build();

        Payment payment =
                Payment.builder()
                        .id(
                                paymentId
                        )
                        .user(
                                user
                        )
                        .couponCode(
                                " hm50 "
                        )
                        .originalAmount(
                                94300
                        )
                        .discountAmount(
                                47150
                        )
                        .discountPercent(
                                50
                        )
                        .amount(
                                47150
                        )
                        .build();

        when(
                redemptionRepository
                        .existsByPayment_Id(
                                paymentId
                        )
        ).thenReturn(
                false,
                false
        );

        when(
                couponRepository
                        .findByCodeForUpdate(
                                "HM50"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        service.recordSuccessfulRedemption(
                payment
        );

        var redemptionCaptor =
                org.mockito.ArgumentCaptor
                        .forClass(
                                MembershipCouponRedemption.class
                        );

        verify(
                redemptionRepository,
                times(1)
        ).saveAndFlush(
                redemptionCaptor.capture()
        );

        MembershipCouponRedemption redemption =
                redemptionCaptor.getValue();

        assertSame(
                coupon,
                redemption.getCoupon()
        );

        assertSame(
                user,
                redemption.getUser()
        );

        assertSame(
                payment,
                redemption.getPayment()
        );

        assertEquals(
                "HM50",
                redemption.getCouponCode()
        );

        assertEquals(
                50,
                redemption.getDiscountPercent()
        );

        assertEquals(
                94300,
                redemption.getOriginalAmount()
        );

        assertEquals(
                47150,
                redemption.getDiscountAmount()
        );

        assertEquals(
                47150,
                redemption.getFinalAmount()
        );

        assertEquals(
                1,
                coupon.getRedemptionCount()
        );

        verify(
                couponRepository,
                times(1)
        ).save(
                coupon
        );
    }

    @Test
    void alreadyRedeemedPaymentIsIdempotent() {
        UUID paymentId =
                UUID.randomUUID();

        Payment payment =
                Payment.builder()
                        .id(
                                paymentId
                        )
                        .couponCode(
                                "HM50"
                        )
                        .build();

        when(
                redemptionRepository
                        .existsByPayment_Id(
                                paymentId
                        )
        ).thenReturn(
                true
        );

        service.recordSuccessfulRedemption(
                payment
        );

        verify(
                redemptionRepository,
                times(1)
        ).existsByPayment_Id(
                paymentId
        );

        verify(
                couponRepository,
                never()
        ).findByCodeForUpdate(
                anyString()
        );

        verify(
                redemptionRepository,
                never()
        ).saveAndFlush(
                any(
                        MembershipCouponRedemption.class
                )
        );

        verify(
                couponRepository,
                never()
        ).save(
                any(
                        MembershipCoupon.class
                )
        );
    }

    @Test
    void redemptionCompletedWhileWaitingForCouponLockIsIdempotent() {
        MembershipCoupon coupon =
                coupon(
                        "HM30",
                        30
                );

        UUID paymentId =
                UUID.randomUUID();

        User user =
                User.builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .email(
                                "member@example.com"
                        )
                        .build();

        Payment payment =
                Payment.builder()
                        .id(
                                paymentId
                        )
                        .user(
                                user
                        )
                        .couponCode(
                                "HM30"
                        )
                        .originalAmount(
                                141500
                        )
                        .discountAmount(
                                42450
                        )
                        .discountPercent(
                                30
                        )
                        .amount(
                                99050
                        )
                        .build();

        /*
         * First check:
         * no redemption exists yet.
         *
         * Second check:
         * another transaction completed it while this
         * transaction was waiting for the coupon lock.
         */
        when(
                redemptionRepository
                        .existsByPayment_Id(
                                paymentId
                        )
        ).thenReturn(
                false,
                true
        );

        when(
                couponRepository
                        .findByCodeForUpdate(
                                "HM30"
                        )
        ).thenReturn(
                Optional.of(
                        coupon
                )
        );

        service.recordSuccessfulRedemption(
                payment
        );

        verify(
                redemptionRepository,
                times(2)
        ).existsByPayment_Id(
                paymentId
        );

        verify(
                couponRepository,
                times(1)
        ).findByCodeForUpdate(
                "HM30"
        );

        verify(
                redemptionRepository,
                never()
        ).saveAndFlush(
                any(
                        MembershipCouponRedemption.class
                )
        );

        verify(
                couponRepository,
                never()
        ).save(
                any(
                        MembershipCoupon.class
                )
        );

        assertEquals(
                0,
                coupon.getRedemptionCount()
        );
    }

    @Test
    void nonCouponPaymentDoesNotCreateRedemption() {
        Payment payment =
                Payment.builder()
                        .id(
                                UUID.randomUUID()
                        )
                        .couponCode(
                                null
                        )
                        .build();

        service.recordSuccessfulRedemption(
                payment
        );

        verifyNoInteractions(
                couponRepository,
                redemptionRepository
        );
    }

    private MembershipCoupon coupon(
            String code,
            int discountPercent
    ) {
        return MembershipCoupon
                .builder()
                .id(
                        UUID.randomUUID()
                )
                .code(
                        code
                )
                .discountPercent(
                        discountPercent
                )
                .active(
                        true
                )
                .redemptionCount(
                        0
                )
                .build();
    }
}
