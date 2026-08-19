-- ============================================================
-- V21
-- Allow coupon and other non-Razorpay payment transactions
-- ============================================================

ALTER TABLE payments
    ALTER COLUMN razorpay_order_id DROP NOT NULL;

ALTER TABLE payments
    ALTER COLUMN razorpay_payment_id DROP NOT NULL;

ALTER TABLE payments
    ALTER COLUMN razorpay_signature DROP NOT NULL;

COMMENT ON COLUMN payments.razorpay_order_id IS
    'Razorpay order ID. Null for non-Razorpay transactions such as coupons.';

COMMENT ON COLUMN payments.razorpay_payment_id IS
    'Razorpay payment ID. Null for non-Razorpay transactions such as coupons.';

COMMENT ON COLUMN payments.razorpay_signature IS
    'Razorpay checkout signature. Null for non-Razorpay transactions such as coupons.';
