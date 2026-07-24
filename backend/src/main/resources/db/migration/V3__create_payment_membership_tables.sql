CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,

    plan VARCHAR(30) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    status VARCHAR(30) NOT NULL,

    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature TEXT,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,

    CONSTRAINT fk_payment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_payment_user
ON payments(user_id);

CREATE INDEX idx_payment_order
ON payments(razorpay_order_id);

CREATE TABLE memberships (

    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    plan VARCHAR(30) NOT NULL,

    billing_cycle VARCHAR(20) NOT NULL,

    start_date TIMESTAMP NOT NULL,

    expiry_date TIMESTAMP NOT NULL,

    status VARCHAR(20) NOT NULL,

    payment_id UUID,

    created_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_membership_user
        FOREIGN KEY(user_id)
        REFERENCES users(id),

    CONSTRAINT fk_membership_payment
        FOREIGN KEY(payment_id)
        REFERENCES payments(id)
);

CREATE INDEX idx_membership_user
ON memberships(user_id);