
package com.theholymatrimony.backend.communication.service;

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
public class ChatMediaStorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private static final long MAXIMUM_IMAGE_SIZE =
            10L * 1024L * 1024L;

    private final Path storageDirectory;

    private final String publicUrlPrefix;

    public ChatMediaStorageService(
            @Value("${app.upload.chat-media-directory}")
            String storageDirectory,

            @Value("${app.upload.chat-media-url}")
            String publicUrlPrefix
    ) {
        if (!StringUtils.hasText(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Chat media directory is required"
            );
        }

        if (!StringUtils.hasText(publicUrlPrefix)) {
            throw new IllegalArgumentException(
                    "Chat media URL is required"
            );
        }

        this.storageDirectory =
                Paths.get(storageDirectory)
                        .toAbsolutePath()
                        .normalize();

        this.publicUrlPrefix =
                normalizeUrlPrefix(publicUrlPrefix);

        try {
            Files.createDirectories(
                    this.storageDirectory
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not create chat media directory",
                    exception
            );
        }
    }

    public StoredChatMedia storeImage(
            MultipartFile file
    ) {
        validateImage(file);

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        String originalFileName =
                resolveOriginalFileName(file);

        String extension =
                resolveImageExtension(
                        contentType
                );

        String storedFileName =
                UUID.randomUUID() +
                        extension;

        Path targetPath =
                storageDirectory
                        .resolve(storedFileName)
                        .normalize();

        validateTargetPath(targetPath);

        try {
            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not store chat image",
                    exception
            );
        }

        return new StoredChatMedia(
                originalFileName,
                storedFileName,
                publicUrlPrefix +
                        "/" +
                        storedFileName,
                contentType,
                file.getSize()
        );
    }

    public void delete(
            String storedFileName
    ) {
        if (!StringUtils.hasText(storedFileName)) {
            return;
        }

        String safeFileName =
                Paths.get(storedFileName)
                        .getFileName()
                        .toString();

        Path targetPath =
                storageDirectory
                        .resolve(safeFileName)
                        .normalize();

        validateTargetPath(targetPath);

        try {
            Files.deleteIfExists(
                    targetPath
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not delete chat media",
                    exception
            );
        }
    }

    private void validateImage(
            MultipartFile file
    ) {
        if (
                file == null ||
                file.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "Image file is required"
            );
        }

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        if (
                !ALLOWED_IMAGE_TYPES.contains(
                        contentType
                )
        ) {
            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WebP images are allowed"
            );
        }

        if (
                file.getSize() >
                MAXIMUM_IMAGE_SIZE
        ) {
            throw new IllegalArgumentException(
                    "Chat image size must not exceed 10 MB"
            );
        }
    }

    private void validateTargetPath(
            Path targetPath
    ) {
        if (
                targetPath.getParent() == null ||
                !targetPath
                        .getParent()
                        .equals(
                                storageDirectory
                        )
        ) {
            throw new IllegalArgumentException(
                    "Invalid chat media path"
            );
        }
    }

    private String resolveOriginalFileName(
            MultipartFile file
    ) {
        String originalFileName =
                file.getOriginalFilename();

        if (!StringUtils.hasText(originalFileName)) {
            return "image";
        }

        String cleanedFileName =
                StringUtils.cleanPath(
                        originalFileName
                );

        return Paths.get(cleanedFileName)
                .getFileName()
                .toString();
    }

    private String normalizeContentType(
            String contentType
    ) {
        if (!StringUtils.hasText(contentType)) {
            return "";
        }

        return contentType
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String normalizeUrlPrefix(
            String value
    ) {
        String normalized =
                value.trim();

        while (
                normalized.endsWith("/") &&
                normalized.length() > 1
        ) {
            normalized =
                    normalized.substring(
                            0,
                            normalized.length() - 1
                    );
        }

        return normalized;
    }

    private String resolveImageExtension(
            String contentType
    ) {
        return switch (contentType) {
            case "image/png" ->
                    ".png";

            case "image/webp" ->
                    ".webp";

            default ->
                    ".jpg";
        };
    }

    public record StoredChatMedia(
            String originalFileName,
            String storedFileName,
            String mediaUrl,
            String contentType,
            long fileSize
    ) {
    }
}