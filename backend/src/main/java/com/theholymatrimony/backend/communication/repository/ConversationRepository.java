package com.theholymatrimony.backend.communication.repository;

import com.theholymatrimony.backend.communication.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository
        extends JpaRepository<Conversation, UUID> {

    @EntityGraph(
            attributePaths = {
                    "participantOne",
                    "participantTwo",
                    "lastMessageSender"
            }
    )
    Optional<Conversation>
    findByParticipantOneIdAndParticipantTwoId(
            UUID participantOneId,
            UUID participantTwoId
    );

    boolean existsByParticipantOneIdAndParticipantTwoId(
            UUID participantOneId,
            UUID participantTwoId
    );

    @Override
    @EntityGraph(
            attributePaths = {
                    "participantOne",
                    "participantTwo",
                    "lastMessageSender"
            }
    )
    Optional<Conversation> findById(
            UUID conversationId
    );

    @EntityGraph(
            attributePaths = {
                    "participantOne",
                    "participantTwo",
                    "lastMessageSender"
            }
    )
    Page<Conversation>
    findAllByParticipantOneIdOrParticipantTwoId(
            UUID participantOneId,
            UUID participantTwoId,
            Pageable pageable
    );
}