package com.theholymatrimony.backend.secureconnect.topup;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.topup.dto.CreateSecureConnectTopUpResponse;
import com.theholymatrimony.backend.secureconnect.topup.entity.SecureConnectTopUpPayment;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;
import com.theholymatrimony.backend.secureconnect.topup.service.SecureConnectTopUpPackage;
import com.theholymatrimony.backend.secureconnect.topup.service.SecureConnectTopUpServiceImpl;

import org.json.JSONObject;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.mockito.ArgumentCaptor;

import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SecureConnectTopUpCheckoutTests {

    private static final String EMAIL =
            "member@example.com";

    private RazorpayClient razorpayClient;

    private OrderClient orderClient;

    private UserRepository userRepository;

    private MembershipRepository membershipRepository;

    private SecureConnectTopUpPaymentRepository
            topUpPaymentRepository;

    private SecureConnectTopUpServiceImpl service;

    private User user;

    @BeforeEach
    void setUp() {

        razorpayClient =
                mock(RazorpayClient.class);

        orderClient =
                mock(OrderClient.class);

        razorpayClient.orders =
                orderClient;

        userRepository =
                mock(UserRepository.class);

        membershipRepository =
                mock(MembershipRepository.class);

        topUpPaymentRepository =
                mock(
                        SecureConnectTopUpPaymentRepository.class
                );

        service =
                new SecureConnectTopUpServiceImpl(
                        razorpayClient,
                        userRepository,
                        membershipRepository,
                        topUpPaymentRepository
                );

        ReflectionTestUtils.setField(
                service,
                "keyId",
                "rzp_test_secure_connect"
        );

        user =
                User.builder()
                        .id(UUID.randomUUID())
                        .fullName("Secure Connect Member")
                        .email(EMAIL)
                        .password("not-used")
                        .build();

        when(
                userRepository.findByEmail(EMAIL)
        ).thenReturn(
                Optional.of(user)
        );

        when(
                topUpPaymentRepository.save(
                        any(SecureConnectTopUpPayment.class)
                )
        ).thenAnswer(
                invocation -> {

                    SecureConnectTopUpPayment payment =
                            invocation.getArgument(0);

                    if (payment.getId() == null) {
                        payment.setId(
                                UUID.randomUUID()
                        );
                    }

                    return payment;
                }
        );
    }

    /*
     * ============================================================
     * SERVER-SIDE PACKAGE CATALOG
     * ============================================================
     */

    @Test
    void packageCatalogHasExactCommercialValues() {

        assertPackage(
                SecureConnectTopUpPackage.AUDIO_30,
                CallMediaType.AUDIO,
                30,
                1800L,
                4900
        );

        assertPackage(
                SecureConnectTopUpPackage.AUDIO_60,
                CallMediaType.AUDIO,
                60,
                3600L,
                7900
        );

        assertPackage(
                SecureConnectTopUpPackage.AUDIO_120,
                CallMediaType.AUDIO,
                120,
                7200L,
                12900
        );

        assertPackage(
                SecureConnectTopUpPackage.VIDEO_30,
                CallMediaType.VIDEO,
                30,
                1800L,
                7900
        );

        assertPackage(
                SecureConnectTopUpPackage.VIDEO_60,
                CallMediaType.VIDEO,
                60,
                3600L,
                12900
        );

        assertPackage(
                SecureConnectTopUpPackage.VIDEO_120,
                CallMediaType.VIDEO,
                120,
                7200L,
                19900
        );
    }

    @Test
    void packageCodesAreNormalized() {

        assertEquals(
                SecureConnectTopUpPackage.AUDIO_30,
                SecureConnectTopUpPackage.fromCode(
                        " audio-30 "
                )
        );

        assertEquals(
                SecureConnectTopUpPackage.VIDEO_120,
                SecureConnectTopUpPackage.fromCode(
                        "video_120"
                )
        );

        assertThrows(
                IllegalArgumentException.class,
                () ->
                        SecureConnectTopUpPackage.fromCode(
                                "audio_999"
                        )
        );
    }

    /*
     * ============================================================
     * SILVER
     * ============================================================
     */

    @Test
    void silverCanPurchaseAudioTopUpUsingServerAuthoritativePrice()
            throws Exception {

        prepareMembership(
                MembershipPlan.SILVER
        );

        prepareRazorpayOrder(
                "order_silver_audio_30"
        );

        CreateSecureConnectTopUpResponse response =
                service.createOrder(
                        "AUDIO_30",
                        EMAIL
                );

        assertEquals(
                CallMediaType.AUDIO,
                response.getMediaType()
        );

        assertEquals(
                30,
                response.getMinutes()
        );

        assertEquals(
                1800L,
                response.getSeconds()
        );

        assertEquals(
                4900,
                response.getAmount()
        );

        assertEquals(
                "INR",
                response.getCurrency()
        );

        assertRazorpayOrder(
                4900,
                "AUDIO_30",
                "AUDIO",
                30
        );

        ArgumentCaptor<SecureConnectTopUpPayment>
                paymentCaptor =
                ArgumentCaptor.forClass(
                        SecureConnectTopUpPayment.class
                );

        verify(topUpPaymentRepository)
                .save(
                        paymentCaptor.capture()
                );

        SecureConnectTopUpPayment saved =
                paymentCaptor.getValue();

        assertEquals(
                4900,
                saved.getAmount()
        );

        assertEquals(
                30,
                saved.getMinutes()
        );

        assertEquals(
                1800L,
                saved.getSeconds()
        );

        assertEquals(
                PaymentStatus.PENDING,
                saved.getStatus()
        );

        assertNull(
                saved.getRazorpayPaymentId()
        );

        assertNull(
                saved.getPaidAt()
        );
    }

    @Test
    void silverCannotPurchaseVideoTopUp()
            throws Exception {

        prepareMembership(
                MembershipPlan.SILVER
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createOrder(
                                        "VIDEO_30",
                                        EMAIL
                                )
                );

        assertEquals(
                "Silver membership supports Secure Connect audio top-ups only.",
                exception.getMessage()
        );

        verifyNoInteractions(
                orderClient
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    /*
     * ============================================================
     * GOLD
     * ============================================================
     */

    @Test
    void goldCanPurchaseAudioTopUp()
            throws Exception {

        prepareMembership(
                MembershipPlan.GOLD
        );

        prepareRazorpayOrder(
                "order_gold_audio_120"
        );

        CreateSecureConnectTopUpResponse response =
                service.createOrder(
                        "AUDIO_120",
                        EMAIL
                );

        assertEquals(
                CallMediaType.AUDIO,
                response.getMediaType()
        );

        assertEquals(
                120,
                response.getMinutes()
        );

        assertEquals(
                7200L,
                response.getSeconds()
        );

        assertEquals(
                12900,
                response.getAmount()
        );

        assertRazorpayOrder(
                12900,
                "AUDIO_120",
                "AUDIO",
                120
        );
    }

    @Test
    void goldCanPurchaseVideoTopUp()
            throws Exception {

        prepareMembership(
                MembershipPlan.GOLD
        );

        prepareRazorpayOrder(
                "order_gold_video_60"
        );

        CreateSecureConnectTopUpResponse response =
                service.createOrder(
                        "VIDEO_60",
                        EMAIL
                );

        assertEquals(
                CallMediaType.VIDEO,
                response.getMediaType()
        );

        assertEquals(
                60,
                response.getMinutes()
        );

        assertEquals(
                3600L,
                response.getSeconds()
        );

        assertEquals(
                12900,
                response.getAmount()
        );

        assertRazorpayOrder(
                12900,
                "VIDEO_60",
                "VIDEO",
                60
        );
    }

    /*
     * ============================================================
     * PLATINUM / FREE
     * ============================================================
     */

    @Test
    void platinumCannotPurchaseTopUpBecauseCallingIsUnlimited()
            throws Exception {

        prepareMembership(
                MembershipPlan.PLATINUM
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createOrder(
                                        "AUDIO_30",
                                        EMAIL
                                )
                );

        assertEquals(
                "Platinum membership already includes unlimited Secure Connect audio and video calling.",
                exception.getMessage()
        );

        verifyNoInteractions(
                orderClient
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    @Test
    void freeCannotPurchaseTopUp()
            throws Exception {

        prepareMembership(
                MembershipPlan.FREE
        );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.createOrder(
                                        "AUDIO_30",
                                        EMAIL
                                )
                );

        assertEquals(
                "A paid membership is required to purchase Secure Connect top-ups.",
                exception.getMessage()
        );

        verifyNoInteractions(
                orderClient
        );

        verify(
                topUpPaymentRepository,
                never()
        ).save(any());
    }

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */

    private void prepareMembership(
            MembershipPlan plan
    ) {

        Membership membership =
                mock(Membership.class);

        when(
                membership.getPlan()
        ).thenReturn(
                plan
        );

        when(
                membership.isActive()
        ).thenReturn(
                true
        );

        when(
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
        ).thenReturn(
                Optional.of(membership)
        );
    }

    private void prepareRazorpayOrder(
            String orderId
    ) throws Exception {

        JSONObject json =
                new JSONObject();

        json.put(
                "id",
                orderId
        );

        Order order =
                new Order(
                        json
                );

        when(
                orderClient.create(
                        any(JSONObject.class)
                )
        ).thenReturn(
                order
        );
    }

    private void assertPackage(
            SecureConnectTopUpPackage packageOption,
            CallMediaType expectedMedia,
            int expectedMinutes,
            long expectedSeconds,
            int expectedAmount
    ) {

        assertEquals(
                expectedMedia,
                packageOption.getMediaType()
        );

        assertEquals(
                expectedMinutes,
                packageOption.getMinutes()
        );

        assertEquals(
                expectedSeconds,
                packageOption.getSeconds()
        );

        assertEquals(
                expectedAmount,
                packageOption.getAmountInPaise()
        );

        assertEquals(
                "INR",
                packageOption.getCurrency()
        );
    }

    private void assertRazorpayOrder(
            int expectedAmount,
            String expectedPackage,
            String expectedMedia,
            int expectedMinutes
    ) throws Exception {

        ArgumentCaptor<JSONObject> captor =
                ArgumentCaptor.forClass(
                        JSONObject.class
                );

        verify(
                orderClient,
                times(1)
        ).create(
                captor.capture()
        );

        JSONObject options =
                captor.getValue();

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

        assertEquals(
                "SECURE_CONNECT_TOPUP",
                notes.getString(
                        "purchaseType"
                )
        );

        assertEquals(
                expectedPackage,
                notes.getString(
                        "packageCode"
                )
        );

        assertEquals(
                expectedMedia,
                notes.getString(
                        "mediaType"
                )
        );

        assertEquals(
                expectedMinutes,
                notes.getInt(
                        "minutes"
                )
        );

        assertEquals(
                EMAIL,
                notes.getString(
                        "email"
                )
        );
    }
}
