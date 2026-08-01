package com.theholymatrimony.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig
        implements WebMvcConfigurer {

    private final String profilePhotoDirectory;

    private final String profilePhotoUrl;

    private final String chatMediaDirectory;

    private final String chatMediaUrl;

    public WebMvcConfig(
            @Value("${app.upload.profile-photos-directory}")
            String profilePhotoDirectory,

            @Value("${app.upload.profile-photos-url}")
            String profilePhotoUrl,

            @Value("${app.upload.chat-media-directory}")
            String chatMediaDirectory,

            @Value("${app.upload.chat-media-url}")
            String chatMediaUrl
    ) {
        this.profilePhotoDirectory =
                profilePhotoDirectory;

        this.profilePhotoUrl =
                profilePhotoUrl;

        this.chatMediaDirectory =
                chatMediaDirectory;

        this.chatMediaUrl =
                chatMediaUrl;
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {
        addFileResourceHandler(
                registry,
                profilePhotoUrl,
                profilePhotoDirectory
        );

        addFileResourceHandler(
                registry,
                chatMediaUrl,
                chatMediaDirectory
        );
    }

    private void addFileResourceHandler(
            ResourceHandlerRegistry registry,
            String publicUrl,
            String directory
    ) {
        Path uploadDirectory =
                Paths.get(directory)
                        .toAbsolutePath()
                        .normalize();

        String resourceLocation =
                uploadDirectory
                        .toUri()
                        .toString();

        String urlPattern =
                publicUrl.endsWith("/")
                        ? publicUrl + "**"
                        : publicUrl + "/**";

        registry
                .addResourceHandler(
                        urlPattern
                )
                .addResourceLocations(
                        resourceLocation
                );
    }
}