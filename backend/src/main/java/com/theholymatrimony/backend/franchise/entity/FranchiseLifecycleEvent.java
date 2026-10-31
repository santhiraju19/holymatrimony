package com.theholymatrimony.backend.franchise.entity;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.franchise.enums.FranchiseLifecycleEventType;
import com.theholymatrimony.backend.franchise.enums.FranchiseStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "franchise_lifecycle_events")
public class FranchiseLifecycleEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "franchise_id", nullable = false)
    private Franchise franchise;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 40)
    private FranchiseLifecycleEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", nullable = false, length = 40)
    private FranchiseStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 40)
    private FranchiseStatus toStatus;

    @Column(name = "reason", length = 500)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by_user_id", nullable = false)
    private User performedByUser;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    protected FranchiseLifecycleEvent() {
    }

    public FranchiseLifecycleEvent(
            Franchise franchise,
            FranchiseLifecycleEventType eventType,
            FranchiseStatus fromStatus,
            FranchiseStatus toStatus,
            String reason,
            User performedByUser,
            LocalDateTime occurredAt
    ) {
        this.franchise = franchise;
        this.eventType = eventType;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.reason = normalizeOptional(reason);
        this.performedByUser = performedByUser;
        this.occurredAt = occurredAt;
    }

    @PrePersist
    void prePersist() {
        if (occurredAt == null) {
            occurredAt = LocalDateTime.now();
        }
    }

    private static String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    public UUID getId() {
        return id;
    }

    public Franchise getFranchise() {
        return franchise;
    }

    public FranchiseLifecycleEventType getEventType() {
        return eventType;
    }

    public FranchiseStatus getFromStatus() {
        return fromStatus;
    }

    public FranchiseStatus getToStatus() {
        return toStatus;
    }

    public String getReason() {
        return reason;
    }

    public User getPerformedByUser() {
        return performedByUser;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }
}
