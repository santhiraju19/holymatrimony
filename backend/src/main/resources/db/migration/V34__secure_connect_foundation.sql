-- ============================================================
-- Holy Matrimony
-- V34 - Secure Connect Foundation
-- ============================================================
--
-- Privacy-first in-app audio/video calling.
--
-- Accounting is stored in SECONDS.
--
-- Purchased top-up balances:
--   - belong permanently to the member
--   - have NO expiry column
--   - survive membership expiry / renewal / plan changes
--   - may only be consumed while an eligible membership is active
--
-- Included plan allowances:
--   - belong to one membership cycle
--   - are separate from purchased top-ups
--
-- ============================================================


-- ============================================================
-- 1. CALL SESSIONS
-- ============================================================

CREATE TABLE secure_connect_call_sessions (
    id UUID PRIMARY KEY,

    caller_user_id UUID NOT NULL,
    callee_user_id UUID NOT NULL,

    media_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,

    provider VARCHAR(30),
    provider_room_id VARCHAR(255),

    initiated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP,
    ended_at TIMESTAMP,

    duration_seconds BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_secure_connect_call_caller
        FOREIGN KEY (caller_user_id)
        REFERENCES users(id),

    CONSTRAINT fk_secure_connect_call_callee
        FOREIGN KEY (callee_user_id)
        REFERENCES users(id),

    CONSTRAINT chk_secure_connect_call_participants
        CHECK (caller_user_id <> callee_user_id),

    CONSTRAINT chk_secure_connect_call_media_type
        CHECK (media_type IN ('AUDIO', 'VIDEO')),

    CONSTRAINT chk_secure_connect_call_status
        CHECK (
            status IN (
                'RINGING',
                'ACCEPTED',
                'DECLINED',
                'MISSED',
                'CANCELLED',
                'ENDED',
                'FAILED'
            )
        ),

    CONSTRAINT chk_secure_connect_call_duration
        CHECK (duration_seconds >= 0),

    CONSTRAINT chk_secure_connect_call_timestamps
        CHECK (
            (answered_at IS NULL OR answered_at >= initiated_at)
            AND
            (ended_at IS NULL OR ended_at >= initiated_at)
            AND
            (
                answered_at IS NULL
                OR ended_at IS NULL
                OR ended_at >= answered_at
            )
        )
);


-- ============================================================
-- 2. PLAN ALLOWANCES
-- ============================================================
--
-- One row per membership cycle and media type.
--
-- allowance_seconds:
--   amount provisioned for the cycle
--
-- consumed_seconds:
--   actual finalized usage charged to that allowance
--
-- Commercial quantities are intentionally NOT hard-coded here.
-- They will be provisioned by application configuration/service.
-- ============================================================

CREATE TABLE secure_connect_plan_allowances (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,
    membership_id UUID NOT NULL,

    media_type VARCHAR(10) NOT NULL,

    allowance_seconds BIGINT NOT NULL,
    consumed_seconds BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_secure_connect_allowance_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_secure_connect_allowance_membership
        FOREIGN KEY (membership_id)
        REFERENCES memberships(id),

    CONSTRAINT uq_secure_connect_allowance_cycle_media
        UNIQUE (membership_id, media_type),

    CONSTRAINT chk_secure_connect_allowance_media_type
        CHECK (media_type IN ('AUDIO', 'VIDEO')),

    CONSTRAINT chk_secure_connect_allowance_nonnegative
        CHECK (
            allowance_seconds >= 0
            AND consumed_seconds >= 0
        ),

    CONSTRAINT chk_secure_connect_allowance_consumption
        CHECK (consumed_seconds <= allowance_seconds)
);


-- ============================================================
-- 3. PERMANENT TOP-UP WALLET
-- ============================================================
--
-- Exactly one balance per user/media type.
--
-- IMPORTANT:
-- There is intentionally NO expiry / expires_at column.
--
-- Wallet ownership is independent of current membership.
-- Authorization to USE the wallet is enforced by the application.
-- ============================================================

CREATE TABLE secure_connect_wallets (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,
    media_type VARCHAR(10) NOT NULL,

    balance_seconds BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_secure_connect_wallet_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT uq_secure_connect_wallet_user_media
        UNIQUE (user_id, media_type),

    CONSTRAINT chk_secure_connect_wallet_media_type
        CHECK (media_type IN ('AUDIO', 'VIDEO')),

    CONSTRAINT chk_secure_connect_wallet_balance
        CHECK (balance_seconds >= 0)
);


-- ============================================================
-- 4. IMMUTABLE USAGE / CREDIT LEDGER
-- ============================================================
--
-- seconds is SIGNED:
--
-- PLAN_CREDIT       positive
-- TOPUP_PURCHASE    positive
-- CALL_USAGE        negative
-- REFUND            positive
-- ADJUSTMENT        positive or negative
--
-- balance_source tells us which commercial bucket was affected.
--
-- PLAN:
--   membership-cycle included allowance
--
-- TOPUP:
--   permanent purchased wallet
--
-- NONE:
--   audit event that does not modify either balance
--
-- PLATINUM unlimited calls can be recorded as CALL_USAGE with
-- balance_source NONE while preserving purchased top-up balances.
-- ============================================================

CREATE TABLE secure_connect_ledger (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,
    call_session_id UUID,
    membership_id UUID,
    payment_id UUID,

    media_type VARCHAR(10) NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    balance_source VARCHAR(10) NOT NULL,

    seconds BIGINT NOT NULL,

    idempotency_key VARCHAR(150),

    note VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_secure_connect_ledger_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_secure_connect_ledger_call
        FOREIGN KEY (call_session_id)
        REFERENCES secure_connect_call_sessions(id),

    CONSTRAINT fk_secure_connect_ledger_membership
        FOREIGN KEY (membership_id)
        REFERENCES memberships(id),

    CONSTRAINT fk_secure_connect_ledger_payment
        FOREIGN KEY (payment_id)
        REFERENCES payments(id),

    CONSTRAINT chk_secure_connect_ledger_media_type
        CHECK (media_type IN ('AUDIO', 'VIDEO')),

    CONSTRAINT chk_secure_connect_ledger_transaction_type
        CHECK (
            transaction_type IN (
                'PLAN_CREDIT',
                'TOPUP_PURCHASE',
                'CALL_USAGE',
                'REFUND',
                'ADJUSTMENT'
            )
        ),

    CONSTRAINT chk_secure_connect_ledger_balance_source
        CHECK (balance_source IN ('PLAN', 'TOPUP', 'NONE')),

    CONSTRAINT chk_secure_connect_ledger_nonzero
        CHECK (seconds <> 0),

    CONSTRAINT chk_secure_connect_ledger_sign
        CHECK (
            (transaction_type IN ('PLAN_CREDIT', 'TOPUP_PURCHASE', 'REFUND')
                AND seconds > 0)
            OR
            (transaction_type = 'CALL_USAGE'
                AND seconds < 0)
            OR
            transaction_type = 'ADJUSTMENT'
        )
);


-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX idx_secure_connect_calls_caller_created
    ON secure_connect_call_sessions(
        caller_user_id,
        created_at DESC
    );

CREATE INDEX idx_secure_connect_calls_callee_created
    ON secure_connect_call_sessions(
        callee_user_id,
        created_at DESC
    );

CREATE INDEX idx_secure_connect_calls_status
    ON secure_connect_call_sessions(status);

CREATE INDEX idx_secure_connect_calls_provider_room
    ON secure_connect_call_sessions(provider_room_id)
    WHERE provider_room_id IS NOT NULL;


CREATE INDEX idx_secure_connect_allowances_user
    ON secure_connect_plan_allowances(user_id);

CREATE INDEX idx_secure_connect_allowances_membership
    ON secure_connect_plan_allowances(membership_id);


CREATE INDEX idx_secure_connect_wallets_user
    ON secure_connect_wallets(user_id);


CREATE INDEX idx_secure_connect_ledger_user_created
    ON secure_connect_ledger(
        user_id,
        created_at DESC
    );

CREATE INDEX idx_secure_connect_ledger_call
    ON secure_connect_ledger(call_session_id)
    WHERE call_session_id IS NOT NULL;

CREATE INDEX idx_secure_connect_ledger_membership
    ON secure_connect_ledger(membership_id)
    WHERE membership_id IS NOT NULL;

CREATE INDEX idx_secure_connect_ledger_payment
    ON secure_connect_ledger(payment_id)
    WHERE payment_id IS NOT NULL;

CREATE UNIQUE INDEX ux_secure_connect_ledger_idempotency
    ON secure_connect_ledger(idempotency_key)
    WHERE idempotency_key IS NOT NULL;
