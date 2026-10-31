package com.theholymatrimony.backend.franchise.repository;

import com.theholymatrimony.backend.franchise.entity.FranchiseLifecycleEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FranchiseLifecycleEventRepository
        extends JpaRepository<FranchiseLifecycleEvent, UUID> {

    List<FranchiseLifecycleEvent> findAllByFranchiseIdOrderByOccurredAtDesc(
            UUID franchiseId
    );
}
