CREATE TABLE identity_verification_documents (
    id UUID PRIMARY KEY,

    verification_id UUID NOT NULL,
    user_id UUID NOT NULL,

    document_type VARCHAR(30) NOT NULL,

    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,

    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_identity_document_verification
        FOREIGN KEY (verification_id)
        REFERENCES member_verifications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_identity_document_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_identity_document_verification
        UNIQUE (verification_id),

    CONSTRAINT uk_identity_document_stored_file
        UNIQUE (stored_file_name),

    CONSTRAINT chk_identity_document_file_size
        CHECK (file_size > 0)
);

CREATE INDEX idx_identity_document_user
    ON identity_verification_documents(user_id);

CREATE INDEX idx_identity_document_type
    ON identity_verification_documents(document_type);
