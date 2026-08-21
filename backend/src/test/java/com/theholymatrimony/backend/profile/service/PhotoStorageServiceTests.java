package com.theholymatrimony.backend.profile.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;

import java.io.ByteArrayOutputStream;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class PhotoStorageServiceTests {

    @TempDir
    Path tempDirectory;

    @Test
    void storesProtectedWatermarkedProfilePhoto()
            throws Exception {

        BufferedImage source =
                new BufferedImage(
                        2400,
                        1800,
                        BufferedImage.TYPE_INT_RGB
                );

        Graphics2D graphics =
                source.createGraphics();

        try {

            graphics.setColor(
                    new Color(
                            225,
                            235,
                            245
                    )
            );

            graphics.fillRect(
                    0,
                    0,
                    source.getWidth(),
                    source.getHeight()
            );

            graphics.setColor(
                    new Color(
                            80,
                            130,
                            190
                    )
            );

            graphics.fillOval(
                    500,
                    250,
                    1400,
                    1200
            );

        } finally {

            graphics.dispose();
        }

        ByteArrayOutputStream bytes =
                new ByteArrayOutputStream();

        assertTrue(
                ImageIO.write(
                        source,
                        "png",
                        bytes
                )
        );

        MockMultipartFile upload =
                new MockMultipartFile(
                        "file",
                        "profile-with-metadata-name.png",
                        "image/png",
                        bytes.toByteArray()
                );

        PhotoStorageService service =
                new PhotoStorageService(
                        tempDirectory.toString(),
                        "/uploads/profile-photos"
                );

        PhotoStorageService.StoredPhoto stored =
                service.store(
                        upload
                );

        /*
         * ========================================================
         * STORED FORMAT
         * ========================================================
         */

        assertEquals(
                "image/jpeg",
                stored.contentType()
        );

        assertTrue(
                stored.storedFileName()
                        .endsWith(
                                ".jpg"
                        )
        );

        /*
         * Public URL uses randomized filename.
         */

        assertEquals(
                "/uploads/profile-photos/"
                        +
                        stored.storedFileName(),
                stored.imageUrl()
        );

        assertFalse(
                stored.imageUrl()
                        .contains(
                                "profile-with-metadata-name"
                        )
        );

        /*
         * ========================================================
         * STORED FILE
         * ========================================================
         */

        Path storedPath =
                tempDirectory.resolve(
                        stored.storedFileName()
                );

        assertTrue(
                Files.exists(
                        storedPath
                )
        );

        assertEquals(
                Files.size(
                        storedPath
                ),
                stored.fileSize()
        );

        /*
         * ========================================================
         * READ PROTECTED IMAGE
         * ========================================================
         */

        BufferedImage result =
                ImageIO.read(
                        storedPath.toFile()
                );

        assertNotNull(
                result
        );

        /*
         * ========================================================
         * IMAGE DIMENSIONS
         * ========================================================
         */

        assertEquals(
                1600,
                result.getWidth()
        );

        assertEquals(
                1200,
                result.getHeight()
        );

        /*
         * JPEG must be opaque.
         */

        assertFalse(
                result.getColorModel()
                        .hasAlpha(),
                "Protected JPEG must not contain an alpha channel."
        );

        /*
         * ========================================================
         * WATERMARK VALIDATION
         * ========================================================
         *
         * The corner watermark includes a strong dark panel.
         * Search the lower-right section of the image for a
         * significant number of dark pixels.
         */

        int darkPixels = 0;

        int startX =
                (int) (
                        result.getWidth()
                                *
                                0.50
                );

        int startY =
                (int) (
                        result.getHeight()
                                *
                                0.65
                );

        for (
                int y = startY;
                y < result.getHeight();
                y += 3
        ) {

            for (
                    int x = startX;
                    x < result.getWidth();
                    x += 3
            ) {

                Color pixel =
                        new Color(
                                result.getRGB(
                                        x,
                                        y
                                )
                        );

                if (
                        pixel.getRed() < 150
                                &&
                        pixel.getGreen() < 150
                                &&
                        pixel.getBlue() < 150
                ) {

                    darkPixels++;
                }
            }
        }

        assertTrue(
                darkPixels > 50,
                "Expected visible Holy Matrimony watermark area."
        );

        System.out.println(
                "Original PNG bytes: "
                        +
                        upload.getSize()
        );

        System.out.println(
                "Protected JPEG bytes: "
                        +
                        stored.fileSize()
        );

        System.out.println(
                "Detected watermark dark pixels: "
                        +
                        darkPixels
        );
    }

    @Test
    void rejectsWebpBecauseItCannotBeSafelyWatermarked() {

        PhotoStorageService service =
                new PhotoStorageService(
                        tempDirectory.toString(),
                        "/uploads/profile-photos"
                );

        MockMultipartFile upload =
                new MockMultipartFile(
                        "file",
                        "profile.webp",
                        "image/webp",
                        new byte[]{
                                1,
                                2,
                                3,
                                4
                        }
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                service.store(
                                        upload
                                )
                );

        assertTrue(
                exception
                        .getMessage()
                        .contains(
                                "JPEG and PNG"
                        )
        );
    }
}