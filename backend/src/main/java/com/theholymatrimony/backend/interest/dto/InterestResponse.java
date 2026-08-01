
package com.theholymatrimony.backend.interest.dto;

import com.theholymatrimony.backend.interest.enums.InterestStatus;
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
public class InterestResponse {

    private UUID id;

    private InterestUserResponse sender;

    private InterestUserResponse receiver;

    private InterestStatus status;

    private String message;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}