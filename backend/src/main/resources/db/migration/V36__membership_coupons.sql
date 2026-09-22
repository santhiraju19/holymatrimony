-- ============================================================
-- V36
-- Membership coupon management and redemption tracking
-- ============================================================

CREATE TABLE membership_coupons (
    id UUID PRIMARY KEY,

    code VARCHAR(50) NOT NULL,

    discount_percent INTEGER NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    valid_from TIMESTAMP NULL,

    valid_until TIMESTAMP NULL,

    max_redemptions INTEGER NULL,

    redemption_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_membership_coupons_code
        UNIQUE (code),

    CONSTRAINT chk_membership_coupon_discount
        CHECK (
            discount_percent >= 1
            AND discount_percent <= 100
        ),

    CONSTRAINT chk_membership_coupon_max_redemptions
        CHECK (
            max_redemptions IS NULL
            OR max_redemptions > 0
        ),

    CONSTRAINT chk_membership_coupon_redemption_count
        CHECK (
            redemption_count >= 0
        ),

    CONSTRAINT chk_membership_coupon_validity
        CHECK (
            valid_from IS NULL
            OR valid_until IS NULL
            OR valid_until > valid_from
        )
);

CREATE INDEX idx_membership_coupons_active
    ON membership_coupons (active);

-- Preserve the exact coupon calculation used when an order is created.
-- This is especially important for Razorpay transactions because the
-- coupon configuration could be changed before the capture webhook arrives.
ALTER TABLE payments
    ADD COLUMN original_amount INTEGER NULL,
    ADD COLUMN discount_amount INTEGER NULL,
    ADD COLUMN discount_percent INTEGER NULL;

ALTER TABLE payments
    ADD CONSTRAINT chk_payments_coupon_amounts
        CHECK (
            original_amount IS NULL
            OR (
                original_amount >= 0
                AND discount_amount IS NOT NULL
                AND discount_amount >= 0
                AND discount_amount <= original_amount
                AND discount_percent IS NOT NULL
                AND discount_percent >= 1
                AND discount_percent <= 100
                AND amount = original_amount - discount_amount
            )
        );


CREATE TABLE membership_coupon_redemptions (
    id UUID PRIMARY KEY,

    coupon_id UUID NOT NULL,

    user_id UUID NOT NULL,

    payment_id UUID NOT NULL,

    coupon_code VARCHAR(50) NOT NULL,

    discount_percent INTEGER NOT NULL,

    original_amount INTEGER NOT NULL,

    discount_amount INTEGER NOT NULL,

    final_amount INTEGER NOT NULL,

    redeemed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_coupon_redemption_coupon
        FOREIGN KEY (coupon_id)
        REFERENCES membership_coupons(id),

    CONSTRAINT fk_coupon_redemption_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_coupon_redemption_payment
        FOREIGN KEY (payment_id)
        REFERENCES payments(id),

    CONSTRAINT uk_coupon_redemption_payment
        UNIQUE (payment_id),

    CONSTRAINT chk_coupon_redemption_discount
        CHECK (
            discount_percent >= 1
            AND discount_percent <= 100
        ),

    CONSTRAINT chk_coupon_redemption_amounts
        CHECK (
            original_amount >= 0
            AND discount_amount >= 0
            AND final_amount >= 0
            AND discount_amount <= original_amount
            AND final_amount =
                original_amount - discount_amount
        )
);

CREATE INDEX idx_coupon_redemptions_coupon
    ON membership_coupon_redemptions (coupon_id);

CREATE INDEX idx_coupon_redemptions_user
    ON membership_coupon_redemptions (user_id);

CREATE INDEX idx_coupon_redemptions_code
    ON membership_coupon_redemptions (coupon_code);

-- ============================================================
-- Initial Holy Matrimony promotional coupons
-- ============================================================

INSERT INTO membership_coupons (
    id,
    code,
    discount_percent,
    active,
    redemption_count,
    created_at,
    updated_at
)
VALUES
(
    gen_random_uuid(),
    'HM100',
    100,
    TRUE,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    gen_random_uuid(),
    'HM50',
    50,
    TRUE,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    gen_random_uuid(),
    'HM30',
    30,
    TRUE,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

COMMENT ON TABLE membership_coupons IS
    'Membership promotional coupons administered by Holy Matrimony';

COMMENT ON TABLE membership_coupon_redemptions IS
    'Audit trail of membership coupon usage';

COMMENT ON COLUMN membership_coupons.discount_percent IS
    'Percentage discount from 1 through 100';

COMMENT ON COLUMN membership_coupon_redemptions.original_amount IS
    'Original membership checkout amount in paise';

COMMENT ON COLUMN membership_coupon_redemptions.discount_amount IS
    'Coupon discount amount in paise';

COMMENT ON COLUMN membership_coupon_redemptions.final_amount IS
    'Final amount charged after coupon discount in paise';
