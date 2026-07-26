package com.theholymatrimony.backend.profile.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.profile.dto.PhotoResponse;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PhotoService {

    private static final int MAXIMUM_PHOTOS = 6;

    private final ProfilePhotoRepository photoRepository;
    private final UserRepository userRepository;
    private final PhotoStorageService storageService;

    @Transactional(readOnly = true)
    public List<PhotoResponse> getMyPhotos(String email) {

        return photoRepository
                .findAllByUserEmailOrderByDisplayOrderAsc(email)
                .stream()
                .map(this::map)
                .toList();
    }

    public PhotoResponse uploadPhoto(
            String email,
            MultipartFile file
    ) {

        long currentPhotoCount =
                photoRepository.countByUserEmail(email);

        if (currentPhotoCount >= MAXIMUM_PHOTOS) {
            throw new IllegalArgumentException(
                    "A maximum of 6 profile photos is allowed"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "User not found"
                        )
                );

        PhotoStorageService.StoredPhoto storedPhoto =
                storageService.store(file);

        boolean firstPhoto = currentPhotoCount == 0;

        Integer maximumDisplayOrder =
                photoRepository.findMaximumDisplayOrder(email);

        int nextDisplayOrder =
                maximumDisplayOrder == null
                        ? 0
                        : maximumDisplayOrder + 1;

        ProfilePhoto photo = ProfilePhoto.builder()
                .user(user)
                .fileName(storedPhoto.originalFileName())
                .storedFileName(
                        storedPhoto.storedFileName()
                )
                .imageUrl(storedPhoto.imageUrl())
                .contentType(storedPhoto.contentType())
                .fileSize(storedPhoto.fileSize())
                .primaryPhoto(firstPhoto)
                .displayOrder(nextDisplayOrder)
                .build();

        try {
            ProfilePhoto savedPhoto =
                    photoRepository.save(photo);

            return map(savedPhoto);
        } catch (RuntimeException exception) {
            storageService.delete(
                    storedPhoto.storedFileName()
            );

            throw exception;
        }
    }

    public void deletePhoto(
            String email,
            UUID photoId
    ) {

        ProfilePhoto photo =
                getOwnedPhoto(email, photoId);

        boolean wasPrimary =
                Boolean.TRUE.equals(
                        photo.getPrimaryPhoto()
                );

        String storedFileName =
                photo.getStoredFileName();

        photoRepository.delete(photo);
        photoRepository.flush();

        storageService.delete(storedFileName);

        if (wasPrimary) {
            photoRepository
                    .findAllByUserEmailOrderByDisplayOrderAsc(
                            email
                    )
                    .stream()
                    .findFirst()
                    .ifPresent(nextPhoto -> {
                        nextPhoto.setPrimaryPhoto(true);
                        photoRepository.save(nextPhoto);
                    });
        }

        normalizeDisplayOrder(email);
    }

    public PhotoResponse setPrimaryPhoto(
            String email,
            UUID photoId
    ) {

        ProfilePhoto selectedPhoto =
                getOwnedPhoto(email, photoId);

        photoRepository.clearPrimaryPhotoForUser(email);

        selectedPhoto.setPrimaryPhoto(true);

        ProfilePhoto savedPhoto =
                photoRepository.save(selectedPhoto);

        return map(savedPhoto);
    }

    public List<PhotoResponse> reorderPhotos(
            String email,
            List<UUID> photoIds
    ) {

        List<ProfilePhoto> existingPhotos =
                photoRepository
                        .findAllByUserEmailOrderByDisplayOrderAsc(
                                email
                        );

        validatePhotoOrder(
                photoIds,
                existingPhotos
        );

        for (
                int index = 0;
                index < photoIds.size();
                index++
        ) {

            UUID photoId = photoIds.get(index);

            ProfilePhoto photo =
                    existingPhotos.stream()
                            .filter(
                                    item ->
                                            item.getId()
                                                    .equals(photoId)
                            )
                            .findFirst()
                            .orElseThrow();

            photo.setDisplayOrder(index);
        }

        photoRepository.saveAll(existingPhotos);

        return getMyPhotos(email);
    }

    private void validatePhotoOrder(
            List<UUID> photoIds,
            List<ProfilePhoto> existingPhotos
    ) {

        if (photoIds == null ||
                photoIds.size() != existingPhotos.size()) {
            throw new IllegalArgumentException(
                    "Photo order must contain every photo"
            );
        }

        long uniquePhotoCount =
                photoIds.stream()
                        .distinct()
                        .count();

        if (uniquePhotoCount != photoIds.size()) {
            throw new IllegalArgumentException(
                    "Photo order contains duplicate photos"
            );
        }

        for (UUID photoId : photoIds) {

            boolean ownedByUser =
                    existingPhotos.stream()
                            .anyMatch(
                                    photo ->
                                            photo.getId()
                                                    .equals(photoId)
                            );

            if (!ownedByUser) {
                throw new IllegalArgumentException(
                        "Photo order contains an invalid photo"
                );
            }
        }
    }

    private ProfilePhoto getOwnedPhoto(
            String email,
            UUID photoId
    ) {

        return photoRepository
                .findByIdAndUserEmail(photoId, email)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Profile photo not found"
                        )
                );
    }

    private void normalizeDisplayOrder(String email) {

        List<ProfilePhoto> photos =
                photoRepository
                        .findAllByUserEmailOrderByDisplayOrderAsc(
                                email
                        );

        for (
                int index = 0;
                index < photos.size();
                index++
        ) {
            photos.get(index)
                    .setDisplayOrder(index);
        }

        photoRepository.saveAll(photos);
    }

    private PhotoResponse map(ProfilePhoto photo) {

        return PhotoResponse.builder()
                .id(photo.getId())
                .fileName(photo.getFileName())
                .imageUrl(photo.getImageUrl())
                .contentType(photo.getContentType())
                .fileSize(photo.getFileSize())
                .primaryPhoto(
                        photo.getPrimaryPhoto()
                )
                .displayOrder(
                        photo.getDisplayOrder()
                )
                .createdAt(photo.getCreatedAt())
                .build();
    }
}