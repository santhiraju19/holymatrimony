-- ============================================================
-- V26 - Saved Searches
-- ============================================================

CREATE TABLE saved_searches (

    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    name VARCHAR(100) NOT NULL,

    -- ========================================================
    -- Match Basics
    -- ========================================================

    age_from INTEGER,
    age_to INTEGER,

    height_from INTEGER,
    height_to INTEGER,

    gender VARCHAR(30),
    marital_status VARCHAR(50),

    -- ========================================================
    -- Faith & Background
    -- ========================================================

    religion VARCHAR(80),
    denomination VARCHAR(100),
    community VARCHAR(120),
    mother_tongue VARCHAR(80),

    baptized BOOLEAN,

    -- ========================================================
    -- Education & Career
    -- ========================================================

    highest_education VARCHAR(150),
    profession VARCHAR(150),

    -- ========================================================
    -- Location
    -- ========================================================

    country VARCHAR(120),
    state VARCHAR(120),
    city VARCHAR(120),

    -- ========================================================
    -- Lifestyle
    -- ========================================================

    diet VARCHAR(50),
    smoking VARCHAR(30),
    drinking VARCHAR(30),

    -- ========================================================
    -- Trust Verification
    -- ========================================================

    aadhaar_verified BOOLEAN,
    id_verified BOOLEAN,
    church_verified BOOLEAN,

    -- ========================================================
    -- Ordering
    -- ========================================================

    sort VARCHAR(30),

    -- ========================================================
    -- Search settings
    -- ========================================================

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    alerts_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    alert_frequency VARCHAR(20) NOT NULL DEFAULT 'DAILY',

    last_alerted_at TIMESTAMP WITH TIME ZONE,

    -- ========================================================
    -- Audit
    -- ========================================================

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_saved_search_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_saved_search_user
    ON saved_searches(user_id);

CREATE INDEX idx_saved_search_alerts
    ON saved_searches(alerts_enabled, last_alerted_at);

CREATE INDEX idx_saved_search_created
    ON saved_searches(created_at DESC);

-- Only one default saved search per member.
CREATE UNIQUE INDEX uq_saved_search_default_per_user
    ON saved_searches(user_id)
    WHERE is_default = TRUE;