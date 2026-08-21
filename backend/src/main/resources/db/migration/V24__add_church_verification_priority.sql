ALTER TABLE church_verification_submissions
    ADD COLUMN priority_verification BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_church_submission_priority
    ON church_verification_submissions (priority_verification);
