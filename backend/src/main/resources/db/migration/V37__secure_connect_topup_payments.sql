-- ============================================================
-- V37 - Secure Connect Top-Up Payments
-- ============================================================
--
-- Stores Razorpay transactions used to purchase permanent
-- Secure Connect AUDIO or VIDEO wallet minutes.
--
-- Commercial package details are snapshotted at order creation:
--   media_type
--   minutes
--   seconds
--   amount
--
-- The browser never determines the authoritative amount.
--
-- Successful payment fulfilment credits:
--   secure_connect_wallets
--
-- and records:
--   secure_connect_ledger / TOPUP_PURCHASE / TOPUP
--
-- Wallet crediting is performed only after a verified
-- Razorpay payment.captured webhook.
-- ============================================================

CREATE TABLE secure_connect_topup_payments (

    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    media_type VARCHAR(10) NOT NULL,

    minutes INTEGER NOT NULL,

    seconds BIGINT NOT NULL,

    amount INTEGER NOT NULL,

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    razorpay_order_id VARCHAR(100) NOT NULL,

    razorpay_payment_id VARCHAR(100),

    razorpay_signature VARCHAR(255),

    payment_method VARCHAR(50),

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    paid_at TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_secure_connect_topup_payment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT uq_secure_connect_topup_razorpay_order
        UNIQUE (razorpay_order_id),

    CONSTRAINT uq_secure_connect_topup_razorpay_payment
        UNIQUE (razorpay_payment_id),

    CONSTRAINT chk_secure_connect_topup_media_type
        CHECK (media_type IN ('AUDIO', 'VIDEO')),

    CONSTRAINT chk_secure_connect_topup_minutes
        CHECK (minutes > 0),

    CONSTRAINT chk_secure_connect_topup_seconds
        CHECK (seconds > 0),

    CONSTRAINT chk_secure_connect_topup_amount
        CHECK (amount > 0),

    CONSTRAINT chk_secure_connect_topup_status
        CHECK (
            status IN (
                'PENDING',
                'SUCCESS',
                'FAILED'
            )
        )
);


CREATE INDEX idx_secure_connect_topup_user_created
    ON secure_connect_topup_payments(
        user_id,
        created_at DESC
    );


CREATE INDEX idx_secure_connect_topup_status
    ON secure_connect_topup_payments(status);


CREATE INDEX idx_secure_connect_topup_order
    ON secure_connect_topup_payments(
        razorpay_order_id
    );
