package com.theholymatrimony.backend.verification.church;

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
public class ChurchProofStorageService {

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

    public ChurchProofStorageService(
            @Value(
                    "${app.upload.church-proofs-directory:uploads/private/church-proofs}"
            )
            String storageDirectory
    ) {

        this.storageDirectory =
                Paths.get(
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
                    "Unable to initialize church proof storage.",
                    exception
            );
        }
    }

    public StoredChurchProof store(
            MultipartFile file
    ) {

        validateFile(file);

        String originalFileName =
                sanitizeOriginalFileName(
                        file.getOriginalFilename()
                );

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        String storedFileName =
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        +
                        resolveExtension(
                                contentType
                        );

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
                    "Unable to store church verification proof.",
                    exception
            );
        }

        return new StoredChurchProof(
                originalFileName,
                storedFileName,
                contentType,
                file.getSize()
        );
    }

    public StoredFile load(
            String storedFileName
    ) {

        if (!StringUtils.hasText(storedFileName)) {
            throw new IllegalArgumentException(
                    "Stored file name is required."
            );
        }

        Path path =
                resolveSafePath(
                        storedFileName
                );

        if (
                !Files.exists(path) ||
                !Files.isRegularFile(path)
        ) {

            throw new IllegalStateException(
                    "Church verification proof was not found."
            );
        }

        return new StoredFile(path);
    }

    public void delete(
            String storedFileName
    ) {

        if (!StringUtils.hasText(storedFileName)) {
            return;
        }

        Path path =
                resolveSafePath(
                        storedFileName
                );

        try {

            Files.deleteIfExists(path);

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to delete church verification proof.",
                    exception
            );
        }
    }

    private void validateFile(
            MultipartFile file
    ) {

        if (
                file == null ||
                file.isEmpty() ||
                file.getSize() <= 0
        ) {

            throw new IllegalArgumentException(
                    "Church verification proof is required."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "Church verification proof must not exceed 5 MB."
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
                    "Only JPEG, PNG or PDF church verification proofs are allowed."
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
                        : "church-proof";

        value =
                Paths.get(value)
                        .getFileName()
                        .toString()
                        .replaceAll(
                                "[\\r\\n]",
                                ""
                        );

        if (value.length() > 255) {
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

        if (contentType == null) {
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
                            "Unsupported church proof file type."
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
                    "Invalid church proof path."
            );
        }

        return resolved;
    }

    public record StoredChurchProof(
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
