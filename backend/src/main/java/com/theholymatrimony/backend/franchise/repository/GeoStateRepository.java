package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.GeoState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GeoStateRepository
        extends JpaRepository<GeoState, UUID> {

    Optional<GeoState> findByLgdCode(
            Integer lgdCode
    );

    List<GeoState> findAllByActiveTrueOrderByNameAsc();
}
