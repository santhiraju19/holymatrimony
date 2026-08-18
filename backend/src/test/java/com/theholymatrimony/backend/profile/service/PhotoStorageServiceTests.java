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
    void optimizesLargePngAsJpeg()
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

            for (
                    int y = 0;
                    y < source.getHeight();
                    y++
            ) {

                int red =
                        (y * 255)
                                /
                        source.getHeight();

                graphics.setColor(
                        new Color(
                                red,
                                120,
                                200
                        )
                );

                graphics.drawLine(
                        0,
                        y,
                        source.getWidth(),
                        y
                );
            }

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
                        "large-profile.png",
                        "image/png",
                        bytes.toByteArray()
                );

        PhotoStorageService service =
                new PhotoStorageService(
                        tempDirectory.toString(),
                        "/uploads/profile-photos"
                );

        PhotoStorageService.StoredPhoto
                stored =
                service.store(
                        upload
                );

        assertEquals(
                "image/jpeg",
                stored.contentType()
        );

        assertTrue(
                stored.storedFileName()
                        .endsWith(".jpg")
        );

        assertEquals(
                "/uploads/profile-photos/"
                        +
                stored.storedFileName(),
                stored.imageUrl()
        );

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

        BufferedImage result =
                ImageIO.read(
                        storedPath.toFile()
                );

        assertNotNull(
                result
        );

        assertTrue(
                result.getWidth()
                        <=
                1600
        );

        assertTrue(
                result.getHeight()
                        <=
                1600
        );

        assertEquals(
                1600,
                result.getWidth()
        );

        assertEquals(
                1200,
                result.getHeight()
        );

        System.out.println(
                "Original PNG bytes: "
                        +
                upload.getSize()
        );

        System.out.println(
                "Optimized JPEG bytes: "
                        +
                stored.fileSize()
        );
    }
}
