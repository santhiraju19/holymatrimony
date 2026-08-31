package com.theholymatrimony.backend.membership.controller;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.membership.dto.MembershipResponse;
import com.theholymatrimony.backend.membership.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/membership")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ApiResponse<MembershipResponse> getMyMembership(
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);

        MembershipResponse response =
                membershipService.getMembership(user.getId());

        return ApiResponse.success(response);
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {
        if (
                authentication == null
                        || authentication.getName() == null
                        || authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated user was not found."
            );
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Authenticated user was not found."
                        )
                );
    }
}
