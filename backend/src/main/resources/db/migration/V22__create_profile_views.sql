CREATE TABLE profile_views (
    id UUID PRIMARY KEY,

    viewer_user_id UUID NOT NULL,
    viewed_user_id UUID NOT NULL,

    first_viewed_at TIMESTAMP NOT NULL,
    last_viewed_at TIMESTAMP NOT NULL,

    view_count BIGINT NOT NULL DEFAULT 1,

    last_notified_at TIMESTAMP NULL,

    CONSTRAINT fk_profile_views_viewer
        FOREIGN KEY (viewer_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_profile_views_viewed
        FOREIGN KEY (viewed_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_profile_views_viewer_viewed
        UNIQUE (viewer_user_id, viewed_user_id),

    CONSTRAINT chk_profile_views_not_self
        CHECK (viewer_user_id <> viewed_user_id),

    CONSTRAINT chk_profile_views_count_positive
        CHECK (view_count > 0)
);

CREATE INDEX idx_profile_views_viewed_last_viewed
    ON profile_views (
        viewed_user_id,
        last_viewed_at DESC
    );

CREATE INDEX idx_profile_views_viewer_last_viewed
    ON profile_views (
        viewer_user_id,
        last_viewed_at DESC
    );
