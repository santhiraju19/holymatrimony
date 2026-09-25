package com.theholymatrimony.backend.secureconnect.termination;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(
        replace = AutoConfigureTestDatabase.Replace.NONE
)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/hm_termination_jpa_test",
        "spring.datasource.username=santhiraju",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.show-sql=false"
})
class SecureConnectMediaTerminationRepositoryIntegrationTests {

    @Autowired
    private SecureConnectMediaTerminationRepository repository;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PlatformTransactionManager transactionManager;


    @Test
    void retryClaimAppliesBackoffAndRejectsStaleWorker() {
        TransactionTemplate transaction =
                new TransactionTemplate(transactionManager);

        UUID callId = UUID.randomUUID();
        UUID terminationId = UUID.randomUUID();
        UUID firstToken = UUID.randomUUID();
        UUID secondToken = UUID.randomUUID();

        try {
            transaction.executeWithoutResult(status -> {
                jdbc.update(
                        "INSERT INTO secure_connect_call_sessions(id) VALUES (?)",
                        callId
                );

                assertEquals(
                        1,
                        repository.enqueueIfAbsent(
                                terminationId,
                                callId,
                                "LIVEKIT",
                                "sc_" + callId
                        )
                );
            });

            assertEquals(
                    List.of(terminationId),
                    transaction.execute(
                            status -> repository.claimNextBatch(
                                    firstToken,
                                    1
                            )
                    )
            );

            assertEquals(
                    1,
                    (transaction.execute(
                            status -> repository.retryClaim(
                                    terminationId,
                                    firstToken
                            )
                    )).intValue()
            );

            Integer retryState = jdbc.queryForObject(
                    "SELECT COUNT(*) " +
                    "FROM secure_connect_media_terminations " +
                    "WHERE id = ? " +
                    "AND status = 'PENDING' " +
                    "AND attempt_count = 1 " +
                    "AND claim_token IS NULL " +
                    "AND lease_expires_at IS NULL " +
                    "AND next_attempt_at > CURRENT_TIMESTAMP " +
                    "AND next_attempt_at <= " +
                    "CURRENT_TIMESTAMP + INTERVAL '3 seconds'",
                    Integer.class,
                    terminationId
            );

            assertEquals(1, retryState);

            assertTrue(
                    transaction.execute(
                            status -> repository.claimNextBatch(
                                    secondToken,
                                    1
                            )
                    ).isEmpty(),
                    "Retry must not be immediately eligible."
            );

            // Simulate the passage of the retry delay.
            jdbc.update(
                    "UPDATE secure_connect_media_terminations " +
                    "SET next_attempt_at = CURRENT_TIMESTAMP " +
                    "- INTERVAL '1 second' WHERE id = ?",
                    terminationId
            );

            assertEquals(
                    List.of(terminationId),
                    transaction.execute(
                            status -> repository.claimNextBatch(
                                    secondToken,
                                    1
                            )
                    )
            );

            assertEquals(
                    0,
                    (transaction.execute(
                            status -> repository.completeClaim(
                                    terminationId,
                                    firstToken
                            )
                    )).intValue(),
                    "Previous worker must not complete a new claim."
            );

            assertEquals(
                    0,
                    (transaction.execute(
                            status -> repository.retryClaim(
                                    terminationId,
                                    firstToken
                            )
                    )).intValue(),
                    "Previous worker must not reschedule a new claim."
            );

            assertEquals(
                    1,
                    (transaction.execute(
                            status -> repository.completeClaim(
                                    terminationId,
                                    secondToken
                            )
                    )).intValue()
            );

        } finally {
            jdbc.update(
                    "DELETE FROM secure_connect_media_terminations " +
                    "WHERE call_session_id = ?",
                    callId
            );

            jdbc.update(
                    "DELETE FROM secure_connect_call_sessions WHERE id = ?",
                    callId
            );
        }
    }


    @Test
    void expiredLeaseCanBeReclaimedByAnotherWorker() {
        TransactionTemplate transaction =
                new TransactionTemplate(transactionManager);

        UUID callId = UUID.randomUUID();
        UUID terminationId = UUID.randomUUID();
        UUID originalToken = UUID.randomUUID();
        UUID recoveryToken = UUID.randomUUID();

        try {
            transaction.executeWithoutResult(status -> {
                jdbc.update(
                        "INSERT INTO secure_connect_call_sessions(id) VALUES (?)",
                        callId
                );

                assertEquals(
                        1,
                        repository.enqueueIfAbsent(
                                terminationId,
                                callId,
                                "LIVEKIT",
                                "sc_" + callId
                        )
                );
            });

            List<UUID> originalClaim = transaction.execute(
                    status -> repository.claimNextBatch(originalToken, 1)
            );

            assertEquals(List.of(terminationId), originalClaim);

            // Simulate a worker that stopped responding.
            jdbc.update(
                    "UPDATE secure_connect_media_terminations " +
                    "SET lease_expires_at = CURRENT_TIMESTAMP " +
                    "- INTERVAL '1 second' " +
                    "WHERE id = ?",
                    terminationId
            );

            List<UUID> recoveredClaim = transaction.execute(
                    status -> repository.claimNextBatch(recoveryToken, 1)
            );

            assertEquals(
                    List.of(terminationId),
                    recoveredClaim,
                    "Another worker must recover the expired lease."
            );

            Integer recoveredState = jdbc.queryForObject(
                    "SELECT COUNT(*) " +
                    "FROM secure_connect_media_terminations " +
                    "WHERE id = ? " +
                    "AND status = 'PROCESSING' " +
                    "AND claim_token = ? " +
                    "AND lease_expires_at > CURRENT_TIMESTAMP",
                    Integer.class,
                    terminationId,
                    recoveryToken
            );

            assertEquals(1, recoveredState);

            Integer staleCompletion = transaction.execute(
                    status -> repository.completeClaim(
                            terminationId,
                            originalToken
                    )
            );

            assertEquals(0, staleCompletion);

            Integer recoveredCompletion = transaction.execute(
                    status -> repository.completeClaim(
                            terminationId,
                            recoveryToken
                    )
            );

            assertEquals(1, recoveredCompletion);

        } finally {
            jdbc.update(
                    "DELETE FROM secure_connect_media_terminations " +
                    "WHERE call_session_id = ?",
                    callId
            );

            jdbc.update(
                    "DELETE FROM secure_connect_call_sessions WHERE id = ?",
                    callId
            );
        }
    }

    @Test
    void springDataJpaCanClaimCompleteAndRejectStaleClaim() {
        TransactionTemplate transaction =
                new TransactionTemplate(transactionManager);

        UUID callId = UUID.randomUUID();
        UUID terminationId = UUID.randomUUID();
        UUID firstToken = UUID.randomUUID();
        UUID staleToken = UUID.randomUUID();

        try {
            transaction.executeWithoutResult(status -> {
                jdbc.update(
                        "INSERT INTO secure_connect_call_sessions(id) VALUES (?)",
                        callId
                );

                assertEquals(
                        1,
                        repository.enqueueIfAbsent(
                                terminationId,
                                callId,
                                "LIVEKIT",
                                "sc_" + callId
                        )
                );

                assertEquals(
                        0,
                        repository.enqueueIfAbsent(
                                UUID.randomUUID(),
                                callId,
                                "LIVEKIT",
                                "sc_" + callId
                        )
                );
            });

            List<UUID> claimed = transaction.execute(
                    status -> repository.claimNextBatch(firstToken, 1)
            );

            assertNotNull(claimed);
            assertEquals(List.of(terminationId), claimed);

            Integer processing = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM secure_connect_media_terminations " +
                    "WHERE id = ? AND status = 'PROCESSING' " +
                    "AND claim_token = ?",
                    Integer.class,
                    terminationId,
                    firstToken
            );

            assertEquals(1, processing);

            Integer staleCompletion = transaction.execute(
                    status -> repository.completeClaim(
                            terminationId,
                            staleToken
                    )
            );

            assertEquals(0, staleCompletion);

            Integer completed = transaction.execute(
                    status -> repository.completeClaim(
                            terminationId,
                            firstToken
                    )
            );

            assertEquals(1, completed);

            Integer completedRows = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM secure_connect_media_terminations " +
                    "WHERE id = ? AND status = 'COMPLETED' " +
                    "AND claim_token IS NULL",
                    Integer.class,
                    terminationId
            );

            assertEquals(1, completedRows);

        } finally {
            jdbc.update(
                    "DELETE FROM secure_connect_media_terminations " +
                    "WHERE call_session_id = ?",
                    callId
            );

            jdbc.update(
                    "DELETE FROM secure_connect_call_sessions WHERE id = ?",
                    callId
            );
        }
    }
}
