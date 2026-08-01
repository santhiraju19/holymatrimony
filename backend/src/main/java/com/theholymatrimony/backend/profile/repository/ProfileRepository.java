package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.profile.entity.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository
        extends JpaRepository<Profile, UUID>,
        JpaSpecificationExecutor<Profile> {

    Optional<Profile> findByUser(User user);

    Optional<Profile> findByUserEmail(String email);

    Optional<Profile> findByUserId(UUID userId);

    boolean existsByUser(User user);

    /*
     * Browse completed profiles while excluding the currently
     * authenticated user's own profile.
     */
    @EntityGraph(attributePaths = "user")
    Page<Profile>
    findByProfileCompletedTrueAndUserEmailNot(
            String email,
            Pageable pageable
    );

    /*
     * Read one completed public profile while preventing users
     * from opening their own profile through the Browse API.
     */
    @EntityGraph(attributePaths = "user")
    Optional<Profile>
    findByIdAndProfileCompletedTrueAndUserEmailNot(
            UUID id,
            String email
    );

    /*
     * Search profiles using dynamic JPA Specifications.
     *
     * EntityGraph eagerly loads the user associated with every
     * profile and avoids additional user queries while mapping.
     */
    @Override
    @EntityGraph(attributePaths = "user")
    Page<Profile> findAll(
            Specification<Profile> specification,
            Pageable pageable
    );
}