package com.theholymatrimony.backend.profile.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {

    private UUID id;

    private String fileName;

    private String imageUrl;

    private String contentType;

    private Long fileSize;

    private Boolean primaryPhoto;

    private Integer displayOrder;

    private LocalDateTime createdAt;
}
