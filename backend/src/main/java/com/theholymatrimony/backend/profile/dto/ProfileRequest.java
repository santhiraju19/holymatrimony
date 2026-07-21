package com.theholymatrimony.backend.profile.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProfileRequest {

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
    private String aboutMe;
}