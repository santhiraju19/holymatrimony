package com.theholymatrimony.backend.payments.repository;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipRepository
        extends JpaRepository<Membership, UUID> {

    Optional<Membership>
    findFirstByUserAndStatusOrderByStartDateDesc(
            User user,
            MembershipStatus status
    );

    Optional<Membership>
    findFirstByUserOrderByStartDateDesc(
            User user
    );

    List<Membership>
    findAllByUserOrderByStartDateDesc(
            User user
    );

    List<Membership> findAllByUser(User user);

    boolean existsByUser(User user);
}