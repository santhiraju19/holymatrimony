-- ============================================================
-- V20
-- Payment source, gateway method and coupon tracking
-- ============================================================

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_source VARCHAR(30);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100);

-- ============================================================
-- Backfill existing payment transactions
-- ============================================================
--
-- Existing rows were created through Razorpay before
-- payment_source was introduced.
--

UPDATE payments
SET payment_source = 'RAZORPAY'
WHERE payment_source IS NULL;

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON COLUMN payments.payment_source IS
    'Payment origin such as RAZORPAY or COUPON';

COMMENT ON COLUMN payments.payment_method IS
    'Actual gateway method such as UPI, CARD, NETBANKING or WALLET';

COMMENT ON COLUMN payments.coupon_code IS
    'Coupon code used for zero-cost membership activation';
