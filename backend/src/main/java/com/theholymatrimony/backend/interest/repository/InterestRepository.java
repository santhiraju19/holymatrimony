package com.theholymatrimony.backend.interest.repository;

import com.theholymatrimony.backend.interest.entity.Interest;
import com.theholymatrimony.backend.interest.enums.InterestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface InterestRepository
        extends JpaRepository<Interest, UUID> {

    boolean existsBySenderIdAndReceiverId(
            UUID senderId,
            UUID receiverId
    );

    boolean existsBySenderIdAndReceiverIdAndStatus(
            UUID senderId,
            UUID receiverId,
            InterestStatus status
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Optional<Interest> findBySenderIdAndReceiverId(
            UUID senderId,
            UUID receiverId
    );

    @Override
    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Optional<Interest> findById(
            UUID interestId
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Page<Interest> findAllBySenderEmail(
            String senderEmail,
            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Page<Interest> findAllByReceiverEmail(
            String receiverEmail,
            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Page<Interest> findAllBySenderEmailAndStatus(
            String senderEmail,
            InterestStatus status,
            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "sender",
                    "receiver"
            }
    )
    Page<Interest> findAllByReceiverEmailAndStatus(
            String receiverEmail,
            InterestStatus status,
            Pageable pageable
    );


    long countBySenderIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            UUID senderId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );

    long countByReceiverEmailAndStatus(
            String receiverEmail,
            InterestStatus status
    );
}