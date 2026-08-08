package com.theholymatrimony.backend.shortlist.repository;

import com.theholymatrimony.backend.shortlist.entity.Shortlist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShortlistRepository
        extends JpaRepository<Shortlist, UUID> {

    boolean existsByOwnerIdAndProfileId(
            UUID ownerId,
            UUID profileId
    );

    Optional<Shortlist>
    findByOwnerIdAndProfileId(
            UUID ownerId,
            UUID profileId
    );

    @EntityGraph(
            attributePaths = {
                    "owner",
                    "profile",
                    "profile.user"
            }
    )
    Page<Shortlist> findAllByOwnerEmail(
            String ownerEmail,
            Pageable pageable
    );

    long countByOwnerEmail(
            String ownerEmail
    );
}