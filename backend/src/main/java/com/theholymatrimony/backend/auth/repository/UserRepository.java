package com.theholymatrimony.backend.auth.repository;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.enums.UserStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository
        extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(
            String email
    );

    Optional<User> findByMobile(
            String mobile
    );

    boolean existsByEmail(
            String email
    );

    boolean existsByMobile(
            String mobile
    );

    @Query("""
            SELECT u
            FROM User u
            WHERE
                (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(u.fullName)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.email)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR u.mobile
                        LIKE CONCAT('%', :search, '%')
                )
                AND
                (
                    :status IS NULL
                    OR u.status = :status
                )
            """)
    Page<User> searchAdminUsers(

            @Param("search")
            String search,

            @Param("status")
            UserStatus status,

            Pageable pageable
    );

    /*
     * =====================================================
     * Admin Dashboard Analytics
     * =====================================================
     */

    long countByCreatedAtGreaterThanEqual(
            LocalDateTime createdAt
    );

    long countByCreatedAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );


    List<User> findAllByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime start,
            LocalDateTime end
    );

}