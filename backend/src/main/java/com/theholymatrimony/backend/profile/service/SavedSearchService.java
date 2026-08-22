package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.profile.dto.CreateSavedSearchRequest;
import com.theholymatrimony.backend.profile.dto.SavedSearchResponse;
import com.theholymatrimony.backend.profile.dto.SearchProfileRequest;
import com.theholymatrimony.backend.profile.dto.UpdateSavedSearchAlertsRequest;
import com.theholymatrimony.backend.profile.dto.UpdateSavedSearchRequest;
import com.theholymatrimony.backend.profile.entity.SavedSearch;
import com.theholymatrimony.backend.profile.entity.SavedSearchAlertFrequency;
import com.theholymatrimony.backend.profile.repository.SavedSearchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavedSearchService {

    private static final int MAX_SAVED_SEARCHES_PER_USER = 20;

    private final SavedSearchRepository
            savedSearchRepository;

    private final UserRepository
            userRepository;

    // =========================================================
    // CREATE
    // =========================================================

    @Transactional
    public SavedSearchResponse create(
            String email,
            CreateSavedSearchRequest request
    ) {

        User user =
                getUserByEmail(email);

        long existingCount =
                savedSearchRepository
                        .countByUserId(
                                user.getId()
                        );

        if (
                existingCount >=
                MAX_SAVED_SEARCHES_PER_USER
        ) {
            throw new IllegalStateException(
                    "You can save up to " +
                    MAX_SAVED_SEARCHES_PER_USER +
                    " searches."
            );
        }

        SavedSearch savedSearch =
                new SavedSearch();

        savedSearch.setUserId(
                user.getId()
        );

        applyCreateRequest(
                savedSearch,
                request
        );

        boolean makeDefault =
                Boolean.TRUE.equals(
                        request.getDefaultSearch()
                );

        if (makeDefault) {
            clearExistingDefault(
                    user.getId()
            );
        }

        savedSearch.setDefaultSearch(
                makeDefault
        );

        savedSearch.setAlertsEnabled(
                Boolean.TRUE.equals(
                        request.getAlertsEnabled()
                )
        );

        savedSearch.setAlertFrequency(
                request.getAlertFrequency() == null
                        ? SavedSearchAlertFrequency.DAILY
                        : request.getAlertFrequency()
        );

        SavedSearch saved =
                savedSearchRepository.save(
                        savedSearch
                );

        return map(
                saved
        );
    }

    // =========================================================
    // LIST
    // =========================================================

    @Transactional
    public List<SavedSearchResponse> list(
            String email
    ) {

        User user =
                getUserByEmail(email);

        return savedSearchRepository
                .findAllByUserIdOrderByCreatedAtDesc(
                        user.getId()
                )
                .stream()
                .map(this::map)
                .toList();
    }

    // =========================================================
    // GET
    // =========================================================

    @Transactional
    public SavedSearchResponse get(
            String email,
            UUID savedSearchId
    ) {

        User user =
                getUserByEmail(email);

        SavedSearch savedSearch =
                getOwnedSearch(
                        user.getId(),
                        savedSearchId
                );

        return map(
                savedSearch
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Transactional
    public SavedSearchResponse update(
            String email,
            UUID savedSearchId,
            UpdateSavedSearchRequest request
    ) {

        User user =
                getUserByEmail(email);

        SavedSearch savedSearch =
                getOwnedSearch(
                        user.getId(),
                        savedSearchId
                );

        boolean makeDefault =
                Boolean.TRUE.equals(
                        request.getDefaultSearch()
                );

        if (
                makeDefault &&
                !savedSearch.isDefaultSearch()
        ) {
            clearExistingDefault(
                    user.getId()
            );
        }

        applyUpdateRequest(
                savedSearch,
                request
        );

        savedSearch.setDefaultSearch(
                makeDefault
        );

        savedSearch.setAlertsEnabled(
                Boolean.TRUE.equals(
                        request.getAlertsEnabled()
                )
        );

        savedSearch.setAlertFrequency(
                request.getAlertFrequency() == null
                        ? SavedSearchAlertFrequency.DAILY
                        : request.getAlertFrequency()
        );

        SavedSearch saved =
                savedSearchRepository.save(
                        savedSearch
                );

        return map(
                saved
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Transactional
    public void delete(
            String email,
            UUID savedSearchId
    ) {

        User user =
                getUserByEmail(email);

        SavedSearch savedSearch =
                getOwnedSearch(
                        user.getId(),
                        savedSearchId
                );

        savedSearchRepository.delete(
                savedSearch
        );
    }

    // =========================================================
    // SET DEFAULT
    // =========================================================

    @Transactional
    public SavedSearchResponse setDefault(
            String email,
            UUID savedSearchId
    ) {

        User user =
                getUserByEmail(email);

        SavedSearch savedSearch =
                getOwnedSearch(
                        user.getId(),
                        savedSearchId
                );

        if (
                !savedSearch.isDefaultSearch()
        ) {
            clearExistingDefault(
                    user.getId()
            );

            savedSearch.setDefaultSearch(
                    true
            );

            savedSearch =
                    savedSearchRepository.save(
                            savedSearch
                    );
        }

        return map(
                savedSearch
        );
    }

    // =========================================================
    // UPDATE ALERT SETTINGS
    // =========================================================

    @Transactional
    public SavedSearchResponse updateAlerts(
            String email,
            UUID savedSearchId,
            UpdateSavedSearchAlertsRequest request
    ) {

        User user =
                getUserByEmail(email);

        SavedSearch savedSearch =
                getOwnedSearch(
                        user.getId(),
                        savedSearchId
                );

        savedSearch.setAlertsEnabled(
                Boolean.TRUE.equals(
                        request.getEnabled()
                )
        );

        if (
                request.getFrequency() != null
        ) {
            savedSearch.setAlertFrequency(
                    request.getFrequency()
            );
        }

        if (
                savedSearch.getAlertFrequency() == null
        ) {
            savedSearch.setAlertFrequency(
                    SavedSearchAlertFrequency.DAILY
            );
        }

        SavedSearch saved =
                savedSearchRepository.save(
                        savedSearch
                );

        return map(
                saved
        );
    }

    // =========================================================
    // GET SEARCH REQUEST
    // =========================================================
    //
    // Converts the stored criteria into the exact DTO already
    // consumed by BrowseProfileService.searchProfiles().
    //
    // This keeps ProfileSpecification as the single source of
    // truth for filtering.
    // =========================================================

    @Transactional
    public SearchProfileRequest getSearchRequest(
            String email,
            UUID savedSearchId
    ) {

        User user =
                getUserByEmail(email);

        SavedSearch savedSearch =
                getOwnedSearch(
                        user.getId(),
                        savedSearchId
                );

        return toSearchProfileRequest(
                savedSearch
        );
    }

    // =========================================================
    // USER
    // =========================================================

    private User getUserByEmail(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user is required."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        return userRepository
                .findByEmail(
                        normalizedEmail
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "User not found."
                                )
                );
    }

    // =========================================================
    // OWNERSHIP
    // =========================================================

    private SavedSearch getOwnedSearch(
            UUID userId,
            UUID savedSearchId
    ) {

        return savedSearchRepository
                .findByIdAndUserId(
                        savedSearchId,
                        userId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "Saved search not found."
                                )
                );
    }

    // =========================================================
    // DEFAULT SEARCH
    // =========================================================

    private void clearExistingDefault(
            UUID userId
    ) {

        savedSearchRepository
                .findFirstByUserIdAndDefaultSearchTrue(
                        userId
                )
                .ifPresent(
                        currentDefault -> {

                            currentDefault
                                    .setDefaultSearch(
                                            false
                                    );

                            savedSearchRepository
                                    .save(
                                            currentDefault
                                    );
                        }
                );
    }

    // =========================================================
    // CREATE MAPPING
    // =========================================================

    private void applyCreateRequest(
            SavedSearch target,
            CreateSavedSearchRequest request
    ) {

        target.setName(
                request.getName()
        );

        target.setAgeFrom(
                request.getAgeFrom()
        );

        target.setAgeTo(
                request.getAgeTo()
        );

        target.setHeightFrom(
                request.getHeightFrom()
        );

        target.setHeightTo(
                request.getHeightTo()
        );

        target.setGender(
                request.getGender()
        );

        target.setMaritalStatus(
                request.getMaritalStatus()
        );

        target.setReligion(
                request.getReligion()
        );

        target.setDenomination(
                request.getDenomination()
        );

        target.setCommunity(
                request.getCommunity()
        );

        target.setMotherTongue(
                request.getMotherTongue()
        );

        target.setBaptized(
                request.getBaptized()
        );

        target.setHighestEducation(
                request.getHighestEducation()
        );

        target.setProfession(
                request.getProfession()
        );

        target.setCountry(
                request.getCountry()
        );

        target.setState(
                request.getState()
        );

        target.setCity(
                request.getCity()
        );

        target.setDiet(
                request.getDiet()
        );

        target.setSmoking(
                request.getSmoking()
        );

        target.setDrinking(
                request.getDrinking()
        );

        target.setAadhaarVerified(
                request.getAadhaarVerified()
        );

        target.setIdVerified(
                request.getIdVerified()
        );

        target.setChurchVerified(
                request.getChurchVerified()
        );

        target.setSort(
                request.getSort()
        );
    }

    // =========================================================
    // UPDATE MAPPING
    // =========================================================

    private void applyUpdateRequest(
            SavedSearch target,
            UpdateSavedSearchRequest request
    ) {

        target.setName(
                request.getName()
        );

        target.setAgeFrom(
                request.getAgeFrom()
        );

        target.setAgeTo(
                request.getAgeTo()
        );

        target.setHeightFrom(
                request.getHeightFrom()
        );

        target.setHeightTo(
                request.getHeightTo()
        );

        target.setGender(
                request.getGender()
        );

        target.setMaritalStatus(
                request.getMaritalStatus()
        );

        target.setReligion(
                request.getReligion()
        );

        target.setDenomination(
                request.getDenomination()
        );

        target.setCommunity(
                request.getCommunity()
        );

        target.setMotherTongue(
                request.getMotherTongue()
        );

        target.setBaptized(
                request.getBaptized()
        );

        target.setHighestEducation(
                request.getHighestEducation()
        );

        target.setProfession(
                request.getProfession()
        );

        target.setCountry(
                request.getCountry()
        );

        target.setState(
                request.getState()
        );

        target.setCity(
                request.getCity()
        );

        target.setDiet(
                request.getDiet()
        );

        target.setSmoking(
                request.getSmoking()
        );

        target.setDrinking(
                request.getDrinking()
        );

        target.setAadhaarVerified(
                request.getAadhaarVerified()
        );

        target.setIdVerified(
                request.getIdVerified()
        );

        target.setChurchVerified(
                request.getChurchVerified()
        );

        target.setSort(
                request.getSort()
        );
    }

    // =========================================================
    // SAVED SEARCH -> SEARCH REQUEST
    // =========================================================

  public SearchProfileRequest
toSearchProfileRequest(
        SavedSearch savedSearch
) {

        SearchProfileRequest request =
                new SearchProfileRequest();

        request.setAgeFrom(
                savedSearch.getAgeFrom()
        );

        request.setAgeTo(
                savedSearch.getAgeTo()
        );

        request.setHeightFrom(
                savedSearch.getHeightFrom()
        );

        request.setHeightTo(
                savedSearch.getHeightTo()
        );

        request.setGender(
                savedSearch.getGender()
        );

        request.setMaritalStatus(
                savedSearch.getMaritalStatus()
        );

        request.setReligion(
                savedSearch.getReligion()
        );

        request.setDenomination(
                savedSearch.getDenomination()
        );

        request.setCommunity(
                savedSearch.getCommunity()
        );

        request.setMotherTongue(
                savedSearch.getMotherTongue()
        );

        request.setBaptized(
                savedSearch.getBaptized()
        );

        request.setHighestEducation(
                savedSearch.getHighestEducation()
        );

        request.setProfession(
                savedSearch.getProfession()
        );

        request.setCountry(
                savedSearch.getCountry()
        );

        request.setState(
                savedSearch.getState()
        );

        request.setCity(
                savedSearch.getCity()
        );

        request.setDiet(
                savedSearch.getDiet()
        );

        request.setSmoking(
                savedSearch.getSmoking()
        );

        request.setDrinking(
                savedSearch.getDrinking()
        );

        request.setAadhaarVerified(
                savedSearch.getAadhaarVerified()
        );

        request.setIdVerified(
                savedSearch.getIdVerified()
        );

        request.setChurchVerified(
                savedSearch.getChurchVerified()
        );

        request.setSort(
                savedSearch.getSort()
        );

        return request;
    }

    // =========================================================
    // RESPONSE MAPPING
    // =========================================================

    private SavedSearchResponse map(
            SavedSearch savedSearch
    ) {

        return SavedSearchResponse
                .builder()

                .id(
                        savedSearch.getId()
                )

                .name(
                        savedSearch.getName()
                )

                .ageFrom(
                        savedSearch.getAgeFrom()
                )

                .ageTo(
                        savedSearch.getAgeTo()
                )

                .heightFrom(
                        savedSearch.getHeightFrom()
                )

                .heightTo(
                        savedSearch.getHeightTo()
                )

                .gender(
                        savedSearch.getGender()
                )

                .maritalStatus(
                        savedSearch.getMaritalStatus()
                )

                .religion(
                        savedSearch.getReligion()
                )

                .denomination(
                        savedSearch.getDenomination()
                )

                .community(
                        savedSearch.getCommunity()
                )

                .motherTongue(
                        savedSearch.getMotherTongue()
                )

                .baptized(
                        savedSearch.getBaptized()
                )

                .highestEducation(
                        savedSearch.getHighestEducation()
                )

                .profession(
                        savedSearch.getProfession()
                )

                .country(
                        savedSearch.getCountry()
                )

                .state(
                        savedSearch.getState()
                )

                .city(
                        savedSearch.getCity()
                )

                .diet(
                        savedSearch.getDiet()
                )

                .smoking(
                        savedSearch.getSmoking()
                )

                .drinking(
                        savedSearch.getDrinking()
                )

                .aadhaarVerified(
                        savedSearch.getAadhaarVerified()
                )

                .idVerified(
                        savedSearch.getIdVerified()
                )

                .churchVerified(
                        savedSearch.getChurchVerified()
                )

                .sort(
                        savedSearch.getSort()
                )

                .defaultSearch(
                        savedSearch.isDefaultSearch()
                )

                .alertsEnabled(
                        savedSearch.isAlertsEnabled()
                )

                .alertFrequency(
                        savedSearch.getAlertFrequency()
                )

                .lastAlertedAt(
                        savedSearch.getLastAlertedAt()
                )

                .createdAt(
                        savedSearch.getCreatedAt()
                )

                .updatedAt(
                        savedSearch.getUpdatedAt()
                )

                .build();
    }
}