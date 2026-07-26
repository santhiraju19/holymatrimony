package com.theholymatrimony.backend.profile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAXIMUM_FILE_SIZE =
            10L * 1024L * 1024L;

    private final Path storageDirectory;
    private final String publicUrlPrefix;

    public PhotoStorageService(
            @Value("${app.upload.profile-photos-directory}")
            String storageDirectory,

            @Value("${app.upload.profile-photos-url}")
            String publicUrlPrefix
    ) {
        this.storageDirectory = Paths.get(storageDirectory)
                .toAbsolutePath()
                .normalize();

        this.publicUrlPrefix = publicUrlPrefix;

        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not create profile photo directory",
                    exception
            );
        }
    }

    public StoredPhoto store(MultipartFile file) {

        validate(file);

        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? "photo"
                        : file.getOriginalFilename()
        );

        String extension =
                resolveExtension(file.getContentType());

        String storedFileName =
                UUID.randomUUID() + extension;

        Path targetPath = storageDirectory
                .resolve(storedFileName)
                .normalize();

        if (!targetPath.getParent().equals(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid profile photo path"
            );
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not store profile photo",
                    exception
            );
        }

        return new StoredPhoto(
                originalFileName,
                storedFileName,
                publicUrlPrefix + "/" + storedFileName,
                file.getContentType(),
                file.getSize()
        );
    }

    public void delete(String storedFileName) {

        if (storedFileName == null ||
                storedFileName.isBlank()) {
            return;
        }

        Path targetPath = storageDirectory
                .resolve(storedFileName)
                .normalize();

        if (!targetPath.getParent().equals(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid profile photo path"
            );
        }

        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not delete profile photo",
                    exception
            );
        }
    }

    private void validate(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Photo file is required"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_TYPES.contains(
                        contentType.toLowerCase(Locale.ROOT)
                )) {
            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WebP images are allowed"
            );
        }

        if (file.getSize() > MAXIMUM_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Photo size must not exceed 10 MB"
            );
        }
    }

    private String resolveExtension(String contentType) {

        if ("image/png".equalsIgnoreCase(contentType)) {
            return ".png";
        }

        if ("image/webp".equalsIgnoreCase(contentType)) {
            return ".webp";
        }

        return ".jpg";
    }

    public record StoredPhoto(
            String originalFileName,
            String storedFileName,
            String imageUrl,
            String contentType,
            long fileSize
    ) {
    }
}