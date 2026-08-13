
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY,

    blocker_id UUID NOT NULL,
    blocked_user_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_block_blocker
        FOREIGN KEY (blocker_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_block_blocked_user
        FOREIGN KEY (blocked_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_block_pair
        UNIQUE (blocker_id, blocked_user_id),

    CONSTRAINT chk_user_block_not_self
        CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_block_blocker
    ON user_blocks(blocker_id);

CREATE INDEX IF NOT EXISTS idx_user_block_blocked_user
    ON user_blocks(blocked_user_id);


CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY,

    reporter_id UUID NOT NULL,
    reported_user_id UUID NOT NULL,

    conversation_id UUID,

    reason VARCHAR(50) NOT NULL,
    details VARCHAR(1000),

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID,

    CONSTRAINT fk_user_report_reporter
        FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_report_reported_user
        FOREIGN KEY (reported_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_report_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_user_report_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_user_report_not_self
        CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_report_reporter
    ON user_reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_user_report_reported_user
    ON user_reports(reported_user_id);

CREATE INDEX IF NOT EXISTS idx_user_report_status
    ON user_reports(status);

CREATE INDEX IF NOT EXISTS idx_user_report_created_at
    ON user_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_user_report_conversation
    ON user_reports(conversation_id);