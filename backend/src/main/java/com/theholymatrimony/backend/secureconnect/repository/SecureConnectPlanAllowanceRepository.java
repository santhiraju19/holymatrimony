package com.theholymatrimony.backend.secureconnect.repository;

import com.theholymatrimony.backend.secureconnect.entity.SecureConnectPlanAllowance;
import com.theholymatrimony.backend.secureconnect.enums.CallMediaType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface SecureConnectPlanAllowanceRepository
        extends JpaRepository<SecureConnectPlanAllowance, UUID> {

    Optional<SecureConnectPlanAllowance>
    findByMembershipIdAndMediaType(
            UUID membershipId,
            CallMediaType mediaType
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select a
            from SecureConnectPlanAllowance a
            where a.membership.id = :membershipId
              and a.mediaType = :mediaType
            """)
    Optional<SecureConnectPlanAllowance>
    findForUpdate(
            @Param("membershipId") UUID membershipId,
            @Param("mediaType") CallMediaType mediaType
    );
}
