package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.UserStatus;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.enums.ProfileVerificationStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.domain.Specification;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository
        extends JpaRepository<Profile, UUID>,
        JpaSpecificationExecutor<Profile> {

    Optional<Profile> findByUser(
            User user
    );

    Optional<Profile> findByUserEmail(
            String email
    );

    Optional<Profile> findByUserId(
            UUID userId
    );

    /*
     * Public homepage featured profiles.
     *
     * Selection happens in PostgreSQL so the homepage does not
     * load every profile into application memory.
     *
     * Requirements:
     * - explicitly curated for homepage
     * - completed profile
     * - active/enabled account
     * - usable primary photo
     *
     * Pageable controls the public result limit.
     */
    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT DISTINCT p
            FROM Profile p
            JOIN p.user u
            JOIN ProfilePhoto photo
                ON photo.user = u
            WHERE p.featuredOnHomepage = true
              AND p.profileCompleted = true
              AND u.enabled = true
              AND u.status = :accountStatus
              AND photo.primaryPhoto = true
              AND photo.imageUrl IS NOT NULL
              AND TRIM(photo.imageUrl) <> ''
            ORDER BY p.updatedAt DESC
            """)
    List<Profile> findPublicHomepageFeaturedProfiles(
            @Param("accountStatus") UserStatus accountStatus,
            Pageable pageable
    );

    boolean existsByUser(
            User user
    );

    /*
     * Browse completed profiles while excluding
     * the currently authenticated user's profile.
     */
    @EntityGraph(attributePaths = "user")
    Page<Profile>
    findByProfileLiveTrueAndUserEnabledTrueAndUserStatusAndUserEmailNot(
            UserStatus status,
            String email,
            Pageable pageable
    );

    /*
     * Read one completed public profile while
     * preventing users from opening their own
     * profile through the Browse API.
     */
    @EntityGraph(attributePaths = "user")
    Optional<Profile>
    findByIdAndProfileLiveTrueAndUserEnabledTrueAndUserStatusAndUserEmailNot(
            UUID id,
            UserStatus status,
            String email
    );

    /*
     * Existing dynamic profile search.
     */
    @Override
    @EntityGraph(attributePaths = "user")
    Page<Profile> findAll(
            Specification<Profile> specification,
            Pageable pageable
    );

    /*
     * =====================================================
     * Admin Profile Verification
     * =====================================================
     */

    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT p
            FROM Profile p
            JOIN p.user u
            WHERE
                (
                    :status IS NULL
                    OR p.verificationStatus = :status
                )
                AND
                (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(u.fullName)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.email)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.churchName, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.denomination, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.city, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<Profile> searchAdminProfiles(

            @Param("search")
            String search,

            @Param("status")
            ProfileVerificationStatus status,

            Pageable pageable
    );

    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT p
            FROM Profile p
            WHERE p.id = :profileId
            """)
    Optional<Profile> findAdminProfileById(

            @Param("profileId")
            UUID profileId
    );

    /*
     * =====================================================
     * Admin Dashboard Analytics
     * =====================================================
     */

    long countByProfileCompletedTrue();

    long countByProfileCompletedFalse();


    /*
     * =====================================================
     * Admin Business Analytics
     * =====================================================
     */

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    long countByProfileCompletedTrueAndCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );


    @EntityGraph(attributePaths = "user")
    List<Profile> findAllByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime start,
            LocalDateTime end
    );

}