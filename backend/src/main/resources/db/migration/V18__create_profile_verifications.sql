CREATE TABLE profile_verifications (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    email_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    email_verified_at TIMESTAMPTZ,

    mobile_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',
    mobile_verified_at TIMESTAMPTZ,

    church_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',

    church_name VARCHAR(255),
    denomination VARCHAR(150),
    pastor_name VARCHAR(255),
    pastor_contact VARCHAR(100),
    membership_id VARCHAR(150),
    church_address VARCHAR(500),
    church_proof_key VARCHAR(500),

    church_submitted_at TIMESTAMPTZ,
    church_verified_at TIMESTAMPTZ,

    overall_status VARCHAR(20) NOT NULL DEFAULT 'UNVERIFIED',

    rejection_reason VARCHAR(1000),

    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uk_profile_verifications_user_id
        UNIQUE (user_id),

    CONSTRAINT fk_profile_verifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_profile_verifications_email_status
        CHECK (
            email_status IN (
                'UNVERIFIED',
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        ),

    CONSTRAINT chk_profile_verifications_mobile_status
        CHECK (
            mobile_status IN (
                'UNVERIFIED',
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        ),

    CONSTRAINT chk_profile_verifications_church_status
        CHECK (
            church_status IN (
                'UNVERIFIED',
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        ),

    CONSTRAINT chk_profile_verifications_overall_status
        CHECK (
            overall_status IN (
                'UNVERIFIED',
                'PENDING',
                'VERIFIED',
                'REJECTED'
            )
        )
);

CREATE INDEX idx_profile_verifications_overall_status
    ON profile_verifications(overall_status);

CREATE INDEX idx_profile_verifications_church_status
    ON profile_verifications(church_status);
