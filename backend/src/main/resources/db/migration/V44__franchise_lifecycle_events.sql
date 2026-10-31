/*
 * ============================================================
 * V44 - Franchise Lifecycle Events
 * ============================================================
 *
 * Immutable audit history for HQ-controlled franchise lifecycle
 * operations.
 *
 * The franchise row stores the current lifecycle state and its
 * operational timestamps. This table stores the historical event
 * that caused a lifecycle transition, including the HQ actor and
 * optional reason.
 *
 * Franchise closure is intentionally represented as a lifecycle
 * event rather than deleting franchise, allocation, territory,
 * membership, or permission history.
 */

CREATE TABLE franchise_lifecycle_events (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    franchise_id UUID NOT NULL,

    event_type VARCHAR(40) NOT NULL,

    from_status VARCHAR(40) NOT NULL,

    to_status VARCHAR(40) NOT NULL,

    reason VARCHAR(500),

    performed_by_user_id UUID NOT NULL,

    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_franchise_lifecycle_event_franchise
        FOREIGN KEY (franchise_id)
        REFERENCES franchises(id),

    CONSTRAINT fk_franchise_lifecycle_event_actor
        FOREIGN KEY (performed_by_user_id)
        REFERENCES users(id),

    CONSTRAINT chk_franchise_lifecycle_event_type
        CHECK (
            event_type IN (
                'FRANCHISE_TERMINATED'
            )
        ),

    CONSTRAINT chk_franchise_lifecycle_from_status
        CHECK (
            from_status IN (
                'APPLICATION',
                'UNDER_REVIEW',
                'APPROVED',
                'AGREEMENT_PENDING',
                'ONBOARDING',
                'ACTIVE',
                'SUSPENDED',
                'EXPIRED',
                'TERMINATED',
                'REJECTED'
            )
        ),

    CONSTRAINT chk_franchise_lifecycle_to_status
        CHECK (
            to_status IN (
                'APPLICATION',
                'UNDER_REVIEW',
                'APPROVED',
                'AGREEMENT_PENDING',
                'ONBOARDING',
                'ACTIVE',
                'SUSPENDED',
                'EXPIRED',
                'TERMINATED',
                'REJECTED'
            )
        ),

    /*
     * V44 introduces the dedicated franchise-termination event.
     * Future lifecycle event types can extend this invariant in a
     * later migration without modifying V44.
     */
    CONSTRAINT chk_franchise_termination_event_transition
        CHECK (
            event_type <> 'FRANCHISE_TERMINATED'
            OR (
                from_status IN ('ACTIVE', 'SUSPENDED')
                AND to_status = 'TERMINATED'
            )
        )
);

CREATE INDEX idx_franchise_lifecycle_events_franchise
    ON franchise_lifecycle_events(franchise_id);

CREATE INDEX idx_franchise_lifecycle_events_actor
    ON franchise_lifecycle_events(performed_by_user_id);

CREATE INDEX idx_franchise_lifecycle_events_occurred_at
    ON franchise_lifecycle_events(occurred_at);
