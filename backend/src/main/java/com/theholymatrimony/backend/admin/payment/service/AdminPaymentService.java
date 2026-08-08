package com.theholymatrimony.backend.admin.payment.service;

import com.theholymatrimony.backend.admin.payment.dto.AdminPaymentPageResponse;
import com.theholymatrimony.backend.admin.payment.dto.AdminPaymentResponse;

import com.theholymatrimony.backend.payments.dto.PaymentReceiptResponse;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.payments.service.PaymentService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPaymentService {

    private final PaymentRepository
            paymentRepository;

    private final PaymentService
            paymentService;

    /*
     * =====================================================
     * Admin Payment List
     * =====================================================
     */

    public AdminPaymentPageResponse getPayments(
            int page,
            int size,
            String search,
            PaymentStatus status
    ) {

        int safePage =
                Math.max(
                        page,
                        0
                );

        int safeSize =
                Math.min(
                        Math.max(
                                size,
                                1
                        ),
                        100
                );

        Pageable pageable =
                PageRequest.of(
                        safePage,
                        safeSize,
                        Sort.by(
                                Sort.Direction.DESC,
                                "createdAt"
                        )
                );

        Page<Payment> payments =
                paymentRepository
                        .searchAdminPayments(
                                normalizeSearch(
                                        search
                                ),
                                status,
                                pageable
                        );

        return AdminPaymentPageResponse
                .builder()
                .content(
                        payments
                                .getContent()
                                .stream()
                                .map(this::map)
                                .toList()
                )
                .page(
                        payments.getNumber()
                )
                .size(
                        payments.getSize()
                )
                .totalElements(
                        payments.getTotalElements()
                )
                .totalPages(
                        payments.getTotalPages()
                )
                .first(
                        payments.isFirst()
                )
                .last(
                        payments.isLast()
                )
                .build();
    }

    /*
     * =====================================================
     * Admin Payment Detail
     * =====================================================
     */

    public AdminPaymentResponse getPayment(
            UUID paymentId
    ) {

        Payment payment =
                findPayment(
                        paymentId
                );

        return map(
                payment
        );
    }

    /*
     * =====================================================
     * Admin Payment Receipt
     * =====================================================
     *
     * The existing member receipt service already:
     *
     * - validates successful payment
     * - builds invoice number
     * - calculates amounts
     * - adds Holy Matrimony company information
     * - creates PaymentReceiptResponse
     *
     * We intentionally reuse that implementation rather
     * than creating a second receipt-generation rule.
     *
     * Admin authorization is provided by the
     * /api/v1/admin/** security rules.
     */

    public PaymentReceiptResponse getPaymentReceipt(
            UUID paymentId
    ) {

        Payment payment =
                findPayment(
                        paymentId
                );

        /*
         * PaymentService.getPaymentReceipt currently validates
         * ownership using the payment email.
         *
         * Since this Admin service has already securely loaded
         * the payment through the admin endpoint, we pass the
         * payment's actual email so the existing receipt builder
         * can be reused without weakening the member endpoint.
         */
        String paymentEmail =
                payment.getEmail();

        if (
                paymentEmail == null
                        || paymentEmail.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Payment email was not found."
            );
        }

        return paymentService
                .getPaymentReceipt(
                        paymentId,
                        paymentEmail.trim()
                );
    }

    /*
     * =====================================================
     * Mapping
     * =====================================================
     */

    private AdminPaymentResponse map(
            Payment payment
    ) {

        return AdminPaymentResponse
                .builder()
                .paymentId(
                        payment.getId()
                )
                .userId(
                        payment
                                .getUser()
                                .getId()
                )
                .fullName(
                        payment
                                .getUser()
                                .getFullName()
                )
                .accountEmail(
                        payment
                                .getUser()
                                .getEmail()
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
                .customerName(
                        payment.getCustomerName()
                )
                .email(
                        payment.getEmail()
                )
                .phone(
                        payment.getPhone()
                )
                .amountInPaise(
                        payment.getAmount()
                )
                .amountInRupees(
                        payment.getAmount() == null
                                ? null
                                : payment.getAmount()
                                / 100.0
                )
                .currency(
                        payment.getCurrency()
                )
                .status(
                        payment.getStatus()
                )
                .paidAt(
                        payment.getPaidAt()
                )
                .createdAt(
                        payment.getCreatedAt()
                )
                .updatedAt(
                        payment.getUpdatedAt()
                )
                .build();
    }

    /*
     * =====================================================
     * Helpers
     * =====================================================
     */

    private Payment findPayment(
            UUID paymentId
    ) {

        if (
                paymentId == null
        ) {
            throw new IllegalArgumentException(
                    "Payment ID is required."
            );
        }

        return paymentRepository
                .findAdminPaymentById(
                        paymentId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Payment was not found."
                                )
                );
    }

    private String normalizeSearch(
            String search
    ) {

        if (
                search == null
                        || search.isBlank()
        ) {
            return null;
        }

        return search.trim();
    }
}