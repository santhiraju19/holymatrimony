
package com.theholymatrimony.backend.privacy.dto;

import com.theholymatrimony.backend.privacy.enums.CallPermission;
import com.theholymatrimony.backend.privacy.enums.VisibilityScope;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class PrivacySettingsResponse {

    private UUID id;

    private UUID userId;

    private VisibilityScope profileVisibility;

    private VisibilityScope photoVisibility;

    private VisibilityScope phoneVisibility;

    private VisibilityScope emailVisibility;

    private VisibilityScope addressVisibility;

    private VisibilityScope churchVisibility;

    private VisibilityScope familyVisibility;

    private VisibilityScope onlineVisibility;

    private VisibilityScope lastSeenVisibility;

    private CallPermission audioCallPermission;

    private CallPermission videoCallPermission;

    private boolean allowPhotoRequests;

    private boolean allowContactRequests;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}