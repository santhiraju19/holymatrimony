package com.theholymatrimony.backend.profile.entity;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ===== Basic =====

    @Column(length = 20)
    private String mobile;

    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    private Integer age;

    @Column(length = 30)
    private String maritalStatus;

    // ===== Church =====

    @Column(length = 120)
    private String denomination;

    @Column(length = 150)
    private String churchName;

    @Column(length = 120)
    private String pastorName;

    private Boolean baptized;

    @Column(length = 60)
    private String membershipId;

    @Column(length = 300)
    private String churchAddress;

    // ===== Education =====

    @Column(length = 120)
    private String highestEducation;

    @Column(length = 120)
    private String profession;

    @Column(length = 120)
    private String company;

    @Column(length = 40)
    private String annualIncome;

    // ===== Family =====

    @Column(length = 120)
    private String fatherName;

    @Column(length = 120)
    private String motherName;

    @Column(length = 50)
    private String siblings;

    @Column(length = 120)
    private String familyLocation;

    // ===== Preferences =====

    private Integer preferredAgeFrom;

    private Integer preferredAgeTo;

    @Column(length = 120)
    private String preferredDenomination;

    @Column(length = 120)
    private String preferredEducation;

    // ===== Location =====

    @Column(length = 120)
    private String city;

    @Column(length = 120)
    private String state;

    @Column(length = 120)
    private String country;

    // ===== About =====

    @Column(length = 2000)
    private String aboutMe;

    // ===== Completion =====

    @Builder.Default
    private Integer completionPercentage = 0;

    @Builder.Default
    private Boolean profileCompleted = false;

    // ===== Audit =====

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}