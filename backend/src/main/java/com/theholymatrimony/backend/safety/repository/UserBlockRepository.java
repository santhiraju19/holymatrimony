
package com.theholymatrimony.backend.safety.repository;

import com.theholymatrimony.backend.safety.entity.UserBlock;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserBlockRepository
        extends JpaRepository<UserBlock, UUID> {

    boolean existsByBlockerIdAndBlockedUserId(
            UUID blockerId,
            UUID blockedUserId
    );

    Optional<UserBlock>
    findByBlockerIdAndBlockedUserId(
            UUID blockerId,
            UUID blockedUserId
    );

    boolean existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
            UUID blockerId1,
            UUID blockedUserId1,
            UUID blockerId2,
            UUID blockedUserId2
    );

    void deleteByBlockerIdAndBlockedUserId(
            UUID blockerId,
            UUID blockedUserId
    );
}