package com.theholymatrimony.backend.profile.controller;

import com.theholymatrimony.backend.profile.dto.PhotoOrderRequest;
import com.theholymatrimony.backend.profile.dto.PhotoResponse;
import com.theholymatrimony.backend.profile.service.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    /**
     * Return all photos belonging to the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<PhotoResponse>> getMyPhotos(
            Authentication authentication
    ) {

        String email = authentication.getName();

        List<PhotoResponse> photos =
                photoService.getMyPhotos(email);

        return ResponseEntity.ok(photos);
    }

    /**
     * Upload one profile photo.
     */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PhotoResponse> uploadPhoto(
            Authentication authentication,

            @RequestPart("file")
            MultipartFile file
    ) {

        String email = authentication.getName();

        PhotoResponse uploadedPhoto =
                photoService.uploadPhoto(email, file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(uploadedPhoto);
    }

    /**
     * Delete one photo owned by the authenticated user.
     */
    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(
            Authentication authentication,

            @PathVariable
            UUID photoId
    ) {

        String email = authentication.getName();

        photoService.deletePhoto(email, photoId);

        return ResponseEntity.noContent().build();
    }

    /**
     * Make one photo the user's primary profile photo.
     */
    @PutMapping("/{photoId}/primary")
    public ResponseEntity<PhotoResponse> setPrimaryPhoto(
            Authentication authentication,

            @PathVariable
            UUID photoId
    ) {

        String email = authentication.getName();

        PhotoResponse photo =
                photoService.setPrimaryPhoto(
                        email,
                        photoId
                );

        return ResponseEntity.ok(photo);
    }

    /**
     * Update the display order of every photo.
     */
    @PutMapping("/order")
    public ResponseEntity<List<PhotoResponse>> reorderPhotos(
            Authentication authentication,

            @Valid
            @RequestBody
            PhotoOrderRequest request
    ) {

        String email = authentication.getName();

        List<PhotoResponse> photos =
                photoService.reorderPhotos(
                        email,
                        request.getPhotoIds()
                );

        return ResponseEntity.ok(photos);
    }
}