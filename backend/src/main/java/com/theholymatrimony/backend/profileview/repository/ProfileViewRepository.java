package com.theholymatrimony.backend.profileview.repository;

import com.theholymatrimony.backend.profileview.entity.ProfileView;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileViewRepository
        extends JpaRepository<ProfileView, UUID> {

    Optional<ProfileView>
    findByViewerIdAndViewedId(
            UUID viewerUserId,
            UUID viewedUserId
    );

    /*
     * ============================================================
     * WHO VIEWED ME
     * ============================================================
     *
     * Each viewer/viewed pair has one ProfileView row.
     *
     * Therefore this returns unique viewers ordered by their most
     * recent visit.
     */

    @EntityGraph(
            attributePaths = {
                    "viewer"
            }
    )
    Page<ProfileView>
    findByViewedIdOrderByLastViewedAtDesc(
            UUID viewedUserId,
            Pageable pageable
    );
}
