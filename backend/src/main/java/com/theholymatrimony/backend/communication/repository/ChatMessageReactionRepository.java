package com.theholymatrimony.backend.communication.repository;

import com.theholymatrimony.backend.communication.entity.ChatMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatMessageReactionRepository
        extends JpaRepository<
                ChatMessageReaction,
                UUID
        > {

    Optional<ChatMessageReaction>
    findByMessageIdAndUserId(
            UUID messageId,
            UUID userId
    );

    List<ChatMessageReaction>
    findAllByMessageIdOrderByCreatedAtAsc(
            UUID messageId
    );

    long countByMessageId(
            UUID messageId
    );

    void deleteAllByMessageId(
            UUID messageId
    );
}