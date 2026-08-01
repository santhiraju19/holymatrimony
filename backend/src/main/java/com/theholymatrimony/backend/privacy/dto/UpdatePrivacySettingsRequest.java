package com.theholymatrimony.backend.privacy.dto;

import com.theholymatrimony.backend.privacy.enums.CallPermission;
import com.theholymatrimony.backend.privacy.enums.VisibilityScope;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdatePrivacySettingsRequest {

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

    private Boolean allowPhotoRequests;

    private Boolean allowContactRequests;
}