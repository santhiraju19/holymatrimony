package com.theholymatrimony.backend.profile.entity;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ===== Basic =====

    private String mobile;

    private LocalDate dateOfBirth;

    private String gender;

    private Integer age;

    private String maritalStatus;

    // ===== Church =====

    private String denomination;

    private String churchName;

    private String pastorName;

    private String baptized;

    private String membershipId;

    private String churchAddress;

    // ===== Education =====

    private String highestEducation;

    private String profession;

    private String company;

    private String annualIncome;

    // ===== Family =====

    private String fatherName;

    private String motherName;

    private String siblings;

    private String familyLocation;

    // ===== Preferences =====

    private Integer preferredAgeFrom;

    private Integer preferredAgeTo;

    private String preferredDenomination;

    private String preferredEducation;

    // ===== Location =====

    private String city;

    private String state;

    private String country;

    // ===== About =====

    @Column(length = 3000)
    private String aboutMe;

    // ===== Profile =====

    @Builder.Default
    private Integer completionPercentage = 0;

    // ===== Audit =====

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}