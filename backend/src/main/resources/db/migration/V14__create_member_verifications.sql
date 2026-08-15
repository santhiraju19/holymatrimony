CREATE TABLE member_verifications (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    verification_type VARCHAR(30) NOT NULL,

    verification_status VARCHAR(30) NOT NULL
        DEFAULT 'NOT_SUBMITTED',

    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID,

    review_reason VARCHAR(1000),
    member_note VARCHAR(1000),

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_member_verification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT uk_member_verification_user_type
        UNIQUE (user_id, verification_type),

    CONSTRAINT chk_member_verification_type
        CHECK (
            verification_type IN (
                'MOBILE',
                'CHURCH',
                'IDENTITY'
            )
        ),

    CONSTRAINT chk_member_verification_status
        CHECK (
            verification_status IN (
                'NOT_SUBMITTED',
                'PENDING',
                'APPROVED',
                'REJECTED'
            )
        )
);

CREATE INDEX idx_member_verification_user
    ON member_verifications(user_id);

CREATE INDEX idx_member_verification_status
    ON member_verifications(verification_status);

CREATE INDEX idx_member_verification_type_status
    ON member_verifications(
        verification_type,
        verification_status
    );
