package com.theholymatrimony.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path profilePhotosDirectory = Paths.get(
                "uploads",
                "profile-photos"
        ).toAbsolutePath().normalize();

        String resourceLocation =
                profilePhotosDirectory.toUri().toString();

        registry
                .addResourceHandler(
                        "/api/v1/uploads/profile-photos/**"
                )
                .addResourceLocations(resourceLocation);
    }
}
