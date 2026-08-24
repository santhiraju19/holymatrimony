package com.theholymatrimony.backend.profile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "profile_preferred_locations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferredLocation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "profile_id",
            nullable = false
    )
    private Profile profile;

    @Column(
            name = "sort_order",
            nullable = false
    )
    private Integer sortOrder;

    @Column(length = 120)
    private String country;

    @Column(length = 120)
    private String state;

    @Column(length = 120)
    private String district;

    @Column(length = 120)
    private String city;
}
