CREATE TABLE church_verification_submissions (

    id UUID PRIMARY KEY,

    verification_id UUID NOT NULL,
    user_id UUID NOT NULL,

    verification_method VARCHAR(30) NOT NULL,

    pastor_name VARCHAR(150),
    church_phone VARCHAR(50),
    church_email VARCHAR(255),

    membership_id VARCHAR(150),

    original_file_name VARCHAR(255),
    stored_file_name VARCHAR(255),
    content_type VARCHAR(100),
    file_size BIGINT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_church_submission_verification
        UNIQUE (verification_id),

    CONSTRAINT uk_church_submission_stored_file
        UNIQUE (stored_file_name),

    CONSTRAINT chk_church_submission_method
        CHECK (
            verification_method IN (
                'DOCUMENT',
                'PASTOR_CONTACT',
                'MEMBERSHIP_ID'
            )
        ),

    CONSTRAINT chk_church_submission_file_size
        CHECK (
            file_size IS NULL
            OR file_size > 0
        ),

    CONSTRAINT chk_church_document_fields
        CHECK (
            verification_method <> 'DOCUMENT'
            OR (
                original_file_name IS NOT NULL
                AND stored_file_name IS NOT NULL
                AND content_type IS NOT NULL
                AND file_size IS NOT NULL
            )
        ),

    CONSTRAINT chk_church_contact_fields
        CHECK (
            verification_method <> 'PASTOR_CONTACT'
            OR (
                church_phone IS NOT NULL
                OR church_email IS NOT NULL
            )
        ),

    CONSTRAINT chk_church_membership_fields
        CHECK (
            verification_method <> 'MEMBERSHIP_ID'
            OR membership_id IS NOT NULL
        ),

    CONSTRAINT fk_church_submission_verification
        FOREIGN KEY (verification_id)
        REFERENCES member_verifications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_church_submission_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_church_submission_user
    ON church_verification_submissions(user_id);

CREATE INDEX idx_church_submission_method
    ON church_verification_submissions(verification_method);