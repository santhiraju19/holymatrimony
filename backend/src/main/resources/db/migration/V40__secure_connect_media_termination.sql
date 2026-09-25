-- Persistent LiveKit room termination requests.
-- A request is created when a call reaches a terminal state.
-- Processing occurs separately, after the call transaction commits.

CREATE TABLE secure_connect_media_terminations (
    id UUID PRIMARY KEY,

    call_session_id UUID NOT NULL,

    provider VARCHAR(30) NOT NULL,

    provider_room_id VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    attempt_count INTEGER NOT NULL DEFAULT 0,

    claim_token UUID,

    lease_expires_at TIMESTAMP,

    next_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_error VARCHAR(1000),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    completed_at TIMESTAMP,

    CONSTRAINT fk_sc_media_termination_call
        FOREIGN KEY (call_session_id)
        REFERENCES secure_connect_call_sessions(id),

    CONSTRAINT uq_sc_media_termination_call
        UNIQUE (call_session_id),

    CONSTRAINT chk_sc_media_termination_status
        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED')),

    CONSTRAINT chk_sc_media_termination_lease
        CHECK (
            (status = 'PROCESSING'
                AND claim_token IS NOT NULL
                AND lease_expires_at IS NOT NULL)
            OR
            (status <> 'PROCESSING'
                AND claim_token IS NULL
                AND lease_expires_at IS NULL)
        ),

    CONSTRAINT chk_sc_media_termination_attempts
        CHECK (attempt_count >= 0)
);

CREATE INDEX idx_sc_media_termination_pending
    ON secure_connect_media_terminations (
        next_attempt_at,
        created_at
    )
    WHERE status = 'PENDING';

CREATE INDEX idx_sc_media_termination_expired_lease
    ON secure_connect_media_terminations (lease_expires_at)
    WHERE status = 'PROCESSING';
