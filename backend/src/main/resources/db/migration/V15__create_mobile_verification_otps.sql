CREATE TABLE mobile_verification_otps (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    mobile VARCHAR(20) NOT NULL,

    otp_hash VARCHAR(100) NOT NULL,

    attempts INTEGER NOT NULL DEFAULT 0,

    consumed BOOLEAN NOT NULL DEFAULT FALSE,

    expires_at TIMESTAMP NOT NULL,

    last_sent_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP,

    CONSTRAINT fk_mobile_verification_otp_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_mobile_verification_otp_user
    ON mobile_verification_otps(user_id);

CREATE INDEX idx_mobile_verification_otp_expires
    ON mobile_verification_otps(expires_at);
