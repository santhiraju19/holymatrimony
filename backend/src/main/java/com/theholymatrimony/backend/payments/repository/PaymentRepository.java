package com.theholymatrimony.backend.payments.repository;

import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository
        extends JpaRepository<Payment, UUID> {

    boolean existsByRazorpayPaymentId(
            String razorpayPaymentId
    );

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId
    );

    Optional<Payment> findByRazorpayPaymentId(
            String razorpayPaymentId
    );

    List<Payment> findAllByStatusAndCreatedAtBefore(
        PaymentStatus status,
        LocalDateTime createdAt
);

    List<Payment>
    findAllByEmailIgnoreCaseOrderByCreatedAtDesc(
            String email
    );

    Optional<Payment> findByIdAndEmailIgnoreCase(
            UUID id,
            String email
    );

    /*
     * =====================================================
     * Admin Payments
     * =====================================================
     */

    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT p
            FROM Payment p
            JOIN p.user u
            WHERE
                (
                    :status IS NULL
                    OR p.status = :status
                )
                AND
                (
                    :search IS NULL
                    OR :search = ''
                    OR LOWER(u.fullName)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.email)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.customerName, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.email, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.razorpayOrderId, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.razorpayPaymentId, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(p.plan, ''))
                        LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    Page<Payment> searchAdminPayments(
            @Param("search")
            String search,

            @Param("status")
            PaymentStatus status,

            Pageable pageable
    );

    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT p
            FROM Payment p
            WHERE p.id = :paymentId
            """)
    Optional<Payment> findAdminPaymentById(
            @Param("paymentId")
            UUID paymentId
    );

    /*
     * =====================================================
     * Admin Dashboard Analytics
     * =====================================================
     */

    long countByStatus(
            PaymentStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.status = :status
            """)
    java.math.BigDecimal sumAmountByStatus(
            @Param("status")
            PaymentStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.status = :status
              AND p.paidAt >= :start
              AND p.paidAt < :end
            """)
    java.math.BigDecimal sumAmountByStatusAndPaidAtBetween(
            @Param("status")
            PaymentStatus status,
            @Param("start")
            LocalDateTime start,
            @Param("end")
            LocalDateTime end
    );


    /*
     * =====================================================
     * Admin Business Analytics - Date Range
     * =====================================================
     */

    long countByStatusAndCreatedAtBetween(
            PaymentStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    long countByStatusAndPaidAtBetween(
            PaymentStatus status,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Payment> findAllByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime start,
            LocalDateTime end
    );

}