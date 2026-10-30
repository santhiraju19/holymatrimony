package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.GeoDistrict;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GeoDistrictRepository
        extends JpaRepository<GeoDistrict, UUID> {

    Optional<GeoDistrict> findByLgdCode(
            Integer lgdCode
    );

    List<GeoDistrict>
    findAllByStateIdAndActiveTrueOrderByNameAsc(
            UUID stateId
    );
}
