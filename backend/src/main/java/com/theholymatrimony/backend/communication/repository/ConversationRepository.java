package com.theholymatrimony.backend.communication.repository;

import com.theholymatrimony.backend.communication.entity.Conversation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

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

    /*
     * Return only conversations that are visible
     * to the current user.
     *
     * Each participant owns their own deletion marker.
     */
    @EntityGraph(
            attributePaths = {
                    "participantOne",
                    "participantTwo",
                    "lastMessageSender"
            }
    )
    @Query("""
            SELECT c
            FROM Conversation c
            WHERE
                (
                    c.participantOne.id = :userId
                    AND c.participantOneDeletedAt IS NULL
                )
                OR
                (
                    c.participantTwo.id = :userId
                    AND c.participantTwoDeletedAt IS NULL
                )
            """)
    Page<Conversation>
    findVisibleConversationsForUser(
            @Param("userId")
            UUID userId,
            Pageable pageable
    );
}