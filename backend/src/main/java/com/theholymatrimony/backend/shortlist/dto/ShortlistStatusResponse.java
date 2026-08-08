package com.theholymatrimony.backend.shortlist.dto;

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
public class ShortlistStatusResponse {

    private UUID profileId;

    private boolean shortlisted;

    private UUID shortlistId;
}