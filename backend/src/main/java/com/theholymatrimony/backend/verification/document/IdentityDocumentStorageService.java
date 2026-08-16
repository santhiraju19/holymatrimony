package com.theholymatrimony.backend.verification.document;

import lombok.Getter;

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
public class IdentityDocumentStorageService {

    private static final long MAX_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final Set<String>
            ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "application/pdf"
            );

    private final Path storageDirectory;

    public IdentityDocumentStorageService(
            @Value(
                    "${app.upload.identity-documents-directory:uploads/private/identity-documents}"
            )
            String storageDirectory
    ) {

        this.storageDirectory =
                Paths
                        .get(
                                storageDirectory
                        )
                        .toAbsolutePath()
                        .normalize();

        try {

            Files.createDirectories(
                    this.storageDirectory
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to initialize identity document storage.",
                    exception
            );
        }
    }

    public StoredIdentityDocument store(
            MultipartFile file
    ) {

        validateFile(
                file
        );

        String originalFileName =
                sanitizeOriginalFileName(
                        file.getOriginalFilename()
                );

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        String extension =
                resolveExtension(
                        contentType
                );

        String storedFileName =
                UUID.randomUUID()
                        .toString()
                        .replace(
                                "-",
                                ""
                        ) +
                        extension;

        Path target =
                resolveSafePath(
                        storedFileName
                );

        try {

            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to store identity document.",
                    exception
            );
        }

        return new StoredIdentityDocument(
                originalFileName,
                storedFileName,
                contentType,
                file.getSize()
        );
    }

    public StoredFile load(
            String storedFileName
    ) {

        if (
                !StringUtils.hasText(
                        storedFileName
                )
        ) {

            throw new IllegalArgumentException(
                    "Stored file name is required."
            );
        }

        Path path =
                resolveSafePath(
                        storedFileName
                );

        if (
                !Files.exists(
                        path
                ) ||
                !Files.isRegularFile(
                        path
                )
        ) {

            throw new IllegalStateException(
                    "Identity document file was not found."
            );
        }

        return new StoredFile(
                path
        );
    }

    public void delete(
            String storedFileName
    ) {

        if (
                !StringUtils.hasText(
                        storedFileName
                )
        ) {
            return;
        }

        Path path =
                resolveSafePath(
                        storedFileName
                );

        try {

            Files.deleteIfExists(
                    path
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to delete identity document.",
                    exception
            );
        }
    }

    private void validateFile(
            MultipartFile file
    ) {

        if (
                file == null ||
                file.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Identity document file is required."
            );
        }

        if (
                file.getSize() <= 0
        ) {

            throw new IllegalArgumentException(
                    "Identity document file is empty."
            );
        }

        if (
                file.getSize() >
                        MAX_FILE_SIZE
        ) {

            throw new IllegalArgumentException(
                    "Identity document must not exceed 5 MB."
            );
        }

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        if (
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType
                )
        ) {

            throw new IllegalArgumentException(
                    "Only JPEG, PNG or PDF identity documents are allowed."
            );
        }
    }

    private String sanitizeOriginalFileName(
            String originalFileName
    ) {

        String value =
                StringUtils.hasText(
                        originalFileName
                )
                        ? originalFileName.trim()
                        : "identity-document";

        value =
                Paths
                        .get(
                                value
                        )
                        .getFileName()
                        .toString();

        value =
                value.replaceAll(
                        "[\\r\\n]",
                        ""
                );

        if (
                value.length() > 255
        ) {

            value =
                    value.substring(
                            0,
                            255
                    );
        }

        return value;
    }

    private String normalizeContentType(
            String contentType
    ) {

        if (
                contentType == null
        ) {
            return "";
        }

        return contentType
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private String resolveExtension(
            String contentType
    ) {

        return switch (contentType) {

            case "image/jpeg" ->
                    ".jpg";

            case "image/png" ->
                    ".png";

            case "application/pdf" ->
                    ".pdf";

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported identity document type."
                    );
        };
    }

    private Path resolveSafePath(
            String storedFileName
    ) {

        Path resolved =
                storageDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();

        if (
                !resolved.startsWith(
                        storageDirectory
                )
        ) {

            throw new IllegalArgumentException(
                    "Invalid identity document path."
            );
        }

        return resolved;
    }

    public record StoredIdentityDocument(
            String originalFileName,
            String storedFileName,
            String contentType,
            long fileSize
    ) {
    }

    @Getter
    public static class StoredFile {

        private final Path path;

        public StoredFile(
                Path path
        ) {

            this.path = path;
        }
    }
}