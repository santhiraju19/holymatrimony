package com.theholymatrimony.backend.secureconnect.topup.repository;

import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.secureconnect.topup.entity.SecureConnectTopUpPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SecureConnectTopUpPaymentRepository
        extends JpaRepository<SecureConnectTopUpPayment, UUID> {

    Optional<SecureConnectTopUpPayment> findByRazorpayOrderId(
            String razorpayOrderId
    );

    boolean existsByRazorpayOrderId(
            String razorpayOrderId
    );

    Optional<SecureConnectTopUpPayment> findByRazorpayPaymentId(
            String razorpayPaymentId
    );

    boolean existsByRazorpayPaymentId(
            String razorpayPaymentId
    );

    List<SecureConnectTopUpPayment>
    findAllByUserIdOrderByCreatedAtDesc(
            UUID userId
    );

    List<SecureConnectTopUpPayment>
    findAllByStatus(
            PaymentStatus status
    );
}
