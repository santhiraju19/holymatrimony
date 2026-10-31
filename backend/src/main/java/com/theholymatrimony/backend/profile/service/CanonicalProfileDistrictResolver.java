package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.entity.GeoState;
import com.theholymatrimony.backend.franchise.repository.GeoDistrictRepository;
import com.theholymatrimony.backend.franchise.repository.GeoStateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/**
 * Resolves the legacy current-location text stored on a member profile
 * to the canonical geography model used for geographic authorization.
 *
 * Resolution is deliberately conservative:
 *
 * - only India is currently supported by the canonical geography model;
 * - country, state, and district must all be present;
 * - state and district names are matched after trim/case normalization;
 * - only active canonical states and districts are considered;
 * - exactly one state and exactly one district must match;
 * - unresolved or ambiguous locations return null rather than guessing.
 *
 * Franchise authorization must use the resolved canonical district
 * relationship, never the profile's free-text location fields.
 */
@Service
@RequiredArgsConstructor
public class CanonicalProfileDistrictResolver {

    private static final String INDIA = "india";

    private final GeoStateRepository geoStateRepository;
    private final GeoDistrictRepository geoDistrictRepository;

    public GeoDistrict resolve(
            String country,
            String state,
            String district
    ) {

        String normalizedCountry =
                normalize(country);

        String normalizedState =
                normalize(state);

        String normalizedDistrict =
                normalize(district);

        if (
                normalizedCountry == null
                        ||
                normalizedState == null
                        ||
                normalizedDistrict == null
        ) {
            return null;
        }

        if (!INDIA.equals(normalizedCountry)) {
            return null;
        }

        List<GeoState> matchingStates =
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
                        .stream()
                        .filter(
                                candidate ->
                                        normalizedState.equals(
                                                normalize(
                                                        candidate.getName()
                                                )
                                        )
                        )
                        .toList();

        if (matchingStates.size() != 1) {
            return null;
        }

        GeoState canonicalState =
                matchingStates.get(0);

        List<GeoDistrict> matchingDistricts =
                geoDistrictRepository
                        .findAllByStateIdAndActiveTrueOrderByNameAsc(
                                canonicalState.getId()
                        )
                        .stream()
                        .filter(
                                candidate ->
                                        normalizedDistrict.equals(
                                                normalize(
                                                        candidate.getName()
                                                )
                                        )
                        )
                        .toList();

        if (matchingDistricts.size() != 1) {
            return null;
        }

        return matchingDistricts.get(0);
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value.trim();

        if (normalized.isEmpty()) {
            return null;
        }

        return normalized.toLowerCase(
                Locale.ROOT
        );
    }
}
