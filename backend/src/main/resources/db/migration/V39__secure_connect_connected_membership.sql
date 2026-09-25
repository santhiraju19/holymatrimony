-- Preserve the original membership used when media connects.
-- Nullable for historical calls and calls that never connect.

ALTER TABLE secure_connect_call_sessions
ADD COLUMN connected_membership_id UUID;

ALTER TABLE secure_connect_call_sessions
ADD CONSTRAINT fk_secure_connect_call_connected_membership
FOREIGN KEY (connected_membership_id)
REFERENCES memberships(id);

CREATE INDEX idx_secure_connect_call_connected_membership
ON secure_connect_call_sessions (connected_membership_id);
