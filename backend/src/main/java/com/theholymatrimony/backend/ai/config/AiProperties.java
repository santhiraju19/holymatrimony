package com.theholymatrimony.backend.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    /*
     * AI Smart Search can be disabled without
     * changing or rebuilding the application.
     */
    private boolean enabled = false;

    /*
     * Keep the provider configurable so the
     * application is not tightly coupled to
     * one model provider.
     */
    private String baseUrl =
            "https://api.openai.com/v1";

    private String apiKey = "";

    private String model = "gpt-5.6-luna";

    /*
     * AI search interpretation should be fast.
     */
    private int connectTimeoutSeconds = 5;

    private int readTimeoutSeconds = 15;
}
