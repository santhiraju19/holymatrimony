package com.theholymatrimony.backend.security.jwt;

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
public class JwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String AUTHORITIES_CLAIM = "authorities";

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        Collection<GrantedAuthority> authorities =
                extractAuthorities(jwt);

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                jwt.getSubject()
        );
    }

    private Collection<GrantedAuthority> extractAuthorities(
            Jwt jwt
    ) {
        List<String> authorities =
                jwt.getClaimAsStringList(AUTHORITIES_CLAIM);

        if (authorities == null) {
            return List.of();
        }

        return authorities.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(authority -> !authority.isBlank())
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .map(GrantedAuthority.class::cast)
                .toList();
    }
}