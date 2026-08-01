package com.theholymatrimony.backend.payments.repository;

import com.theholymatrimony.backend.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    boolean existsByRazorpayPaymentId(
            String razorpayPaymentId
    );

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId
    );

    Optional<Payment> findByRazorpayPaymentId(
            String razorpayPaymentId
    );

    List<Payment>
    findAllByEmailIgnoreCaseOrderByCreatedAtDesc(
            String email
    );

    Optional<Payment> findByIdAndEmailIgnoreCase(
            Long id,
            String email
    );
}
