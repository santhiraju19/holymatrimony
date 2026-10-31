package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import com.theholymatrimony.backend.franchise.entity.GeoState;
import com.theholymatrimony.backend.franchise.repository.GeoDistrictRepository;
import com.theholymatrimony.backend.franchise.repository.GeoStateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CanonicalProfileDistrictResolverTests {

    private GeoStateRepository geoStateRepository;
    private GeoDistrictRepository geoDistrictRepository;

    private CanonicalProfileDistrictResolver resolver;

    @BeforeEach
    void setUp() {

        geoStateRepository =
                mock(GeoStateRepository.class);

        geoDistrictRepository =
                mock(GeoDistrictRepository.class);

        resolver =
                new CanonicalProfileDistrictResolver(
                        geoStateRepository,
                        geoDistrictRepository
                );
    }

    @Test
    void resolvesExactIndiaStateAndDistrict() {

        UUID stateId =
                UUID.randomUUID();

        GeoState state =
                state(
                        stateId,
                        "Andhra Pradesh"
                );

        GeoDistrict district =
                district(
                        UUID.randomUUID(),
                        "Guntur"
                );

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(state)
        );

        when(
                geoDistrictRepository
                        .findAllByStateIdAndActiveTrueOrderByNameAsc(
                                stateId
                        )
        ).thenReturn(
                List.of(district)
        );

        GeoDistrict result =
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Guntur"
                );

        assertSame(
                district,
                result
        );

        verify(
                geoDistrictRepository
        ).findAllByStateIdAndActiveTrueOrderByNameAsc(
                stateId
        );
    }

    @Test
    void resolvesAfterTrimAndCaseNormalization() {

        UUID stateId =
                UUID.randomUUID();

        GeoState state =
                state(
                        stateId,
                        "Andhra Pradesh"
                );

        GeoDistrict district =
                district(
                        UUID.randomUUID(),
                        "Guntur"
                );

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(state)
        );

        when(
                geoDistrictRepository
                        .findAllByStateIdAndActiveTrueOrderByNameAsc(
                                stateId
                        )
        ).thenReturn(
                List.of(district)
        );

        GeoDistrict result =
                resolver.resolve(
                        "  INDIA  ",
                        "  andhra pradesh ",
                        " gUnTuR "
                );

        assertSame(
                district,
                result
        );
    }

    @Test
    void nonIndiaLocationDoesNotResolve() {

        GeoDistrict result =
                resolver.resolve(
                        "United States",
                        "Texas",
                        "Dallas"
                );

        assertNull(result);

        verifyNoInteractions(
                geoStateRepository,
                geoDistrictRepository
        );
    }

    @Test
    void incompleteLocationDoesNotResolve() {

        assertNull(
                resolver.resolve(
                        null,
                        "Andhra Pradesh",
                        "Guntur"
                )
        );

        assertNull(
                resolver.resolve(
                        "India",
                        " ",
                        "Guntur"
                )
        );

        assertNull(
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        ""
                )
        );

        verifyNoInteractions(
                geoStateRepository,
                geoDistrictRepository
        );
    }

    @Test
    void unmatchedStateDoesNotResolve() {

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(
                        state(
                                UUID.randomUUID(),
                                "Telangana"
                        )
                )
        );

        GeoDistrict result =
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Guntur"
                );

        assertNull(result);

        verifyNoInteractions(
                geoDistrictRepository
        );
    }

    @Test
    void ambiguousStateDoesNotResolve() {

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(
                        state(
                                UUID.randomUUID(),
                                "Andhra Pradesh"
                        ),
                        state(
                                UUID.randomUUID(),
                                "ANDHRA PRADESH"
                        )
                )
        );

        GeoDistrict result =
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Guntur"
                );

        assertNull(result);

        verifyNoInteractions(
                geoDistrictRepository
        );
    }

    @Test
    void unmatchedDistrictDoesNotResolve() {

        UUID stateId =
                UUID.randomUUID();

        GeoState state =
                state(
                        stateId,
                        "Andhra Pradesh"
                );

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(state)
        );

        when(
                geoDistrictRepository
                        .findAllByStateIdAndActiveTrueOrderByNameAsc(
                                stateId
                        )
        ).thenReturn(
                List.of(
                        district(
                                UUID.randomUUID(),
                                "Krishna"
                        )
                )
        );

        GeoDistrict result =
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Guntur"
                );

        assertNull(result);
    }

    @Test
    void ambiguousDistrictDoesNotResolve() {

        UUID stateId =
                UUID.randomUUID();

        GeoState state =
                state(
                        stateId,
                        "Andhra Pradesh"
                );

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(state)
        );

        when(
                geoDistrictRepository
                        .findAllByStateIdAndActiveTrueOrderByNameAsc(
                                stateId
                        )
        ).thenReturn(
                List.of(
                        district(
                                UUID.randomUUID(),
                                "Guntur"
                        ),
                        district(
                                UUID.randomUUID(),
                                "GUNTUR"
                        )
                )
        );

        GeoDistrict result =
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Guntur"
                );

        assertNull(result);
    }

    @Test
    void districtLookupUsesResolvedStateId() {

        UUID resolvedStateId =
                UUID.randomUUID();

        UUID unrelatedStateId =
                UUID.randomUUID();

        GeoState resolvedState =
                state(
                        resolvedStateId,
                        "Andhra Pradesh"
                );

        GeoState unrelatedState =
                state(
                        unrelatedStateId,
                        "Telangana"
                );

        GeoDistrict district =
                district(
                        UUID.randomUUID(),
                        "Guntur"
                );

        when(
                geoStateRepository
                        .findAllByActiveTrueOrderByNameAsc()
        ).thenReturn(
                List.of(
                        resolvedState,
                        unrelatedState
                )
        );

        when(
                geoDistrictRepository
                        .findAllByStateIdAndActiveTrueOrderByNameAsc(
                                resolvedStateId
                        )
        ).thenReturn(
                List.of(district)
        );

        GeoDistrict result =
                resolver.resolve(
                        "India",
                        "Andhra Pradesh",
                        "Guntur"
                );

        assertSame(
                district,
                result
        );

        verify(
                geoDistrictRepository
        ).findAllByStateIdAndActiveTrueOrderByNameAsc(
                resolvedStateId
        );

        verify(
                geoDistrictRepository,
                never()
        ).findAllByStateIdAndActiveTrueOrderByNameAsc(
                unrelatedStateId
        );
    }

    private GeoState state(
            UUID id,
            String name
    ) {

        return GeoState.builder()
                .id(id)
                .name(name)
                .active(true)
                .build();
    }

    private GeoDistrict district(
            UUID id,
            String name
    ) {

        return GeoDistrict.builder()
                .id(id)
                .name(name)
                .active(true)
                .build();
    }
}
