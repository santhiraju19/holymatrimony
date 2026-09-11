package com.theholymatrimony.backend.ai.config;

import org.springframework.boot.http.client.ClientHttpRequestFactoryBuilder;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class AiClientConfig {

    @Bean
    public RestClient aiRestClient(
            AiProperties properties
    ) {

        ClientHttpRequestFactorySettings settings =
                ClientHttpRequestFactorySettings
                        .defaults()
                        .withConnectTimeout(
                                Duration.ofSeconds(
                                        properties
                                                .getConnectTimeoutSeconds()
                                )
                        )
                        .withReadTimeout(
                                Duration.ofSeconds(
                                        properties
                                                .getReadTimeoutSeconds()
                                )
                        );

        return RestClient
                .builder()
                .baseUrl(
                        properties.getBaseUrl()
                )
                .requestFactory(
                        ClientHttpRequestFactoryBuilder
                                .detect()
                                .build(settings)
                )
                .build();
    }
}
