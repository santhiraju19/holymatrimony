package com.theholymatrimony.backend.secureconnect.topup.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import com.theholymatrimony.backend.secureconnect.topup.dto.CreateSecureConnectTopUpResponse;
import com.theholymatrimony.backend.secureconnect.topup.dto.SecureConnectTopUpPackageResponse;
import com.theholymatrimony.backend.secureconnect.topup.dto.SecureConnectTopUpStatusResponse;
import com.theholymatrimony.backend.secureconnect.topup.entity.SecureConnectTopUpPayment;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
public class SecureConnectTopUpServiceImpl
        implements SecureConnectTopUpService {

    private final RazorpayClient razorpayClient;

    private final UserRepository userRepository;

    private final MembershipRepository membershipRepository;

    private final SecureConnectTopUpPaymentRepository
            topUpPaymentRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    @Transactional(readOnly = true)
    public List<SecureConnectTopUpPackageResponse> getPackages() {
        return Arrays
                .stream(
                        SecureConnectTopUpPackage.values()
                )
                .map(
                        packageOption ->
                                new SecureConnectTopUpPackageResponse(
                                        packageOption.name(),
                                        packageOption.getMediaType(),
                                        packageOption.getMinutes(),
                                        packageOption.getSeconds(),
                                        packageOption.getAmountInPaise(),
                                        packageOption.getCurrency()
                                )
                )
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SecureConnectTopUpStatusResponse getStatus(
            UUID topUpPaymentId,
            String authenticatedEmail
    ) {
        if (
                topUpPaymentId == null ||
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated top-up payment lookup is required."
            );
        }

        SecureConnectTopUpPayment topUpPayment =
                topUpPaymentRepository
                        .findById(topUpPaymentId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Secure Connect top-up payment was not found."
                                        )
                        );

        if (
                topUpPayment.getUser() == null ||
                topUpPayment.getUser().getEmail() == null ||
                !topUpPayment
                        .getUser()
                        .getEmail()
                        .equalsIgnoreCase(
                                authenticatedEmail.trim()
                        )
        ) {
            throw new IllegalArgumentException(
                    "This Secure Connect top-up does not belong to the authenticated user."
            );
        }

        return new SecureConnectTopUpStatusResponse(
                topUpPayment.getId(),
                topUpPayment.getMediaType(),
                topUpPayment.getMinutes(),
                topUpPayment.getSeconds(),
                topUpPayment.getAmount(),
                topUpPayment.getCurrency(),
                topUpPayment.getStatus()
        );
    }

    @Override
    public CreateSecureConnectTopUpResponse createOrder(
            String packageCode,
            String authenticatedEmail
    ) throws Exception {

        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        User user =
                userRepository
                        .findByEmail(
                                authenticatedEmail.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Authenticated user was not found."
                                        )
                        );

        Membership membership =
                membershipRepository
                        .findFirstByUserAndStatusOrderByStartDateDesc(
                                user,
                                MembershipStatus.ACTIVE
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "An active paid membership is required to purchase Secure Connect top-ups."
                                        )
                        );

        if (!membership.isActive()) {
            throw new IllegalArgumentException(
                    "An active paid membership is required to purchase Secure Connect top-ups."
            );
        }

        SecureConnectTopUpPackage packageOption =
                SecureConnectTopUpPackage.fromCode(
                        packageCode
                );

        validatePlanEligibility(
                membership.getPlan(),
                packageOption.getMediaType()
        );

        /*
         * ========================================================
         * RAZORPAY ORDER
         * ========================================================
         *
         * Price and purchased seconds come exclusively from the
         * server-side package catalog.
         *
         * Never trust browser-supplied amount/minutes/seconds.
         */

        JSONObject options =
                new JSONObject();

        options.put(
                "amount",
                packageOption.getAmountInPaise()
        );

        options.put(
                "currency",
                packageOption.getCurrency()
        );

        options.put(
                "receipt",
                "HM-SC-" +
                        System.currentTimeMillis()
        );

        JSONObject notes =
                new JSONObject();

        notes.put(
                "purchaseType",
                "SECURE_CONNECT_TOPUP"
        );

        notes.put(
                "packageCode",
                packageOption.name()
        );

        notes.put(
                "mediaType",
                packageOption
                        .getMediaType()
                        .name()
        );

        notes.put(
                "minutes",
                packageOption.getMinutes()
        );

        notes.put(
                "email",
                user.getEmail()
        );

        options.put(
                "notes",
                notes
        );

        Order razorpayOrder =
                razorpayClient
                        .orders
                        .create(
                                options
                        );

        String razorpayOrderId =
                razorpayOrder.get(
                        "id"
                );

        if (
                razorpayOrderId == null ||
                razorpayOrderId.isBlank()
        ) {
            throw new IllegalStateException(
                    "Razorpay did not return an order ID."
            );
        }

        SecureConnectTopUpPayment topUpPayment =
                SecureConnectTopUpPayment
                        .builder()
                        .user(
                                user
                        )
                        .mediaType(
                                packageOption.getMediaType()
                        )
                        .minutes(
                                packageOption.getMinutes()
                        )
                        .seconds(
                                packageOption.getSeconds()
                        )
                        .amount(
                                packageOption.getAmountInPaise()
                        )
                        .currency(
                                packageOption.getCurrency()
                        )
                        .razorpayOrderId(
                                razorpayOrderId
                        )
                        .status(
                                PaymentStatus.PENDING
                        )
                        .build();

        topUpPayment =
                topUpPaymentRepository.save(
                        topUpPayment
                );

        return new CreateSecureConnectTopUpResponse(
                topUpPayment.getId(),
                packageOption.name(),
                packageOption.getMediaType(),
                packageOption.getMinutes(),
                packageOption.getSeconds(),
                packageOption.getAmountInPaise(),
                packageOption.getCurrency(),
                razorpayOrderId,
                keyId
        );
    }

    /*
     * ============================================================
     * VERIFY RAZORPAY CHECKOUT SIGNATURE
     * ============================================================
     *
     * This verifies the browser checkout callback and stores the
     * verified Razorpay identifiers.
     *
     * IMPORTANT:
     * This method does NOT credit the Secure Connect wallet and
     * does NOT mark the top-up SUCCESS.
     *
     * Wallet fulfillment remains exclusively controlled by the
     * authenticated Razorpay payment.captured webhook.
     */

    @Override
    public void verifyPayment(
            VerifyPaymentRequest request,
            String authenticatedEmail
    ) throws Exception {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Payment verification request is required."
            );
        }

        String razorpayOrderId =
                normalize(
                        request.getRazorpay_order_id()
                );

        String razorpayPaymentId =
                normalize(
                        request.getRazorpay_payment_id()
                );

        String razorpaySignature =
                normalize(
                        request.getRazorpay_signature()
                );

        if (
                razorpayOrderId == null ||
                razorpayPaymentId == null ||
                razorpaySignature == null
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment verification details are required."
            );
        }

        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        SecureConnectTopUpPayment topUpPayment =
                topUpPaymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Secure Connect top-up order was not found."
                                        )
                        );

        if (
                topUpPayment.getUser() == null ||
                topUpPayment.getUser().getEmail() == null ||
                !topUpPayment
                        .getUser()
                        .getEmail()
                        .equalsIgnoreCase(
                                authenticatedEmail.trim()
                        )
        ) {
            throw new IllegalArgumentException(
                    "This Secure Connect top-up does not belong to the authenticated user."
            );
        }

        /*
         * The payment.captured webhook may have completed the
         * top-up before the browser callback arrives.
         *
         * SUCCESS means the webhook has already performed the
         * authoritative wallet credit.
         */

        if (
                topUpPayment.getStatus()
                        == PaymentStatus.SUCCESS
        ) {
            return;
        }

        /*
         * Prevent one Razorpay payment ID from being attached to
         * multiple Secure Connect top-up transactions.
         */

        topUpPaymentRepository
                .findByRazorpayPaymentId(
                        razorpayPaymentId
                )
                .ifPresent(
                        existingPayment -> {

                            if (
                                    !existingPayment
                                            .getId()
                                            .equals(
                                                    topUpPayment.getId()
                                            )
                            ) {
                                throw new IllegalArgumentException(
                                        "This payment has already been processed."
                                );
                            }
                        }
                );

        /*
         * If a browser callback has already been stored for this
         * order, the payment ID must remain identical.
         */

        if (
                topUpPayment.getRazorpayPaymentId() != null &&
                !topUpPayment
                        .getRazorpayPaymentId()
                        .isBlank() &&
                !topUpPayment
                        .getRazorpayPaymentId()
                        .equals(
                                razorpayPaymentId
                        )
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID does not match the previously verified top-up payment."
            );
        }

        JSONObject signatureAttributes =
                new JSONObject();

        /*
         * Always verify against the server-stored order ID.
         */

        signatureAttributes.put(
                "razorpay_order_id",
                topUpPayment.getRazorpayOrderId()
        );

        signatureAttributes.put(
                "razorpay_payment_id",
                razorpayPaymentId
        );

        signatureAttributes.put(
                "razorpay_signature",
                razorpaySignature
        );

        boolean signatureValid =
                Utils.verifyPaymentSignature(
                        signatureAttributes,
                        keySecret
                );

        if (!signatureValid) {
            throw new IllegalArgumentException(
                    "Invalid Razorpay payment signature."
            );
        }

        /*
         * Store browser-verified checkout identifiers only.
         *
         * Do NOT:
         * - mark SUCCESS
         * - set paidAt
         * - credit wallet
         * - create ledger entry
         *
         * payment.captured remains authoritative for fulfillment.
         */

        topUpPayment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        topUpPayment.setRazorpaySignature(
                razorpaySignature
        );

        topUpPaymentRepository.save(
                topUpPayment
        );
    }

    private String normalize(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private void validatePlanEligibility(
            MembershipPlan plan,
            CallMediaType mediaType
    ) {

        if (plan == null) {
            throw new IllegalArgumentException(
                    "A valid membership plan is required."
            );
        }

        switch (plan) {

            case SILVER -> {
                if (
                        mediaType
                                != CallMediaType.AUDIO
                ) {
                    throw new IllegalArgumentException(
                            "Silver membership supports Secure Connect audio top-ups only."
                    );
                }
            }

            case GOLD -> {
                /*
                 * Gold may purchase both AUDIO and VIDEO.
                 */
            }

            case PLATINUM ->
                    throw new IllegalArgumentException(
                            "Platinum membership already includes unlimited Secure Connect audio and video calling."
                    );

            case FREE ->
                    throw new IllegalArgumentException(
                            "A paid membership is required to purchase Secure Connect top-ups."
                    );

            default ->
                    throw new IllegalArgumentException(
                            "This membership plan is not eligible for Secure Connect top-ups."
                    );
        }
    }
}
