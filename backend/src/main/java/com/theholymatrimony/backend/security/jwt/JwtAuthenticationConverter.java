package com.theholymatrimony.backend.security.jwt;

import com.theholymatrimony.backend.security.ActiveAccountValidator;

import lombok.RequiredArgsConstructor;

import org.springframework.core.convert.converter.Converter;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String AUTHORITIES_CLAIM =
            "authorities";

    private final ActiveAccountValidator
            activeAccountValidator;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        String email = jwt.getSubject();

        /*
         * Do not trust an already-issued JWT alone.
         *
         * The database is the authoritative source
         * for whether the account is still ACTIVE.
         *
         * This makes admin suspension/blocking take
         * effect for subsequent protected API calls
         * even when the access token has not expired.
         */
        activeAccountValidator.requireActiveUser(email);

        Collection<GrantedAuthority> authorities =
                extractAuthorities(jwt);

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                email
        );
    }

    private Collection<GrantedAuthority> extractAuthorities(
            Jwt jwt
    ) {

        List<String> authorities =
                jwt.getClaimAsStringList(
                        AUTHORITIES_CLAIM
                );

        if (authorities == null) {
            return List.of();
        }

        return authorities.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(authority ->
                        !authority.isBlank()
                )
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
    }
}