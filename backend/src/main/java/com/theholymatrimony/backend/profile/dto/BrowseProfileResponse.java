package com.theholymatrimony.backend.profile.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@Data
@Builder
public class BrowseProfileResponse {

    private UUID id;
    private UUID userId;

    /*
     * ============================================================
     * Premium Visibility
     * ============================================================
     */

    private Boolean highlightedProfile;

    private Boolean verifiedPremiumBadge;

    /*
     * Active temporary Profile Boost.
     */
    private Boolean boostedProfile;

    /*
     * ============================================================
     * Compatibility
     * ============================================================
     */

    private Integer compatibilityScore;

    private Integer compatibilityAgeScore;

    private Integer compatibilityDenominationScore;

    private Integer compatibilityEducationScore;

    /*
     * ============================================================
     * Basic
     * ============================================================
     */

    private String fullName;

    private LocalDate dateOfBirth;

    private String gender;

    private Integer age;

    private String maritalStatus;

    /*
     * ============================================================
     * Church
     * ============================================================
     */

    private String denomination;

    private String churchName;

    private Boolean baptized;

    /*
     * ============================================================
     * Education / Career
     * ============================================================
     */

    private String highestEducation;

    private String profession;

    private String company;

    private String annualIncome;

    /*
     * ============================================================
     * Location
     * ============================================================
     */

    private String city;

    private String state;

    private String country;

    /*
     * ============================================================
     * About
     * ============================================================
     */

    private String aboutMe;

    /*
     * ============================================================
     * Completion
     * ============================================================
     */

    private Integer completionPercentage;

    private Boolean profileCompleted;

    /*
     * ============================================================
     * Trust Verification
     * ============================================================
     */

    private Boolean mobileVerified;

    private Boolean churchVerified;

    /*
     * Any approved identity document.
     *
     * Kept for compatibility with existing
     * verification/profile UI.
     */
    private Boolean identityVerified;

    /*
     * Approved Aadhaar document.
     */
    private Boolean aadhaarVerified;

    /*
     * Approved non-Aadhaar government identity document:
     *
     * Passport
     * Driving Licence
     * Voter ID
     */
    private Boolean idVerified;

    /*
     * Existing profile verification compatibility flag.
     */
    private Boolean verifiedProfile;

    /*
     * ============================================================
     * Photo
     * ============================================================
     */

    private UUID primaryPhotoId;

    private String primaryPhotoUrl;
    /*
 * All member-facing profile photos.
 *
 * Primary photo is returned first followed by the
 * remaining photos in member-defined display order.
 */
private List<BrowseProfilePhotoResponse> photos;
}
