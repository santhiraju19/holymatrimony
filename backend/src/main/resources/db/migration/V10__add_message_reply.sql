ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS reply_to_message_id UUID;

ALTER TABLE chat_messages
    ADD CONSTRAINT fk_chat_message_reply
    FOREIGN KEY (reply_to_message_id)
    REFERENCES chat_messages(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_chat_message_reply
    ON chat_messages(reply_to_message_id);

