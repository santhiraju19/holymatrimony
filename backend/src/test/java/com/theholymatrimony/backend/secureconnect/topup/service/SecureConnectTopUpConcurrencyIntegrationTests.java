package com.theholymatrimony.backend.secureconnect.topup.service;

import com.theholymatrimony.backend.secureconnect.repository.SecureConnectLedgerRepository;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectWalletRepository;
import com.theholymatrimony.backend.secureconnect.topup.repository.SecureConnectTopUpPaymentRepository;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@Import(SecureConnectTopUpFulfillmentServiceImpl.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/hm_topup_concurrency_test",
        "spring.datasource.username=santhiraju",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.show-sql=false"
})
class SecureConnectTopUpConcurrencyIntegrationTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private SecureConnectTopUpFulfillmentServiceImpl service;

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void concurrentCaptureCreditsWalletExactlyOnce() throws Exception {

        String database = jdbc.queryForObject(
                "SELECT current_database()",
                String.class
        );

        assertEquals(
                "hm_topup_concurrency_test",
                database,
                "Refusing to run against another database."
        );

        UUID userId = UUID.randomUUID();
        UUID topUpId = UUID.randomUUID();

        String orderId = "order_test_" + topUpId;
        String paymentId = "pay_test_" + topUpId;

        String ledgerKey = "SECURE_CONNECT_TOPUP:" + topUpId;

        ExecutorService executor = Executors.newFixedThreadPool(2);

        try {

            jdbc.update(
                    """
                    INSERT INTO users (
                        id,
                        full_name,
                        email,
                        password,
                        enabled,
                        profile_completion,
                        created_at,
                        membership_type,
                        role,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)
                    """,
                    userId,
                    "Concurrency Test User",
                    "topup-" + userId + "@example.test",
                    "test-password",
                    true,
                    0,
                    "FREE",
                    "ROLE_USER",
                    "ACTIVE"
            );

            jdbc.update(
                    """
                    INSERT INTO secure_connect_topup_payments (
                        id,
                        user_id,
                        media_type,
                        minutes,
                        seconds,
                        amount,
                        currency,
                        razorpay_order_id,
                        status,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                    """,
                    topUpId,
                    userId,
                    "AUDIO",
                    60,
                    3600L,
                    7900,
                    "INR",
                    orderId,
                    "PENDING"
            );

            CountDownLatch ready = new CountDownLatch(2);
            CountDownLatch start = new CountDownLatch(1);

            java.util.concurrent.Callable<Void> capture = () -> {

                ready.countDown();

                if (!start.await(10, TimeUnit.SECONDS)) {
                    throw new IllegalStateException(
                            "Concurrent test start timed out."
                    );
                }

                service.finalizeCapturedPayment(
                        orderId,
                        paymentId,
                        "UPI"
                );

                return null;
            };

            Future<Void> first = executor.submit(capture);
            Future<Void> second = executor.submit(capture);

            assertTrue(
                    ready.await(10, TimeUnit.SECONDS),
                    "Both capture workers must be ready."
            );

            start.countDown();

            first.get(30, TimeUnit.SECONDS);
            second.get(30, TimeUnit.SECONDS);

            Long walletBalance = jdbc.queryForObject(
                    """
                    SELECT balance_seconds
                    FROM secure_connect_wallets
                    WHERE user_id = ?
                      AND media_type = 'AUDIO'
                    """,
                    Long.class,
                    userId
            );

            assertEquals(3600L, walletBalance);

            Integer ledgerCount = jdbc.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM secure_connect_ledger
                    WHERE idempotency_key = ?
                    """,
                    Integer.class,
                    ledgerKey
            );

            assertEquals(1, ledgerCount);

            String status = jdbc.queryForObject(
                    """
                    SELECT status
                    FROM secure_connect_topup_payments
                    WHERE id = ?
                    """,
                    String.class,
                    topUpId
            );

            assertEquals("SUCCESS", status);

            String storedPaymentId = jdbc.queryForObject(
                    """
                    SELECT razorpay_payment_id
                    FROM secure_connect_topup_payments
                    WHERE id = ?
                    """,
                    String.class,
                    topUpId
            );

            assertEquals(paymentId, storedPaymentId);

        } finally {

            executor.shutdownNow();

            executor.awaitTermination(
                    10,
                    TimeUnit.SECONDS
            );

            jdbc.update(
                    """
                    DELETE FROM secure_connect_ledger
                    WHERE idempotency_key = ?
                    """,
                    ledgerKey
            );

            jdbc.update(
                    """
                    DELETE FROM secure_connect_wallets
                    WHERE user_id = ?
                    """,
                    userId
            );

            jdbc.update(
                    """
                    DELETE FROM secure_connect_topup_payments
                    WHERE id = ?
                    """,
                    topUpId
            );

            jdbc.update(
                    """
                    DELETE FROM users
                    WHERE id = ?
                    """,
                    userId
            );
        }
    }
}
