package com.theholymatrimony.backend.profile.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "saved_searches",
        indexes = {
                @Index(
                        name = "idx_saved_search_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_saved_search_alerts",
                        columnList = "alerts_enabled, last_alerted_at"
                ),
                @Index(
                        name = "idx_saved_search_created",
                        columnList = "created_at"
                )
        }
)
public class SavedSearch {

    @Id
    private UUID id;

    @Column(
            name = "user_id",
            nullable = false
    )
    private UUID userId;

    @Column(
            name = "name",
            nullable = false,
            length = 100
    )
    private String name;

    // =========================================================
    // Match Basics
    // =========================================================

    @Column(name = "age_from")
    private Integer ageFrom;

    @Column(name = "age_to")
    private Integer ageTo;

    @Column(name = "height_from")
    private Integer heightFrom;

    @Column(name = "height_to")
    private Integer heightTo;

    @Column(
            name = "gender",
            length = 30
    )
    private String gender;

    @Column(
            name = "marital_status",
            length = 50
    )
    private String maritalStatus;

    // =========================================================
    // Faith & Background
    // =========================================================

    @Column(
            name = "religion",
            length = 80
    )
    private String religion;

    @Column(
            name = "denomination",
            length = 100
    )
    private String denomination;

    @Column(
            name = "community",
            length = 120
    )
    private String community;

    @Column(
            name = "mother_tongue",
            length = 80
    )
    private String motherTongue;

    @Column(name = "baptized")
    private Boolean baptized;

    // =========================================================
    // Education & Career
    // =========================================================

    @Column(
            name = "highest_education",
            length = 150
    )
    private String highestEducation;

    @Column(
            name = "profession",
            length = 150
    )
    private String profession;

    // =========================================================
    // Location
    // =========================================================

    @Column(
            name = "country",
            length = 120
    )
    private String country;

    @Column(
            name = "state",
            length = 120
    )
    private String state;

    @Column(
            name = "city",
            length = 120
    )
    private String city;

    // =========================================================
    // Lifestyle
    // =========================================================

    @Column(
            name = "diet",
            length = 50
    )
    private String diet;

    @Column(
            name = "smoking",
            length = 30
    )
    private String smoking;

    @Column(
            name = "drinking",
            length = 30
    )
    private String drinking;

    // =========================================================
    // Trust Verification
    // =========================================================

    @Column(name = "aadhaar_verified")
    private Boolean aadhaarVerified;

    @Column(name = "id_verified")
    private Boolean idVerified;

    @Column(name = "church_verified")
    private Boolean churchVerified;

    // =========================================================
    // Ordering
    // =========================================================

    @Column(
            name = "sort",
            length = 30
    )
    private String sort;

    // =========================================================
    // Saved Search Settings
    // =========================================================

    @Column(
            name = "is_default",
            nullable = false
    )
    private boolean defaultSearch = false;

    @Column(
            name = "alerts_enabled",
            nullable = false
    )
    private boolean alertsEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "alert_frequency",
            nullable = false,
            length = 20
    )
    private SavedSearchAlertFrequency alertFrequency =
            SavedSearchAlertFrequency.DAILY;

    @Column(name = "last_alerted_at")
    private Instant lastAlertedAt;

    // =========================================================
    // Audit
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    public SavedSearch() {
    }

    @PrePersist
    public void onCreate() {

        Instant now = Instant.now();

        if (id == null) {
            id = UUID.randomUUID();
        }

        createdAt = now;
        updatedAt = now;

        normalize();
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt = Instant.now();

        normalize();
    }

    private void normalize() {

        if (name != null) {
            name = name.trim();
        }

        gender = normalizeOptional(gender);
        maritalStatus = normalizeOptional(maritalStatus);

        religion = normalizeOptional(religion);
        denomination = normalizeOptional(denomination);
        community = normalizeOptional(community);
        motherTongue = normalizeOptional(motherTongue);

        highestEducation =
                normalizeOptional(highestEducation);

        profession =
                normalizeOptional(profession);

        country = normalizeOptional(country);
        state = normalizeOptional(state);
        city = normalizeOptional(city);

        diet = normalizeOptional(diet);
        smoking = normalizeOptional(smoking);
        drinking = normalizeOptional(drinking);

        sort = normalizeOptional(sort);

        if (alertFrequency == null) {
            alertFrequency =
                    SavedSearchAlertFrequency.DAILY;
        }
    }

    private String normalizeOptional(
            String value
    ) {

        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAgeFrom() {
        return ageFrom;
    }

    public void setAgeFrom(Integer ageFrom) {
        this.ageFrom = ageFrom;
    }

    public Integer getAgeTo() {
        return ageTo;
    }

    public void setAgeTo(Integer ageTo) {
        this.ageTo = ageTo;
    }

    public Integer getHeightFrom() {
        return heightFrom;
    }

    public void setHeightFrom(Integer heightFrom) {
        this.heightFrom = heightFrom;
    }

    public Integer getHeightTo() {
        return heightTo;
    }

    public void setHeightTo(Integer heightTo) {
        this.heightTo = heightTo;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(
            String maritalStatus
    ) {
        this.maritalStatus = maritalStatus;
    }

    public String getReligion() {
        return religion;
    }

    public void setReligion(String religion) {
        this.religion = religion;
    }

    public String getDenomination() {
        return denomination;
    }

    public void setDenomination(
            String denomination
    ) {
        this.denomination = denomination;
    }

    public String getCommunity() {
        return community;
    }

    public void setCommunity(String community) {
        this.community = community;
    }

    public String getMotherTongue() {
        return motherTongue;
    }

    public void setMotherTongue(
            String motherTongue
    ) {
        this.motherTongue = motherTongue;
    }

    public Boolean getBaptized() {
        return baptized;
    }

    public void setBaptized(Boolean baptized) {
        this.baptized = baptized;
    }

    public String getHighestEducation() {
        return highestEducation;
    }

    public void setHighestEducation(
            String highestEducation
    ) {
        this.highestEducation =
                highestEducation;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(
            String profession
    ) {
        this.profession = profession;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDiet() {
        return diet;
    }

    public void setDiet(String diet) {
        this.diet = diet;
    }

    public String getSmoking() {
        return smoking;
    }

    public void setSmoking(String smoking) {
        this.smoking = smoking;
    }

    public String getDrinking() {
        return drinking;
    }

    public void setDrinking(String drinking) {
        this.drinking = drinking;
    }

    public Boolean getAadhaarVerified() {
        return aadhaarVerified;
    }

    public void setAadhaarVerified(
            Boolean aadhaarVerified
    ) {
        this.aadhaarVerified =
                aadhaarVerified;
    }

    public Boolean getIdVerified() {
        return idVerified;
    }

    public void setIdVerified(
            Boolean idVerified
    ) {
        this.idVerified = idVerified;
    }

    public Boolean getChurchVerified() {
        return churchVerified;
    }

    public void setChurchVerified(
            Boolean churchVerified
    ) {
        this.churchVerified =
                churchVerified;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public boolean isDefaultSearch() {
        return defaultSearch;
    }

    public void setDefaultSearch(
            boolean defaultSearch
    ) {
        this.defaultSearch =
                defaultSearch;
    }

    public boolean isAlertsEnabled() {
        return alertsEnabled;
    }

    public void setAlertsEnabled(
            boolean alertsEnabled
    ) {
        this.alertsEnabled =
                alertsEnabled;
    }

    public SavedSearchAlertFrequency
    getAlertFrequency() {
        return alertFrequency;
    }

    public void setAlertFrequency(
            SavedSearchAlertFrequency alertFrequency
    ) {
        this.alertFrequency =
                alertFrequency;
    }

    public Instant getLastAlertedAt() {
        return lastAlertedAt;
    }

    public void setLastAlertedAt(
            Instant lastAlertedAt
    ) {
        this.lastAlertedAt =
                lastAlertedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            Instant createdAt
    ) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            Instant updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}