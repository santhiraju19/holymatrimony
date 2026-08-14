ALTER TABLE conversations
    ADD COLUMN participant_one_deleted_at TIMESTAMP NULL,
    ADD COLUMN participant_two_deleted_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_participant_one_deleted
    ON conversations (
        participant_one_id,
        participant_one_deleted_at
    );

CREATE INDEX IF NOT EXISTS idx_conversation_participant_two_deleted
    ON conversations (
        participant_two_id,
        participant_two_deleted_at
    );
