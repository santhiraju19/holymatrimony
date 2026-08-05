package com.theholymatrimony.backend.payments.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.PaymentHistoryResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.BillingCycle;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.List;

@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)

@Service
@RequiredArgsConstructor
@Transactional
public class RazorpayServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    public CreateOrderResponse createOrder(
            CreateOrderRequest request,
            String authenticatedEmail
    ) throws Exception {

        validateCreateOrderRequest(request);

        User user = userRepository
                .findByEmail(authenticatedEmail)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Authenticated user was not found."
                        )
                );

        MembershipPlan plan = parsePlan(
                request.getPlan()
        );

        BillingCycle billingCycle = parseBillingCycle(
                request.getBillingCycle()
        );

        int amountInPaise = calculateAmountInPaise(
                plan,
                billingCycle
        );

        JSONObject options = new JSONObject();

        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put(
                "receipt",
                "HM-" + System.currentTimeMillis()
        );

        JSONObject notes = new JSONObject();

        notes.put("plan", plan.name());
        notes.put(
                "billingCycle",
                billingCycle.name()
        );
        notes.put("email", user.getEmail());

        options.put("notes", notes);

        Order razorpayOrder =
                razorpayClient.orders.create(options);

        String razorpayOrderId =
                razorpayOrder.get("id");

        Payment payment = Payment.builder()
                .razorpayOrderId(razorpayOrderId)
                .plan(plan.name())
                .billingCycle(billingCycle.name())
                .customerName(
                        request.getFullName().trim()
                )
                .email(user.getEmail())
                .phone(
                        request.getPhone() == null
                                ? null
                                : request.getPhone().trim()
                )
                .amount(amountInPaise)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        return new CreateOrderResponse(
                razorpayOrderId,
                keyId,
                amountInPaise,
                "INR"
        );
    }

    @Override
    public void verifyPayment(
            VerifyPaymentRequest request,
            String authenticatedEmail
    ) throws Exception {

        validateVerificationRequest(request);

        Payment payment = paymentRepository
                .findByRazorpayOrderId(
                        request.getRazorpay_order_id()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Payment order was not found."
                        )
                );

        if (
                !payment.getEmail()
                        .equalsIgnoreCase(authenticatedEmail)
        ) {
            throw new IllegalArgumentException(
                    "This payment does not belong to the authenticated user."
            );
        }

        if (
                payment.getStatus()
                        == PaymentStatus.SUCCESS
        ) {
            return;
        }

        if (
                paymentRepository.existsByRazorpayPaymentId(
                        request.getRazorpay_payment_id()
                )
        ) {
            throw new IllegalArgumentException(
                    "This payment has already been processed."
            );
        }

        JSONObject signatureAttributes =
                new JSONObject();

        signatureAttributes.put(
                "razorpay_order_id",
                request.getRazorpay_order_id()
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
            payment.setStatus(
                    PaymentStatus.FAILED
            );

            paymentRepository.save(payment);

            throw new IllegalArgumentException(
                    "Invalid Razorpay payment signature."
            );
        }

        payment.setRazorpayPaymentId(
                request.getRazorpay_payment_id()
        );

        payment.setRazorpaySignature(
                request.getRazorpay_signature()
        );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        paymentRepository.save(payment);

        activateMembership(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> getPaymentHistory(
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
                .findByEmail(normalizedEmail)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Authenticated user was not found."
                        )
                );

        return paymentRepository
                .findAllByEmailIgnoreCaseOrderByCreatedAtDesc(
                        normalizedEmail
                )
                .stream()
                .map(this::toPaymentHistoryResponse)
                .toList();
    }


@Override
@Transactional(readOnly = true)
public PaymentReceiptResponse getPaymentReceipt(
        Long paymentId,
        String authenticatedEmail
) {
    if (paymentId == null || paymentId <= 0) {
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

    Payment payment = paymentRepository
            .findByIdAndEmailIgnoreCase(
                    paymentId,
                    normalizedEmail
            )
            .orElseThrow(
                    () -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Payment receipt was not found."
                    )
            );

    if (payment.getStatus() != PaymentStatus.SUCCESS) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "A receipt is available only for successful payments."
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
            BigDecimal.valueOf(amountInPaise)
                    .divide(
                            BigDecimal.valueOf(100),
                            2,
                            RoundingMode.HALF_UP
                    );

    return PaymentReceiptResponse.builder()
            .paymentRecordId(payment.getId())
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
            .memberName(
                    payment.getCustomerName()
            )
            .email(payment.getEmail())
            .phone(payment.getPhone())
            .plan(payment.getPlan())
            .billingCycle(
                    payment.getBillingCycle()
            )
            .amountInPaise(amountInPaise)
            .amountInRupees(amountInRupees)
            .currency(payment.getCurrency())
            .status(payment.getStatus().name())
            .paidAt(payment.getPaidAt())
            .createdAt(payment.getCreatedAt())
            .companyName(
                    "Holy Matrimony Services Private Limited"
            )
            .companyGstin(
                    "37AAICH7679D1Z5"
            )
            .companyAddress(
                    "8-17-154, 1st Line, Mangaldas Nagar, " +
                    "Guntur - 522001, Andhra Pradesh, India"
            )
            .build();
}
    private PaymentHistoryResponse toPaymentHistoryResponse(
            Payment payment
    ) {
        int amountInPaise =
                payment.getAmount() == null
                        ? 0
                        : payment.getAmount();

        return PaymentHistoryResponse.builder()
                .id(payment.getId())
                .razorpayOrderId(
                        payment.getRazorpayOrderId()
                )
                .razorpayPaymentId(
                        payment.getRazorpayPaymentId()
                )
                .plan(payment.getPlan())
                .billingCycle(
                        payment.getBillingCycle()
                )
                .amountInPaise(amountInPaise)
                .amountInRupees(
                        amountInPaise / 100.0
                )
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
private String buildInvoiceNumber(
        Long paymentId,
        LocalDateTime receiptDate
) {
    LocalDate date =
            receiptDate != null
                    ? receiptDate.toLocalDate()
                    : LocalDate.now();

    String datePart = date.format(
            DateTimeFormatter.BASIC_ISO_DATE
    );

    return "HM-" +
            datePart +
            "-" +
            String.format("%06d", paymentId);
}
    private void activateMembership(
            Payment payment
    ) {
        User user = userRepository
                .findByEmail(payment.getEmail())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User was not found."
                        )
                );

        MembershipPlan plan =
                MembershipPlan.valueOf(
                        payment.getPlan()
                );

        BillingCycle billingCycle =
                BillingCycle.valueOf(
                        payment.getBillingCycle()
                );

        List<Membership> memberships =
                membershipRepository.findAllByUser(user);

        for (Membership membership : memberships) {
            if (
                    membership.getStatus()
                            == MembershipStatus.ACTIVE
            ) {
                membership.setStatus(
                        MembershipStatus.CANCELLED
                );

                membershipRepository.save(
                        membership
                );
            }
        }

        LocalDateTime startDate =
                LocalDateTime.now();

        LocalDateTime expiryDate =
                calculateExpiryDate(
                        startDate,
                        billingCycle
                );

        Membership membership =
                Membership.builder()
                        .user(user)
                        .plan(plan)
                        .billingCycle(billingCycle)
                        .startDate(startDate)
                        .expiryDate(expiryDate)
                        .status(
                                MembershipStatus.ACTIVE
                        )
                        .payment(payment)
                        .autoRenew(false)
                        .build();

        membershipRepository.save(membership);
    }

    private int calculateAmountInPaise(
            MembershipPlan plan,
            BillingCycle billingCycle
    ) {
        int baseAmountInRupees =
                getBaseAmountInRupees(
                        plan,
                        billingCycle
                );

        int gstInRupees = Math.round(
                baseAmountInRupees * 0.18f
        );

        int totalInRupees =
                baseAmountInRupees + gstInRupees;

        return totalInRupees * 100;
    }

    private int getBaseAmountInRupees(
            MembershipPlan plan,
            BillingCycle billingCycle
    ) {
        return switch (plan) {
            case SILVER -> switch (billingCycle) {
                case MONTHLY -> 499;
                case QUARTERLY -> 1299;
                case YEARLY -> 4499;
            };

            case GOLD -> switch (billingCycle) {
                case MONTHLY -> 799;
                case QUARTERLY -> 2199;
                case YEARLY -> 7499;
            };

            case PLATINUM -> switch (billingCycle) {
                case MONTHLY -> 1199;
                case QUARTERLY -> 3299;
                case YEARLY -> 10999;
            };

            case FREE -> throw new IllegalArgumentException(
                    "The FREE plan does not require payment."
            );
        };
    }

    private LocalDateTime calculateExpiryDate(
            LocalDateTime startDate,
            BillingCycle billingCycle
    ) {
        return switch (billingCycle) {
            case MONTHLY ->
                    startDate.plusMonths(1);

            case QUARTERLY ->
                    startDate.plusMonths(3);

            case YEARLY ->
                    startDate.plusYears(1);
        };
    }

    private MembershipPlan parsePlan(
            String value
    ) {
        try {
            MembershipPlan plan =
                    MembershipPlan.valueOf(
                            value.trim()
                                    .toUpperCase()
                    );

            if (plan == MembershipPlan.FREE) {
                throw new IllegalArgumentException(
                        "The FREE plan does not require payment."
                );
            }

            return plan;
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid membership plan."
            );
        }
    }

    private BillingCycle parseBillingCycle(
            String value
    ) {
        try {
            return BillingCycle.valueOf(
                    value.trim()
                            .toUpperCase()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid billing cycle."
            );
        }
    }

    private void validateCreateOrderRequest(
            CreateOrderRequest request
    ) {
        if (request == null) {
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
                request.getBillingCycle().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Billing cycle is required."
            );
        }

        if (
                request.getFullName() == null ||
                request.getFullName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Customer name is required."
            );
        }
    }

    private void validateVerificationRequest(
            VerifyPaymentRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Verification request is required."
            );
        }

        if (
                request.getRazorpay_order_id() == null ||
                request.getRazorpay_order_id().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay order ID is required."
            );
        }

        if (
                request.getRazorpay_payment_id() == null ||
                request.getRazorpay_payment_id().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID is required."
            );
        }

        if (
                request.getRazorpay_signature() == null ||
                request.getRazorpay_signature().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay signature is required."
            );
        }
    }
}
