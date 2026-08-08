package com.theholymatrimony.backend.payments.repository;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.MembershipStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

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

    List<Membership> findAllByUser(
            User user
    );

    boolean existsByUser(
            User user
    );

    /*
     * =====================================================
     * Admin Membership Management
     * =====================================================
     */

    @EntityGraph(
            attributePaths = {
                    "user",
                    "payment"
            }
    )
    @Query("""
            SELECT m
            FROM Membership m
            JOIN m.user u
            WHERE
                (
                    :status IS NULL
                    OR m.status = :status
                )
                AND
                (
                    :plan IS NULL
                    OR m.plan = :plan
                )
                AND
                (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(u.fullName)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.email)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(u.mobile, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<Membership> searchAdminMemberships(
            @Param("search")
            String search,

            @Param("status")
            MembershipStatus status,

            @Param("plan")
            MembershipPlan plan,

            Pageable pageable
    );

    @EntityGraph(
            attributePaths = {
                    "user",
                    "payment"
            }
    )
    @Query("""
            SELECT m
            FROM Membership m
            WHERE m.id = :membershipId
            """)
    Optional<Membership> findAdminMembershipById(
            @Param("membershipId")
            UUID membershipId
    );
}