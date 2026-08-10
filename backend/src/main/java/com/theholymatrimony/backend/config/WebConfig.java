package com.theholymatrimony.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String profilePhotosDirectory;

    public WebConfig(
            @Value(
                    "${app.upload.profile-photos-directory:uploads/profile-photos}"
            )
            String profilePhotosDirectory
    ) {
        this.profilePhotosDirectory =
                profilePhotosDirectory;
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        Path storagePath =
                Paths.get(
                        profilePhotosDirectory
                )
                .toAbsolutePath()
                .normalize();

        String resourceLocation =
                storagePath
                        .toUri()
                        .toString();

        /*
         * Ensure Spring treats the location
         * as a directory.
         */
        if (
                !resourceLocation
                        .endsWith("/")
        ) {
            resourceLocation =
                    resourceLocation + "/";
        }

        registry
                .addResourceHandler(
                        "/api/v1/uploads/profile-photos/**"
                )
                .addResourceLocations(
                        resourceLocation
                );
    }
}