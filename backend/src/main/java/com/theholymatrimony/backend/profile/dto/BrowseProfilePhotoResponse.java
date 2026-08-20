package com.theholymatrimony.backend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrowseProfilePhotoResponse {

    private UUID id;

    private String imageUrl;

    private Boolean primaryPhoto;

    private Integer displayOrder;
}