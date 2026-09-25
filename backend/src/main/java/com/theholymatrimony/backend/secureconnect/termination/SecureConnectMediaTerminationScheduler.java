package com.theholymatrimony.backend.secureconnect.termination;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecureConnectMediaTerminationScheduler {

    private static final int MAX_PER_SCAN = 10;

    private final SecureConnectMediaTerminationProcessor processor;

    @Scheduled(
            fixedDelayString =
                    "${secure-connect.call.media-termination-scan-millis:1000}"
    )
    public void processPendingTerminations() {

        for (int attempt = 0; attempt < MAX_PER_SCAN; attempt++) {

            UUID claimToken = UUID.randomUUID();
            List<UUID> claimed;

            try {
                claimed = processor.claimNext(claimToken);
            } catch (RuntimeException exception) {
                log.error(
                        "Unable to claim LiveKit termination.",
                        exception
                );
                return;
            }

            if (claimed.isEmpty()) {
                return;
            }

            UUID terminationId = claimed.get(0);

            try {
                String roomName = processor.getClaimedRoom(
                        terminationId,
                        claimToken
                );

                if (roomName == null) {
                    log.warn(
                            "LiveKit termination claim was lost: {}",
                            terminationId
                    );
                    continue;
                }

                processor.terminateRoom(roomName);

                boolean completed = processor.markCompleted(
                        terminationId,
                        claimToken
                );

                if (completed) {
                    log.info(
                            "LiveKit termination completed: {}",
                            terminationId
                    );
                } else {
                    log.warn(
                            "LiveKit termination completion claim expired: {}",
                            terminationId
                    );
                }

            } catch (RuntimeException exception) {

                log.warn(
                        "LiveKit termination attempt failed: {}",
                        terminationId
                );

                try {
                    processor.scheduleRetry(
                            terminationId,
                            claimToken
                    );
                } catch (RuntimeException retryException) {
                    log.error(
                            "Unable to persist termination retry: {}",
                            terminationId,
                            retryException
                    );
                }
            }
        }
    }
}
