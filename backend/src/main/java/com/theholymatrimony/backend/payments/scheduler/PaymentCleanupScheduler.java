package com.theholymatrimony.backend.payments.scheduler;

import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "payments.enabled",
        havingValue = "true"
)
public class PaymentCleanupScheduler {

    private static final Logger log =
            LoggerFactory.getLogger(
                    PaymentCleanupScheduler.class
            );

    private static final int
            STALE_PAYMENT_HOURS = 24;

    private final PaymentRepository
            paymentRepository;

    /*
     * Runs once every day at 3:15 AM.
     *
     * Spring uses the server timezone unless
     * another timezone is explicitly configured.
     */
    @Scheduled(
            cron = "0 15 3 * * *"
    )
    @Transactional
    public void cancelStalePendingPayments() {

        LocalDateTime cutoff =
                LocalDateTime
                        .now()
                        .minusHours(
                                STALE_PAYMENT_HOURS
                        );

        List<Payment> stalePayments =
                paymentRepository
                        .findAllByStatusAndCreatedAtBefore(
                                PaymentStatus.PENDING,
                                cutoff
                        );

        if (stalePayments.isEmpty()) {
            log.debug(
                    "No stale pending payments found."
            );

            return;
        }

        for (Payment payment : stalePayments) {

            payment.setStatus(
                    PaymentStatus.CANCELLED
            );
        }

        paymentRepository.saveAll(
                stalePayments
        );

        log.info(
                "Cancelled {} stale PENDING payment(s) older than {} hours.",
                stalePayments.size(),
                STALE_PAYMENT_HOURS
        );
    }
}