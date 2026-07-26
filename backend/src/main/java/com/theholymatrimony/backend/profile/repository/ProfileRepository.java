package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUser(User user);

    Optional<Profile> findByUserEmail(String email);

    boolean existsByUser(User user);
}