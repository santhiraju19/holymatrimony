package com.theholymatrimony.backend.profile.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

import java.io.IOException;
import java.io.InputStream;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoStorageService {

    private static final Set<String>
            ALLOWED_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private static final long
            MAXIMUM_FILE_SIZE =
            10L * 1024L * 1024L;

    private static final int
            MAXIMUM_IMAGE_DIMENSION =
            1600;

    private static final float
            JPEG_QUALITY =
            0.82f;

    private final Path storageDirectory;

    private final String publicUrlPrefix;

    public PhotoStorageService(
            @Value("${app.upload.profile-photos-directory}")
            String storageDirectory,

            @Value("${app.upload.profile-photos-url}")
            String publicUrlPrefix
    ) {

        this.storageDirectory =
                Paths.get(
                                storageDirectory
                        )
                        .toAbsolutePath()
                        .normalize();

        this.publicUrlPrefix =
                normalizePublicUrl(
                        publicUrlPrefix
                );

        try {

            Files.createDirectories(
                    this.storageDirectory
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Could not create profile photo directory",
                    exception
            );
        }
    }

    /*
     * ============================================================
     * Store Photo
     * ============================================================
     */

    public StoredPhoto store(
            MultipartFile file
    ) {

        validate(
                file
        );

        String originalFileName =
                StringUtils.cleanPath(
                        file.getOriginalFilename() == null
                                ? "photo"
                                : file.getOriginalFilename()
                );

        String contentType =
                file.getContentType()
                        .toLowerCase(
                                Locale.ROOT
                        );

        /*
         * WebP is already a compressed web format.
         *
         * Standard Java ImageIO does not provide reliable WebP
         * support without an additional codec, so preserve WebP
         * uploads as-is.
         */

        if (
                "image/webp".equals(
                        contentType
                )
        ) {

            return storeWebp(
                    file,
                    originalFileName
            );
        }

        /*
         * JPEG and PNG uploads are decoded, resized when necessary,
         * and normalized to compressed JPEG.
         */

        return storeOptimizedJpeg(
                file,
                originalFileName
        );
    }

    /*
     * ============================================================
     * Optimized JPEG Storage
     * ============================================================
     */

    private StoredPhoto storeOptimizedJpeg(
            MultipartFile file,
            String originalFileName
    ) {

        BufferedImage sourceImage;

        try (
                InputStream inputStream =
                        file.getInputStream()
        ) {

            sourceImage =
                    ImageIO.read(
                            inputStream
                    );

        } catch (IOException exception) {

            throw new IllegalArgumentException(
                    "Unable to read profile photo.",
                    exception
            );
        }

        if (
                sourceImage == null
        ) {

            throw new IllegalArgumentException(
                    "The uploaded file is not a valid image."
            );
        }

        BufferedImage optimizedImage =
                resizeImage(
                        sourceImage
                );

        String storedFileName =
                UUID.randomUUID()
                        + ".jpg";

        Path targetPath =
                resolveTargetPath(
                        storedFileName
                );

        writeJpeg(
                optimizedImage,
                targetPath
        );

        long storedSize;

        try {

            storedSize =
                    Files.size(
                            targetPath
                    );

        } catch (IOException exception) {

            deleteQuietly(
                    targetPath
            );

            throw new IllegalStateException(
                    "Could not determine stored profile photo size.",
                    exception
            );
        }

        return new StoredPhoto(
                originalFileName,
                storedFileName,
                buildPublicUrl(
                        storedFileName
                ),
                "image/jpeg",
                storedSize
        );
    }

    /*
     * ============================================================
     * WebP Storage
     * ============================================================
     */

    private StoredPhoto storeWebp(
            MultipartFile file,
            String originalFileName
    ) {

        String storedFileName =
                UUID.randomUUID()
                        + ".webp";

        Path targetPath =
                resolveTargetPath(
                        storedFileName
                );

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
                buildPublicUrl(
                        storedFileName
                ),
                "image/webp",
                file.getSize()
        );
    }

    /*
     * ============================================================
     * Resize
     * ============================================================
     */

    private BufferedImage resizeImage(
            BufferedImage source
    ) {

        int originalWidth =
                source.getWidth();

        int originalHeight =
                source.getHeight();

        if (
                originalWidth <=
                        MAXIMUM_IMAGE_DIMENSION
                        &&
                originalHeight <=
                        MAXIMUM_IMAGE_DIMENSION
        ) {

            return convertToRgb(
                    source
            );
        }

        double scale =
                Math.min(
                        (double)
                                MAXIMUM_IMAGE_DIMENSION
                                /
                                originalWidth,

                        (double)
                                MAXIMUM_IMAGE_DIMENSION
                                /
                                originalHeight
                );

        int targetWidth =
                Math.max(
                        1,
                        (int)
                                Math.round(
                                        originalWidth *
                                                scale
                                )
                );

        int targetHeight =
                Math.max(
                        1,
                        (int)
                                Math.round(
                                        originalHeight *
                                                scale
                                )
                );

        BufferedImage resized =
                new BufferedImage(
                        targetWidth,
                        targetHeight,
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                resized.createGraphics();

        try {

            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BICUBIC
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON
            );

            graphics.drawImage(
                    source,
                    0,
                    0,
                    targetWidth,
                    targetHeight,
                    null
            );

        } finally {

            graphics.dispose();
        }

        return resized;
    }

    /*
     * ============================================================
     * Convert To RGB
     * ============================================================
     */

    private BufferedImage convertToRgb(
            BufferedImage source
    ) {

        if (
                source.getType() ==
                        BufferedImage.TYPE_INT_RGB
        ) {

            return source;
        }

        BufferedImage rgbImage =
                new BufferedImage(
                        source.getWidth(),
                        source.getHeight(),
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                rgbImage.createGraphics();

        try {

            graphics.drawImage(
                    source,
                    0,
                    0,
                    null
            );

        } finally {

            graphics.dispose();
        }

        return rgbImage;
    }

    /*
     * ============================================================
     * JPEG Writer
     * ============================================================
     */

    private void writeJpeg(
            BufferedImage image,
            Path targetPath
    ) {

        Iterator<ImageWriter> writers =
                ImageIO.getImageWritersByFormatName(
                        "jpeg"
                );

        if (
                !writers.hasNext()
        ) {

            throw new IllegalStateException(
                    "JPEG image writer is not available."
            );
        }

        ImageWriter writer =
                writers.next();

        try (
                ImageOutputStream outputStream =
                        ImageIO.createImageOutputStream(
                                Files.newOutputStream(
                                        targetPath
                                )
                        )
        ) {

            writer.setOutput(
                    outputStream
            );

            ImageWriteParam writeParam =
                    writer.getDefaultWriteParam();

            if (
                    writeParam.canWriteCompressed()
            ) {

                writeParam.setCompressionMode(
                        ImageWriteParam.MODE_EXPLICIT
                );

                writeParam.setCompressionQuality(
                        JPEG_QUALITY
                );
            }

            writer.write(
                    null,
                    new IIOImage(
                            image,
                            null,
                            null
                    ),
                    writeParam
            );

        } catch (IOException exception) {

            deleteQuietly(
                    targetPath
            );

            throw new IllegalStateException(
                    "Could not store optimized profile photo.",
                    exception
            );

        } finally {

            writer.dispose();
        }
    }

    /*
     * ============================================================
     * Delete
     * ============================================================
     */

    public void delete(
            String storedFileName
    ) {

        if (
                storedFileName == null
                        ||
                storedFileName.isBlank()
        ) {

            return;
        }

        Path targetPath =
                resolveTargetPath(
                        storedFileName
                );

        try {

            Files.deleteIfExists(
                    targetPath
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Could not delete profile photo",
                    exception
            );
        }
    }

    /*
     * ============================================================
     * Validation
     * ============================================================
     */

    private void validate(
            MultipartFile file
    ) {

        if (
                file == null
                        ||
                file.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Photo file is required"
            );
        }

        String contentType =
                file.getContentType();

        if (
                contentType == null
                        ||
                !ALLOWED_TYPES.contains(
                        contentType.toLowerCase(
                                Locale.ROOT
                        )
                )
        ) {

            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WebP images are allowed"
            );
        }

        if (
                file.getSize() >
                        MAXIMUM_FILE_SIZE
        ) {

            throw new IllegalArgumentException(
                    "Photo size must not exceed 10 MB"
            );
        }
    }

    /*
     * ============================================================
     * Path Helpers
     * ============================================================
     */

    private Path resolveTargetPath(
            String storedFileName
    ) {

        Path targetPath =
                storageDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();

        if (
                !targetPath
                        .getParent()
                        .equals(
                                storageDirectory
                        )
        ) {

            throw new IllegalArgumentException(
                    "Invalid profile photo path"
            );
        }

        return targetPath;
    }

    private String normalizePublicUrl(
            String publicUrl
    ) {

        if (
                publicUrl == null
                        ||
                publicUrl.isBlank()
        ) {

            return "/uploads/profile-photos";
        }

        String normalized =
                publicUrl.trim();

        while (
                normalized.endsWith("/")
        ) {

            normalized =
                    normalized.substring(
                            0,
                            normalized.length() - 1
                    );
        }

        return normalized;
    }

    private String buildPublicUrl(
            String storedFileName
    ) {

        return publicUrlPrefix
                + "/"
                + storedFileName;
    }

    private void deleteQuietly(
            Path path
    ) {

        try {

            Files.deleteIfExists(
                    path
            );

        } catch (IOException ignored) {

            /*
             * Best-effort cleanup after storage failure.
             */
        }
    }

    /*
     * ============================================================
     * Result
     * ============================================================
     */

    public record StoredPhoto(
            String originalFileName,
            String storedFileName,
            String imageUrl,
            String contentType,
            long fileSize
    ) {
    }
}
