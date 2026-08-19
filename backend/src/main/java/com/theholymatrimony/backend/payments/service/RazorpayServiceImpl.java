package com.theholymatrimony.backend.payments.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.PaymentHistoryResponse;
import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;

import com.theholymatrimony.backend.payments.entity.Payment;

import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.PaymentSource;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
@Service
@RequiredArgsConstructor
@Transactional
public class RazorpayServiceImpl
        implements PaymentService {

    private final RazorpayClient razorpayClient;

    private final PaymentRepository paymentRepository;

    private final UserRepository userRepository;

    /*
     * Successful payment fulfilment remains centralized
     * in PaymentFinalizationService / Razorpay webhook.
     */
    private final PaymentFinalizationService
            paymentFinalizationService;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /*
     * ============================================================
     * CREATE RAZORPAY ORDER
     * ============================================================
     */

    @Override
    public CreateOrderResponse createOrder(
            CreateOrderRequest request,
            String authenticatedEmail
    ) throws Exception {

        validateCreateOrderRequest(
                request
        );

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

        MembershipPlan plan =
                parsePlan(
                        request.getPlan()
                );

        BillingCycle billingCycle =
                parseBillingCycle(
                        request.getBillingCycle()
                );

        int amountInPaise =
                calculateAmountInPaise(
                        plan,
                        billingCycle
                );

        /*
         * ========================================================
         * RAZORPAY ORDER
         * ========================================================
         */

        JSONObject options =
                new JSONObject();

        options.put(
                "amount",
                amountInPaise
        );

        options.put(
                "currency",
                "INR"
        );

        options.put(
                "receipt",
                "HM-" +
                        System.currentTimeMillis()
        );

        JSONObject notes =
                new JSONObject();

        notes.put(
                "plan",
                plan.name()
        );

        notes.put(
                "billingCycle",
                billingCycle.name()
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

        /*
         * ========================================================
         * LOCAL PAYMENT RECORD
         * ========================================================
         *
         * Amount is stored in paise.
         *
         * Payment remains PENDING until Razorpay confirms
         * capture through the webhook.
         */

        Payment payment =
                Payment.builder()
                        .user(
                                user
                        )
                        .razorpayOrderId(
                                razorpayOrderId
                        )
                        .plan(
                                plan.name()
                        )
                        .billingCycle(
                                billingCycle.name()
                        )
                        .customerName(
                                request
                                        .getFullName()
                                        .trim()
                        )
                        .email(
                                user.getEmail()
                        )
                        .phone(
                                normalizeNullable(
                                        request.getPhone()
                                )
                        )
                        .amount(
                                amountInPaise
                        )
                        .currency(
                                "INR"
                        )
                        .paymentSource(
                                PaymentSource.RAZORPAY
                        )
                        .paymentMethod(
                                null
                        )
                        .couponCode(
                                null
                        )
                        .status(
                                PaymentStatus.PENDING
                        )
                        .build();

        paymentRepository.save(
                payment
        );

        return new CreateOrderResponse(
                razorpayOrderId,
                keyId,
                amountInPaise,
                "INR"
        );
    }

    /*
     * ============================================================
     * VERIFY RAZORPAY CHECKOUT SIGNATURE
     * ============================================================
     */

    @Override
    public void verifyPayment(
            VerifyPaymentRequest request,
            String authenticatedEmail
    ) throws Exception {

        validateVerificationRequest(
                request
        );

        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                request.getRazorpay_order_id()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Payment order was not found."
                                        )
                        );

        if (
                payment.getEmail() == null ||
                !payment
                        .getEmail()
                        .equalsIgnoreCase(
                                authenticatedEmail.trim()
                        )
        ) {
            throw new IllegalArgumentException(
                    "This payment does not belong to the authenticated user."
            );
        }

        /*
         * The webhook may already have completed this
         * transaction before the browser callback arrives.
         */
        if (
                payment.getStatus()
                        == PaymentStatus.SUCCESS
        ) {
            return;
        }

        /*
         * Prevent one Razorpay payment ID from being assigned
         * to multiple local transaction records.
         */

        paymentRepository
                .findByRazorpayPaymentId(
                        request.getRazorpay_payment_id()
                )
                .ifPresent(
                        existingPayment -> {

                            if (
                                    !existingPayment
                                            .getId()
                                            .equals(
                                                    payment.getId()
                                            )
                            ) {
                                throw new IllegalArgumentException(
                                        "This payment has already been processed."
                                );
                            }
                        }
                );

        JSONObject signatureAttributes =
                new JSONObject();

        /*
         * Always verify against the server-stored order ID.
         */

        signatureAttributes.put(
                "razorpay_order_id",
                payment.getRazorpayOrderId()
        );

        signatureAttributes.put(
                "razorpay_payment_id",
                request.getRazorpay_payment_id()
        );

        signatureAttributes.put(
                "razorpay_signature",
                request.getRazorpay_signature()
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
         * Store checkout identifiers.
         *
         * Final SUCCESS + membership activation remains
         * webhook controlled.
         */

        payment.setRazorpayPaymentId(
                request.getRazorpay_payment_id()
        );

        payment.setRazorpaySignature(
                request.getRazorpay_signature()
        );

        if (
                payment.getPaymentSource() == null
        ) {
            payment.setPaymentSource(
                    PaymentSource.RAZORPAY
            );
        }

        paymentRepository.save(
                payment
        );
    }

    /*
     * ============================================================
     * PAYMENT HISTORY
     * ============================================================
     */

    @Override
    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse>
    getPaymentHistory(
            String authenticatedEmail
    ) {

        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        String normalizedEmail =
                authenticatedEmail.trim();

        userRepository
                .findByEmail(
                        normalizedEmail
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Authenticated user was not found."
                                )
                );

        return paymentRepository
                .findAllByEmailIgnoreCaseOrderByCreatedAtDesc(
                        normalizedEmail
                )
                .stream()
                .map(
                        this::toPaymentHistoryResponse
                )
                .toList();
    }

    /*
     * ============================================================
     * RECEIPT
     * ============================================================
     *
     * Successful Razorpay transactions AND successful coupon
     * activations can generate a receipt.
     */

    @Override
    @Transactional(readOnly = true)
    public PaymentReceiptResponse getPaymentReceipt(
            UUID paymentId,
            String authenticatedEmail
    ) {

        if (
                paymentId == null
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A valid payment ID is required."
            );
        }

        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated user was not found."
            );
        }

        String normalizedEmail =
                authenticatedEmail.trim();

        Payment payment =
                paymentRepository
                        .findByIdAndEmailIgnoreCase(
                                paymentId,
                                normalizedEmail
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Payment receipt was not found."
                                        )
                        );

        if (
                payment.getStatus()
                        != PaymentStatus.SUCCESS
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A receipt is available only for successful transactions."
            );
        }

        LocalDateTime receiptDate =
                payment.getPaidAt() != null
                        ? payment.getPaidAt()
                        : payment.getCreatedAt();

        int amountInPaise =
                payment.getAmount() == null
                        ? 0
                        : payment.getAmount();

        BigDecimal amountInRupees =
                BigDecimal
                        .valueOf(
                                amountInPaise
                        )
                        .divide(
                                BigDecimal.valueOf(
                                        100
                                ),
                                2,
                                RoundingMode.HALF_UP
                        );

        PaymentSource effectiveSource =
                resolvePaymentSource(
                        payment
                );

        return PaymentReceiptResponse
                .builder()
                .paymentRecordId(
                        payment.getId()
                )
                .invoiceNumber(
                        buildInvoiceNumber(
                                payment.getId(),
                                receiptDate
                        )
                )
                .razorpayOrderId(
                        payment.getRazorpayOrderId()
                )
                .razorpayPaymentId(
                        payment.getRazorpayPaymentId()
                )
                .paymentSource(
                        effectiveSource.name()
                )
                .paymentMethod(
                        payment.getPaymentMethod()
                )
                .couponCode(
                        payment.getCouponCode()
                )
                .memberName(
                        payment.getCustomerName()
                )
                .email(
                        payment.getEmail()
                )
                .phone(
                        payment.getPhone()
                )
                .plan(
                        payment.getPlan()
                )
                .billingCycle(
                        payment.getBillingCycle()
                )
                .amountInPaise(
                        amountInPaise
                )
                .amountInRupees(
                        amountInRupees
                )
                .currency(
                        payment.getCurrency()
                )
                .status(
                        payment
                                .getStatus()
                                .name()
                )
                .paidAt(
                        payment.getPaidAt()
                )
                .createdAt(
                        payment.getCreatedAt()
                )

                /*
                 * =================================================
                 * RECEIPT COMPANY DETAILS
                 * =================================================
                 *
                 * Keep the PDF compact.
                 *
                 * Do not print the complete registered street
                 * address on the customer receipt.
                 */

                .companyName(
                        "HOLY MATRIMONY SERVICES PVT LTD"
                )
                .companyGstin(
                        "37AAICH7679D1Z5"
                )
                .companyAddress(
                        "Guntur, Andhra Pradesh"
                )
                .companyEmail(
                        "support@theholymatrimony.com"
                )
                .companyWebsite(
                        "theholymatrimony.com"
                )
                .build();
    }

    /*
     * ============================================================
     * HISTORY MAPPING
     * ============================================================
     */

    private PaymentHistoryResponse
    toPaymentHistoryResponse(
            Payment payment
    ) {

        int amountInPaise =
                payment.getAmount() == null
                        ? 0
                        : payment.getAmount();

        PaymentSource effectiveSource =
                resolvePaymentSource(
                        payment
                );

        return PaymentHistoryResponse
                .builder()
                .id(
                        payment.getId()
                )
                .razorpayOrderId(
                        payment.getRazorpayOrderId()
                )
                .razorpayPaymentId(
                        payment.getRazorpayPaymentId()
                )
                .plan(
                        payment.getPlan()
                )
                .billingCycle(
                        payment.getBillingCycle()
                )
                .amountInPaise(
                        amountInPaise
                )
                .amountInRupees(
                        amountInPaise / 100.0
                )
                .currency(
                        payment.getCurrency()
                )
                .status(
                        payment.getStatus()
                )
                .paymentSource(
                        effectiveSource
                )
                .paymentMethod(
                        payment.getPaymentMethod()
                )
                .couponCode(
                        payment.getCouponCode()
                )
                .receiptAvailable(
                        payment.getStatus()
                                == PaymentStatus.SUCCESS
                )
                .paidAt(
                        payment.getPaidAt()
                )
                .createdAt(
                        payment.getCreatedAt()
                )
                .build();
    }

    /*
     * ============================================================
     * PAYMENT SOURCE FALLBACK
     * ============================================================
     */

    private PaymentSource resolvePaymentSource(
            Payment payment
    ) {

        if (
                payment.getPaymentSource() != null
        ) {
            return payment.getPaymentSource();
        }

        /*
         * Older payment rows were Razorpay transactions before
         * payment_source was introduced.
         */

        return PaymentSource.RAZORPAY;
    }

    /*
     * ============================================================
     * RECEIPT NUMBER
     * ============================================================
     */

    private String buildInvoiceNumber(
            UUID paymentId,
            LocalDateTime receiptDate
    ) {

        LocalDate date =
                receiptDate != null
                        ? receiptDate.toLocalDate()
                        : LocalDate.now();

        String datePart =
                date.format(
                        DateTimeFormatter.BASIC_ISO_DATE
                );

        String paymentReference =
                paymentId
                        .toString()
                        .replace(
                                "-",
                                ""
                        )
                        .substring(
                                0,
                                10
                        )
                        .toUpperCase(
                                Locale.ROOT
                        );

        return "HM-" +
                datePart +
                "-" +
                paymentReference;
    }

    /*
     * ============================================================
     * PRICE CALCULATION
     * ============================================================
     */

    private int calculateAmountInPaise(
            MembershipPlan plan,
            BillingCycle billingCycle
    ) {

        int baseAmountInRupees =
                getBaseAmountInRupees(
                        plan,
                        billingCycle
                );

        int gstInRupees =
                Math.round(
                        baseAmountInRupees
                                * 0.18f
                );

        int totalInRupees =
                baseAmountInRupees
                        + gstInRupees;

        return totalInRupees * 100;
    }

    private int getBaseAmountInRupees(
            MembershipPlan plan,
            BillingCycle billingCycle
    ) {

        return switch (plan) {

            case SILVER ->
                    switch (billingCycle) {

                        case MONTHLY ->
                                499;

                        case QUARTERLY ->
                                1299;

                        case YEARLY ->
                                4499;
                    };

            case GOLD ->
                    switch (billingCycle) {

                        case MONTHLY ->
                                799;

                        case QUARTERLY ->
                                2199;

                        case YEARLY ->
                                7499;
                    };

            case PLATINUM ->
                    switch (billingCycle) {

                        case MONTHLY ->
                                1199;

                        case QUARTERLY ->
                                3299;

                        case YEARLY ->
                                10999;
                    };

            case FREE ->
                    throw new IllegalArgumentException(
                            "The FREE plan does not require payment."
                    );
        };
    }

    /*
     * ============================================================
     * PLAN
     * ============================================================
     */

    private MembershipPlan parsePlan(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Membership plan is required."
            );
        }

        try {

            MembershipPlan plan =
                    MembershipPlan.valueOf(
                            value
                                    .trim()
                                    .toUpperCase(
                                            Locale.ROOT
                                    )
                    );

            if (
                    plan ==
                            MembershipPlan.FREE
            ) {
                throw new IllegalArgumentException(
                        "The FREE plan does not require payment."
                );
            }

            return plan;

        } catch (
                IllegalArgumentException exception
        ) {

            throw new IllegalArgumentException(
                    "Invalid membership plan."
            );
        }
    }

    /*
     * ============================================================
     * BILLING CYCLE
     * ============================================================
     */

    private BillingCycle parseBillingCycle(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Billing cycle is required."
            );
        }

        try {

            return BillingCycle.valueOf(
                    value
                            .trim()
                            .toUpperCase(
                                    Locale.ROOT
                            )
            );

        } catch (
                IllegalArgumentException exception
        ) {

            throw new IllegalArgumentException(
                    "Invalid billing cycle."
            );
        }
    }

    /*
     * ============================================================
     * CREATE ORDER VALIDATION
     * ============================================================
     */

    private void validateCreateOrderRequest(
            CreateOrderRequest request
    ) {

        if (
                request == null
        ) {
            throw new IllegalArgumentException(
                    "Payment request is required."
            );
        }

        if (
                request.getPlan() == null ||
                request.getPlan().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Membership plan is required."
            );
        }

        if (
                request.getBillingCycle() == null ||
                request
                        .getBillingCycle()
                        .isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Billing cycle is required."
            );
        }

        if (
                request.getFullName() == null ||
                request
                        .getFullName()
                        .isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Customer name is required."
            );
        }
    }

    /*
     * ============================================================
     * VERIFICATION VALIDATION
     * ============================================================
     */

    private void validateVerificationRequest(
            VerifyPaymentRequest request
    ) {

        if (
                request == null
        ) {
            throw new IllegalArgumentException(
                    "Verification request is required."
            );
        }

        if (
                request.getRazorpay_order_id() == null ||
                request
                        .getRazorpay_order_id()
                        .isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay order ID is required."
            );
        }

        if (
                request.getRazorpay_payment_id() == null ||
                request
                        .getRazorpay_payment_id()
                        .isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID is required."
            );
        }

        if (
                request.getRazorpay_signature() == null ||
                request
                        .getRazorpay_signature()
                        .isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay signature is required."
            );
        }
    }

    /*
     * ============================================================
     * NULLABLE STRING
     * ============================================================
     */

    private String normalizeNullable(
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
}
