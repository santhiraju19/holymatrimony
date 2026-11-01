package com.theholymatrimony.backend.franchise.entity;

import com.theholymatrimony.backend.franchise.enums.LeadSource;
import com.theholymatrimony.backend.franchise.enums.LeadStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "franchise_leads")
public class FranchiseLead {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "district_allocation_id",
            nullable = false
    )
    private FranchiseDistrictAllocation districtAllocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "territory_id")
    private FranchiseTerritory territory;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 30)
    private String mobile;

    @Column(length = 180)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LeadSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LeadStatus status = LeadStatus.NEW;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public FranchiseLead() {
    }

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        if (id == null) {
            id = UUID.randomUUID();
        }

        if (status == null) {
            status = LeadStatus.NEW;
        }

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public FranchiseDistrictAllocation getDistrictAllocation() {
        return districtAllocation;
    }

    public void setDistrictAllocation(
            FranchiseDistrictAllocation districtAllocation
    ) {
        this.districtAllocation = districtAllocation;
    }

    public FranchiseTerritory getTerritory() {
        return territory;
    }

    public void setTerritory(
            FranchiseTerritory territory
    ) {
        this.territory = territory;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(
            String fullName
    ) {
        this.fullName = fullName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(
            String mobile
    ) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }

    public LeadSource getSource() {
        return source;
    }

    public void setSource(
            LeadSource source
    ) {
        this.source = source;
    }

    public LeadStatus getStatus() {
        return status;
    }

    public void setStatus(
            LeadStatus status
    ) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
