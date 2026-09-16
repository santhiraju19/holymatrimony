ALTER TABLE secure_connect_call_sessions
    ADD COLUMN connected_at TIMESTAMP;

CREATE INDEX idx_secure_connect_calls_connected_at
    ON secure_connect_call_sessions (connected_at);
