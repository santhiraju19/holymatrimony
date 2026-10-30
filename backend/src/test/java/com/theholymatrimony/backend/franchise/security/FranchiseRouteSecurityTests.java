package com.theholymatrimony.backend.franchise.security;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.context.TestConfiguration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import org.springframework.security.test.context.support.WithMockUser;

import org.springframework.test.web.servlet.MockMvc;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        properties = {
                "jwt.secret=FranchiseRouteSecurityTestsSecretKey123456789012345678901234567890",
                "spring.flyway.enabled=false"
        }
)
@AutoConfigureMockMvc
@Import(
        FranchiseRouteSecurityTests.RouteTestConfiguration.class
)
class FranchiseRouteSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unauthenticatedRequestCannotAccessFranchiseRoute()
            throws Exception {

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/test"
                        )
                )
                .andExpect(
                        status().isUnauthorized()
                );
    }

    @Test
    @WithMockUser(
            username = "member@example.com",
            roles = "USER"
    )
    void normalUserCannotAccessFranchiseRoute()
            throws Exception {

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/test"
                        )
                )
                .andExpect(
                        status().isForbidden()
                );
    }

    @Test
    @WithMockUser(
            username = "admin@example.com",
            roles = "ADMIN"
    )
    void adminCannotAccessFranchiseRouteByAdminRoleAlone()
            throws Exception {

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/test"
                        )
                )
                .andExpect(
                        status().isForbidden()
                );
    }

    @Test
    @WithMockUser(
            username = "franchise@example.com",
            roles = "FRANCHISE"
    )
    void franchiseRoleCanPassFranchiseRouteMatcher()
            throws Exception {

        mockMvc.perform(
                        get(
                                "/api/v1/franchise/test"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        content().string(
                                "franchise-route-ok"
                        )
                );
    }

    @Test
    @WithMockUser(
            username = "member@example.com",
            roles = "USER"
    )
    void normalUserStillPassesGeneralAuthenticatedFallback()
            throws Exception {

        mockMvc.perform(
                        get(
                                "/api/v1/member-test"
                        )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        content().string(
                                "member-route-ok"
                        )
                );
    }

    @TestConfiguration
    static class RouteTestConfiguration {

        @Bean
        TestFranchiseController testFranchiseController() {
            return new TestFranchiseController();
        }
    }

    @RestController
    static class TestFranchiseController {

        @GetMapping("/api/v1/franchise/test")
        String franchiseRoute() {
            return "franchise-route-ok";
        }

        @GetMapping("/api/v1/member-test")
        String memberRoute() {
            return "member-route-ok";
        }
    }
}
