package com.theholymatrimony.backend.profileview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileViewerResponse {

    private UUID profileId;

    private String fullName;

    private Integer age;

    private String city;

    private String state;

    private String country;

    private String primaryPhotoUrl;

    private LocalDateTime firstViewedAt;

    private LocalDateTime lastViewedAt;

    private Long viewCount;
}
