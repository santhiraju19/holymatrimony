package com.theholymatrimony.backend.secureconnect.topup.service;

import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectLedgerEntry;
import com.theholymatrimony.backend.secureconnect.enums.BalanceSource;
import com.theholymatrimony.backend.secureconnect.enums.LedgerTransactionType;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectLedgerRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;
import com.theholymatrimony.backend.secureconnect.topup.entity.SecureConnectTopUpPayment;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SecureConnectTopUpFulfillmentServiceImpl
        implements SecureConnectTopUpFulfillmentService {

    private static final String LEDGER_KEY_PREFIX =
            "SECURE_CONNECT_TOPUP:";

    private final SecureConnectTopUpPaymentRepository
            topUpPaymentRepository;

    private final SecureConnectWalletRepository
            walletRepository;

    private final SecureConnectLedgerRepository
            ledgerRepository;

    @Override
    @Transactional
    public void finalizeCapturedPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String paymentMethod
    ) {

        if (
                razorpayOrderId == null ||
                razorpayOrderId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay order ID is required."
            );
        }

        if (
                razorpayPaymentId == null ||
                razorpayPaymentId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Razorpay payment ID is required."
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

        /*
         * A Razorpay payment ID may belong to only one
         * Secure Connect top-up transaction.
         */
        topUpPaymentRepository
                .findByRazorpayPaymentId(
                        razorpayPaymentId
                )
                .ifPresent(
                        existing -> {
                            if (
                                    !existing
                                            .getId()
                                            .equals(
                                                    topUpPayment.getId()
                                            )
                            ) {
                                throw new IllegalArgumentException(
                                        "Razorpay payment ID is already associated with another Secure Connect top-up."
                                );
                            }
                        }
                );

        /*
         * Browser verification may later populate this field.
         * If present, it must agree with the webhook.
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
                    "Razorpay payment ID does not match the Secure Connect top-up checkout."
            );
        }

        String ledgerKey =
                LEDGER_KEY_PREFIX +
                        topUpPayment.getId();

        /*
         * Webhook retries must never add minutes twice.
         */
        if (
                topUpPayment.getStatus()
                        == PaymentStatus.SUCCESS
        ) {
            return;
        }

        if (
                ledgerRepository
                        .existsByIdempotencyKey(
                                ledgerKey
                        )
        ) {
            /*
             * Defensive recovery:
             * if the credit ledger already exists, do not credit
             * the wallet again.
             */
            topUpPayment.setRazorpayPaymentId(
                    razorpayPaymentId
            );

            if (
                    paymentMethod != null &&
                    !paymentMethod.isBlank()
            ) {
                topUpPayment.setPaymentMethod(
                        paymentMethod
                );
            }

            topUpPayment.setStatus(
                    PaymentStatus.SUCCESS
            );

            if (
                    topUpPayment.getPaidAt()
                            == null
            ) {
                topUpPayment.setPaidAt(
                        LocalDateTime.now()
                );
            }

            topUpPaymentRepository.save(
                    topUpPayment
            );

            return;
        }

        long purchasedSeconds =
                topUpPayment.getSeconds();

        if (purchasedSeconds <= 0) {
            throw new IllegalStateException(
                    "Secure Connect top-up seconds must be positive."
            );
        }

        int creditedRows =
                walletRepository
                        .creditTopUpSeconds(
                                java.util.UUID.randomUUID(),
                                topUpPayment
                                        .getUser()
                                        .getId(),
                                topUpPayment
                                        .getMediaType()
                                        .name(),
                                purchasedSeconds
                        );

        if (creditedRows != 1) {
            throw new IllegalStateException(
                    "Secure Connect wallet credit failed."
            );
        }

        SecureConnectLedgerEntry ledgerEntry =
                SecureConnectLedgerEntry
                        .builder()
                        .user(
                                topUpPayment.getUser()
                        )
                        .callSession(
                                null
                        )
                        .membership(
                                null
                        )
                        /*
                         * secure_connect_ledger.payment_id points
                         * to the membership payments table.
                         *
                         * Top-up transactions live in their own
                         * table, therefore payment must remain null.
                         */
                        .payment(
                                null
                        )
                        .mediaType(
                                topUpPayment.getMediaType()
                        )
                        .transactionType(
                                LedgerTransactionType.TOPUP_PURCHASE
                        )
                        .balanceSource(
                                BalanceSource.TOPUP
                        )
                        .seconds(
                                purchasedSeconds
                        )
                        .idempotencyKey(
                                ledgerKey
                        )
                        .note(
                                "Secure Connect top-up purchase: " +
                                        topUpPayment.getMinutes() +
                                        " " +
                                        topUpPayment
                                                .getMediaType()
                                                .name() +
                                        " minutes."
                        )
                        .build();

        ledgerRepository.save(
                ledgerEntry
        );

        topUpPayment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        if (
                paymentMethod != null &&
                !paymentMethod.isBlank()
        ) {
            topUpPayment.setPaymentMethod(
                    paymentMethod
            );
        }

        topUpPayment.setStatus(
                PaymentStatus.SUCCESS
        );

        topUpPayment.setPaidAt(
                LocalDateTime.now()
        );

        topUpPaymentRepository.save(
                topUpPayment
        );
    }

    @Override
    @Transactional
    public void markPaymentFailed(
            String razorpayOrderId,
            String razorpayPaymentId,
            String paymentMethod
    ) {

        if (
                razorpayOrderId == null ||
                razorpayOrderId.isBlank()
        ) {
            return;
        }

        topUpPaymentRepository
                .findByRazorpayOrderId(
                        razorpayOrderId
                )
                .ifPresent(
                        topUpPayment -> {

                            /*
                             * Razorpay webhook ordering is not
                             * guaranteed. Never downgrade SUCCESS.
                             */
                            if (
                                    topUpPayment.getStatus()
                                            == PaymentStatus.SUCCESS
                            ) {
                                return;
                            }

                            if (
                                    razorpayPaymentId != null &&
                                    !razorpayPaymentId.isBlank()
                            ) {
                                if (
                                        topUpPayment
                                                .getRazorpayPaymentId()
                                                != null &&
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
                                            "Razorpay payment ID does not match the Secure Connect top-up checkout."
                                    );
                                }

                                topUpPayment.setRazorpayPaymentId(
                                        razorpayPaymentId
                                );
                            }

                            if (
                                    paymentMethod != null &&
                                    !paymentMethod.isBlank()
                            ) {
                                topUpPayment.setPaymentMethod(
                                        paymentMethod
                                );
                            }

                            topUpPayment.setStatus(
                                    PaymentStatus.FAILED
                            );

                            topUpPaymentRepository.save(
                                    topUpPayment
                            );
                        }
                );
    }
}
