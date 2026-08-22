-- ============================================================
-- V27 - Allow SAVED_SEARCH_MATCH notifications
-- ============================================================

ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_notification_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_notification_type_check
    CHECK (
        notification_type IN (
            'NEW_MESSAGE',
            'INTEREST_RECEIVED',
            'INTEREST_ACCEPTED',
            'INTEREST_REJECTED',
            'PROFILE_VIEWED',
            'PROFILE_APPROVED',
            'PROFILE_REJECTED',
            'MEMBERSHIP_ACTIVATED',
            'MEMBERSHIP_EXPIRING',
            'SAVED_SEARCH_MATCH',
            'SYSTEM'
        )
    );
