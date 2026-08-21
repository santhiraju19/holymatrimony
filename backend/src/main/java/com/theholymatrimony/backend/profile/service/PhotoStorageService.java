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

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;

import java.awt.geom.AffineTransform;

import java.awt.image.BufferedImage;

import java.io.IOException;
import java.io.InputStream;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoStorageService {

    /*
     * ============================================================
     * UPLOAD RULES
     * ============================================================
     */

    private static final Set<String>
            ALLOWED_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png"
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

    /*
     * ============================================================
     * WATERMARK
     * ============================================================
     */

    private static final String
            WATERMARK_PRIMARY =
            "HOLY MATRIMONY";

    private static final String
            WATERMARK_SECONDARY =
            "theholymatrimony.com";

    private static final float
            CENTER_WATERMARK_ALPHA =
            0.14f;

    private static final float
            CORNER_WATERMARK_ALPHA =
            0.72f;

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
     * STORE PHOTO
     * ============================================================
     */

    public StoredPhoto store(
            MultipartFile file
    ) {

        validate(file);

        String originalFileName =
                StringUtils.cleanPath(
                        file.getOriginalFilename() == null
                                ? "photo"
                                : file.getOriginalFilename()
                );

        /*
         * Every accepted upload follows the same secure pipeline:
         *
         * 1. Decode image
         * 2. Remove embedded metadata by re-rendering
         * 3. Resize when necessary
         * 4. Convert to RGB
         * 5. Apply permanent Holy Matrimony watermark
         * 6. Encode as JPEG
         * 7. Store using a random UUID filename
         */

        return storeProtectedJpeg(
                file,
                originalFileName
        );
    }

    /*
     * ============================================================
     * PROTECTED JPEG STORAGE
     * ============================================================
     */

    private StoredPhoto storeProtectedJpeg(
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

        BufferedImage protectedImage =
                applyWatermark(
                        optimizedImage
                );

        String storedFileName =
                UUID.randomUUID()
                        + ".jpg";

        Path targetPath =
                resolveTargetPath(
                        storedFileName
                );

        writeJpeg(
                protectedImage,
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
     * RESIZE + METADATA STRIPPING
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

            configureHighQualityGraphics(
                    graphics
            );

            /*
             * White background prevents transparent PNG areas
             * from becoming black after conversion to JPEG.
             */

            graphics.setColor(
                    Color.WHITE
            );

            graphics.fillRect(
                    0,
                    0,
                    targetWidth,
                    targetHeight
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
     * CONVERT TO RGB
     * ============================================================
     */

    private BufferedImage convertToRgb(
            BufferedImage source
    ) {

        BufferedImage rgbImage =
                new BufferedImage(
                        source.getWidth(),
                        source.getHeight(),
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                rgbImage.createGraphics();

        try {

            configureHighQualityGraphics(
                    graphics
            );

            graphics.setColor(
                    Color.WHITE
            );

            graphics.fillRect(
                    0,
                    0,
                    source.getWidth(),
                    source.getHeight()
            );

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
     * WATERMARK
     * ============================================================
     */

    private BufferedImage applyWatermark(
            BufferedImage source
    ) {

        BufferedImage protectedImage =
                new BufferedImage(
                        source.getWidth(),
                        source.getHeight(),
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                protectedImage.createGraphics();

        try {

            configureHighQualityGraphics(
                    graphics
            );

            graphics.drawImage(
                    source,
                    0,
                    0,
                    null
            );

            drawCenterWatermark(
                    graphics,
                    protectedImage.getWidth(),
                    protectedImage.getHeight()
            );

            drawCornerWatermark(
                    graphics,
                    protectedImage.getWidth(),
                    protectedImage.getHeight()
            );

        } finally {

            graphics.dispose();
        }

        return protectedImage;
    }

    /*
     * Large translucent watermark across the central area.
     *
     * This makes simple cropping substantially less useful while
     * keeping the member's photograph clearly visible.
     */

    private void drawCenterWatermark(
            Graphics2D graphics,
            int imageWidth,
            int imageHeight
    ) {

        int minimumDimension =
                Math.min(
                        imageWidth,
                        imageHeight
                );

        int fontSize =
                Math.max(
                        28,
                        Math.min(
                                86,
                                minimumDimension /
                                        10
                        )
                );

        Font watermarkFont =
                new Font(
                        Font.SANS_SERIF,
                        Font.BOLD,
                        fontSize
                );

        graphics.setFont(
                watermarkFont
        );

        graphics.setComposite(
                AlphaComposite.getInstance(
                        AlphaComposite.SRC_OVER,
                        CENTER_WATERMARK_ALPHA
                )
        );

        graphics.setColor(
                Color.WHITE
        );

        FontMetrics metrics =
                graphics.getFontMetrics(
                        watermarkFont
                );

        int textWidth =
                metrics.stringWidth(
                        WATERMARK_PRIMARY
                );

        AffineTransform originalTransform =
                graphics.getTransform();

        try {

            graphics.rotate(
                    Math.toRadians(
                            -24
                    ),
                    imageWidth /
                            2.0,
                    imageHeight /
                            2.0
            );

            int x =
                    (
                            imageWidth -
                                    textWidth
                    ) /
                            2;

            int y =
                    imageHeight /
                            2;

            /*
             * Dark shadow improves visibility on bright photos.
             */

            graphics.setColor(
                    Color.BLACK
            );

            graphics.drawString(
                    WATERMARK_PRIMARY,
                    x + 2,
                    y + 2
            );

            graphics.setColor(
                    Color.WHITE
            );

            graphics.drawString(
                    WATERMARK_PRIMARY,
                    x,
                    y
            );

        } finally {

            graphics.setTransform(
                    originalTransform
            );
        }
    }

    /*
     * Branded footer watermark.
     */

    private void drawCornerWatermark(
            Graphics2D graphics,
            int imageWidth,
            int imageHeight
    ) {

        int minimumDimension =
                Math.min(
                        imageWidth,
                        imageHeight
                );

        int primaryFontSize =
                Math.max(
                        15,
                        Math.min(
                                28,
                                minimumDimension /
                                        32
                        )
                );

        int secondaryFontSize =
                Math.max(
                        11,
                        Math.min(
                                20,
                                minimumDimension /
                                        44
                        )
                );

        int padding =
                Math.max(
                        16,
                        minimumDimension /
                                40
                );

        Font primaryFont =
                new Font(
                        Font.SANS_SERIF,
                        Font.BOLD,
                        primaryFontSize
                );

        Font secondaryFont =
                new Font(
                        Font.SANS_SERIF,
                        Font.PLAIN,
                        secondaryFontSize
                );

        graphics.setComposite(
                AlphaComposite.getInstance(
                        AlphaComposite.SRC_OVER,
                        CORNER_WATERMARK_ALPHA
                )
        );

        graphics.setFont(
                primaryFont
        );

        FontMetrics primaryMetrics =
                graphics.getFontMetrics(
                        primaryFont
                );

        graphics.setFont(
                secondaryFont
        );

        FontMetrics secondaryMetrics =
                graphics.getFontMetrics(
                        secondaryFont
                );

        int primaryWidth =
                primaryMetrics.stringWidth(
                        WATERMARK_PRIMARY
                );

        int secondaryWidth =
                secondaryMetrics.stringWidth(
                        WATERMARK_SECONDARY
                );

        int blockWidth =
                Math.max(
                        primaryWidth,
                        secondaryWidth
                );

        int blockHeight =
                primaryMetrics.getHeight()
                        +
                        secondaryMetrics.getHeight()
                        +
                        10;

        int blockX =
                imageWidth -
                        blockWidth -
                        (
                                padding *
                                        2
                        );

        int blockY =
                imageHeight -
                        blockHeight -
                        padding;

        blockX =
                Math.max(
                        padding,
                        blockX
                );

        blockY =
                Math.max(
                        padding,
                        blockY
                );

        /*
         * Semi-transparent dark panel.
         */

        graphics.setColor(
                new Color(
                        0,
                        0,
                        0,
                        130
                )
        );

        graphics.fillRoundRect(
                blockX,
                blockY,
                blockWidth +
                        padding,
                blockHeight,
                18,
                18
        );

        int textX =
                blockX +
                        (
                                padding /
                                        2
                        );

        int primaryBaseline =
                blockY +
                        primaryMetrics.getAscent()
                        +
                        6;

        graphics.setFont(
                primaryFont
        );

        graphics.setColor(
                Color.WHITE
        );

        graphics.drawString(
                WATERMARK_PRIMARY,
                textX,
                primaryBaseline
        );

        int secondaryBaseline =
                primaryBaseline +
                        secondaryMetrics.getHeight();

        graphics.setFont(
                secondaryFont
        );

        graphics.setColor(
                new Color(
                        235,
                        210,
                        120
                )
        );

        graphics.drawString(
                WATERMARK_SECONDARY,
                textX,
                secondaryBaseline
        );
    }

    /*
     * ============================================================
     * GRAPHICS QUALITY
     * ============================================================
     */

    private void configureHighQualityGraphics(
            Graphics2D graphics
    ) {

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

        graphics.setRenderingHint(
                RenderingHints.KEY_TEXT_ANTIALIASING,
                RenderingHints.VALUE_TEXT_ANTIALIAS_ON
        );
    }

    /*
     * ============================================================
     * JPEG WRITER
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

            /*
             * No source metadata object is supplied.
             *
             * This intentionally strips EXIF/GPS/camera metadata
             * from the member-facing image.
             */

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
                    "Could not store protected profile photo.",
                    exception
            );

        } finally {

            writer.dispose();
        }
    }

    /*
     * ============================================================
     * DELETE
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
     * VALIDATION
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
                    "Only JPEG and PNG profile photos are allowed"
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
     * PATH HELPERS
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
                            normalized.length() -
                                    1
                    );
        }

        return normalized;
    }

    private String buildPublicUrl(
            String storedFileName
    ) {

        return publicUrlPrefix
                +
                "/"
                +
                storedFileName;
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
     * RESULT
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