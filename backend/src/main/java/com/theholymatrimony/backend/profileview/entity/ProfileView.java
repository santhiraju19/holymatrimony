package com.theholymatrimony.backend.profileview.entity;

import com.theholymatrimony.backend.auth.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "profile_views",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_profile_views_viewer_viewed",
                        columnNames = {
                                "viewer_user_id",
                                "viewed_user_id"
                        }
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileView {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "viewer_user_id",
            nullable = false
    )
    private User viewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "viewed_user_id",
            nullable = false
    )
    private User viewed;

    @Column(
            name = "first_viewed_at",
            nullable = false
    )
    private LocalDateTime firstViewedAt;

    @Column(
            name = "last_viewed_at",
            nullable = false
    )
    private LocalDateTime lastViewedAt;

    @Builder.Default
    @Column(
            name = "view_count",
            nullable = false
    )
    private Long viewCount = 1L;

    @Column(name = "last_notified_at")
    private LocalDateTime lastNotifiedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (firstViewedAt == null) {
            firstViewedAt = now;
        }

        if (lastViewedAt == null) {
            lastViewedAt = now;
        }

        if (
                viewCount == null
                        || viewCount < 1
        ) {
            viewCount = 1L;
        }
    }

    public void recordView(
            LocalDateTime viewedAt
    ) {

        LocalDateTime effectiveViewedAt =
                viewedAt == null
                        ? LocalDateTime.now()
                        : viewedAt;

        lastViewedAt =
                effectiveViewedAt;

        viewCount =
                viewCount == null
                        ? 1L
                        : viewCount + 1L;
    }

    public void markNotified(
            LocalDateTime notifiedAt
    ) {

        lastNotifiedAt =
                notifiedAt == null
                        ? LocalDateTime.now()
                        : notifiedAt;
    }
}
