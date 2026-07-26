package com.theholymatrimony.backend.auth.repository;

import com.theholymatrimony.backend.auth.entity.RefreshToken;
import com.theholymatrimony.backend.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUser(User user);

    List<RefreshToken> findByUserAndRevokedAtIsNull(User user);

    void deleteByUser(User user);
}