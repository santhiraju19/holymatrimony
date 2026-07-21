package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUserId(UUID userId);

    Optional<Profile> findByUserEmail(String email);

    boolean existsByUserId(UUID userId);
}