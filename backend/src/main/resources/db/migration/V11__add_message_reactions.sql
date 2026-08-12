CREATE TABLE IF NOT EXISTS chat_message_reactions (
    id UUID PRIMARY KEY,

    message_id UUID NOT NULL,
    user_id UUID NOT NULL,

    reaction VARCHAR(20) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_chat_message_reaction_message
        FOREIGN KEY (message_id)
        REFERENCES chat_messages(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chat_message_reaction_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_chat_message_reaction_user
        UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_message_reaction_message
    ON chat_message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_chat_message_reaction_user
    ON chat_message_reactions(user_id);
