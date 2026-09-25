-- Prevent concurrent outgoing calls from spending the same
-- unreserved Secure Connect allowance or top-up balance.
--
-- Existing active duplicates must be resolved before this
-- migration is applied in any environment.

CREATE UNIQUE INDEX uq_secure_connect_one_active_outgoing
ON secure_connect_call_sessions (caller_user_id)
WHERE status IN ('RINGING', 'ACCEPTED');
