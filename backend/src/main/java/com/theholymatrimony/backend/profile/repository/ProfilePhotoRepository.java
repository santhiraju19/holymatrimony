package com.theholymatrimony.backend.profile.repository;

import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfilePhotoRepository
        extends JpaRepository<ProfilePhoto, UUID> {

    List<ProfilePhoto>
    findAllByUserEmailOrderByDisplayOrderAsc(
            String email
    );

    Optional<ProfilePhoto>
    findByIdAndUserEmail(
            UUID id,
            String email
    );

    Optional<ProfilePhoto>
    findByUserEmailAndPrimaryPhotoTrue(
            String email
    );

    /*
     * Used by the Browse Profiles API.
     */
    Optional<ProfilePhoto>
    findFirstByUserIdAndPrimaryPhotoTrue(
            UUID userId
    );

    long countByUserEmail(String email);

    boolean existsByIdAndUserEmail(
            UUID id,
            String email
    );

    @Modifying
    @Query("""
            update ProfilePhoto photo
            set photo.primaryPhoto = false
            where photo.user.email = :email
            """)
    void clearPrimaryPhotoForUser(
            @Param("email")
            String email
    );

    @Query("""
            select coalesce(
                max(photo.displayOrder),
                -1
            )
            from ProfilePhoto photo
            where photo.user.email = :email
            """)
    Integer findMaximumDisplayOrder(
            @Param("email")
            String email
    );
    List<ProfilePhoto>
findAllByUserIdOrderByDisplayOrderAsc(
        UUID userId
);
}