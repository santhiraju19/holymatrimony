package com.theholymatrimony.backend.shortlist.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.common.exception.ResourceAlreadyExistsException;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import com.theholymatrimony.backend.shortlist.dto.ShortlistCountResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistPageResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistResponse;
import com.theholymatrimony.backend.shortlist.dto.ShortlistStatusResponse;
import com.theholymatrimony.backend.shortlist.entity.Shortlist;
import com.theholymatrimony.backend.shortlist.repository.ShortlistRepository;

import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ShortlistService {

    private final ShortlistRepository shortlistRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfilePhotoRepository profilePhotoRepository;

    public ShortlistResponse addToShortlist(
            String authenticatedEmail,
            UUID profileId
    ) {
        User owner =
                findUserByEmail(
                        authenticatedEmail
                );

        Profile profile =
                findProfileById(profileId);

        validateProfileUser(profile);

        validateNotOwnProfile(
                owner,
                profile
        );

        if (
                shortlistRepository
                        .existsByOwnerIdAndProfileId(
                                owner.getId(),
                                profile.getId()
                        )
        ) {
            throw new ResourceAlreadyExistsException(
                    "This profile is already shortlisted"
            );
        }

        Shortlist shortlist =
                Shortlist.builder()
                        .owner(owner)
                        .profile(profile)
                        .build();

        Shortlist savedShortlist =
                shortlistRepository.save(
                        shortlist
                );

        return mapShortlist(
                savedShortlist
        );
    }

    public void removeFromShortlist(
            String authenticatedEmail,
            UUID profileId
    ) {
        User owner =
                findUserByEmail(
                        authenticatedEmail
                );

        Shortlist shortlist =
                shortlistRepository
                        .findByOwnerIdAndProfileId(
                                owner.getId(),
                                profileId
                        )
                        .orElseThrow(
                                () ->
                                        new EntityNotFoundException(
                                                "Shortlisted profile not found"
                                        )
                        );

        shortlistRepository.delete(
                shortlist
        );
    }

    @Transactional(readOnly = true)
    public ShortlistStatusResponse getStatus(
            String authenticatedEmail,
            UUID profileId
    ) {
        User owner =
                findUserByEmail(
                        authenticatedEmail
                );

        findProfileById(profileId);

        return shortlistRepository
                .findByOwnerIdAndProfileId(
                        owner.getId(),
                        profileId
                )
                .map(
                        shortlist ->
                                ShortlistStatusResponse
                                        .builder()
                                        .profileId(profileId)
                                        .shortlisted(true)
                                        .shortlistId(
                                                shortlist.getId()
                                        )
                                        .build()
                )
                .orElseGet(
                        () ->
                                ShortlistStatusResponse
                                        .builder()
                                        .profileId(profileId)
                                        .shortlisted(false)
                                        .build()
                );
    }

    @Transactional(readOnly = true)
    public ShortlistPageResponse getShortlists(
            String authenticatedEmail,
            Pageable pageable
    ) {
        validatePageable(pageable);

        User owner =
                findUserByEmail(
                        authenticatedEmail
                );

        Page<Shortlist> shortlistPage =
                shortlistRepository
                        .findAllByOwnerEmail(
                                owner.getEmail(),
                                pageable
                        );

        List<ShortlistResponse> shortlists =
                shortlistPage
                        .getContent()
                        .stream()
                        .map(this::mapShortlist)
                        .toList();

        return ShortlistPageResponse
                .builder()
                .shortlists(shortlists)
                .page(
                        shortlistPage.getNumber()
                )
                .size(
                        shortlistPage.getSize()
                )
                .totalElements(
                        shortlistPage
                                .getTotalElements()
                )
                .totalPages(
                        shortlistPage
                                .getTotalPages()
                )
                .first(
                        shortlistPage.isFirst()
                )
                .last(
                        shortlistPage.isLast()
                )
                .hasNext(
                        shortlistPage.hasNext()
                )
                .hasPrevious(
                        shortlistPage
                                .hasPrevious()
                )
                .build();
    }

    @Transactional(readOnly = true)
    public ShortlistCountResponse getCount(
            String authenticatedEmail
    ) {
        User owner =
                findUserByEmail(
                        authenticatedEmail
                );

        long count =
                shortlistRepository
                        .countByOwnerEmail(
                                owner.getEmail()
                        );

        return ShortlistCountResponse
                .builder()
                .totalShortlisted(count)
                .build();
    }

    private User findUserByEmail(
            String email
    ) {
        if (
                email == null ||
                email.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Authenticated email is required"
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase();

        return userRepository
                .findByEmail(
                        normalizedEmail
                )
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Authenticated user not found"
                                )
                );
    }

    private Profile findProfileById(
            UUID profileId
    ) {
        if (profileId == null) {
            throw new IllegalArgumentException(
                    "Profile ID is required"
            );
        }

        return profileRepository
                .findById(profileId)
                .orElseThrow(
                        () ->
                                new EntityNotFoundException(
                                        "Profile not found"
                                )
                );
    }

    private void validateProfileUser(
            Profile profile
    ) {
        if (
                profile == null ||
                profile.getUser() == null ||
                profile.getUser().getId() == null
        ) {
            throw new IllegalStateException(
                    "Profile is not connected to a user"
            );
        }
    }

    private void validateNotOwnProfile(
            User owner,
            Profile profile
    ) {
        if (
                owner.getId().equals(
                        profile.getUser().getId()
                )
        ) {
            throw new IllegalArgumentException(
                    "You cannot shortlist your own profile"
            );
        }
    }

    private void validatePageable(
            Pageable pageable
    ) {
        if (pageable == null) {
            throw new IllegalArgumentException(
                    "Pagination information is required"
            );
        }

        if (
                pageable.getPageNumber() < 0
        ) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        if (
                pageable.getPageSize() <= 0
        ) {
            throw new IllegalArgumentException(
                    "Page size must be greater than zero"
            );
        }

        if (
                pageable.getPageSize() > 100
        ) {
            throw new IllegalArgumentException(
                    "Page size cannot exceed 100"
            );
        }
    }

    private ShortlistResponse mapShortlist(
            Shortlist shortlist
    ) {
        Profile profile =
                shortlist.getProfile();

        User profileUser =
                profile.getUser();

        ProfilePhoto primaryPhoto =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                profileUser.getId()
                        )
                        .orElse(null);

        return ShortlistResponse
                .builder()
                .id(shortlist.getId())
                .profileId(profile.getId())
                .userId(profileUser.getId())
                .fullName(
                        profileUser.getFullName()
                )
                .gender(
                        profile.getGender()
                )
                .age(
                        profile.getAge()
                )
                .maritalStatus(
                        profile.getMaritalStatus()
                )
                .denomination(
                        profile.getDenomination()
                )
                .churchName(
                        profile.getChurchName()
                )
                .highestEducation(
                        profile.getHighestEducation()
                )
                .profession(
                        profile.getProfession()
                )
                .city(
                        profile.getCity()
                )
                .state(
                        profile.getState()
                )
                .country(
                        profile.getCountry()
                )
                .completionPercentage(
                        profile.getCompletionPercentage()
                )
                .primaryPhotoId(
                        primaryPhoto == null
                                ? null
                                : primaryPhoto.getId()
                )
                .primaryPhotoUrl(
                        primaryPhoto == null
                                ? null
                                : primaryPhoto.getImageUrl()
                )
                .createdAt(
                        shortlist.getCreatedAt()
                )
                .build();
    }
}