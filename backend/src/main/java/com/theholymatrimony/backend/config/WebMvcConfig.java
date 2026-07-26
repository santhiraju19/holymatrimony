package com.theholymatrimony.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final String profilePhotoDirectory;
    private final String profilePhotoUrl;

    public WebMvcConfig(
            @Value("${app.upload.profile-photos-directory}")
            String profilePhotoDirectory,

            @Value("${app.upload.profile-photos-url}")
            String profilePhotoUrl
    ) {
        this.profilePhotoDirectory = profilePhotoDirectory;
        this.profilePhotoUrl = profilePhotoUrl;
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        Path uploadDirectory =
                Paths.get(profilePhotoDirectory)
                        .toAbsolutePath()
                        .normalize();

        String resourceLocation =
                uploadDirectory.toUri().toString();

        registry.addResourceHandler(
                        profilePhotoUrl + "/**"
                )
                .addResourceLocations(resourceLocation);
    }
}