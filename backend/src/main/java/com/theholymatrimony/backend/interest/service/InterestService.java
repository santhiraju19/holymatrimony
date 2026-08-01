package com.theholymatrimony.backend.interest.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.common.exception.ResourceAlreadyExistsException;
import com.theholymatrimony.backend.interest.dto.InterestCountResponse;
import com.theholymatrimony.backend.interest.dto.InterestPageResponse;
import com.theholymatrimony.backend.interest.dto.InterestResponse;
import com.theholymatrimony.backend.interest.dto.InterestUserResponse;
import com.theholymatrimony.backend.interest.dto.SendInterestRequest;
import com.theholymatrimony.backend.interest.entity.Interest;
import com.theholymatrimony.backend.interest.enums.InterestStatus;
import com.theholymatrimony.backend.interest.repository.InterestRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.entity.ProfilePhoto;
import com.theholymatrimony.backend.profile.repository.ProfilePhotoRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InterestService {

    private final InterestRepository interestRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfilePhotoRepository profilePhotoRepository;

    /*
     * ============================================================
     * Send interest
     * ============================================================
     */

    public InterestResponse sendInterest(
            String authenticatedEmail,
            SendInterestRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Interest request is required"
            );
        }

        User sender = findUserByEmail(authenticatedEmail);

        Profile receiverProfile =
                findCompletedReceiverProfile(
                        request.getReceiverProfileId()
                );

        User receiver = receiverProfile.getUser();

        validateNotSelfInterest(
                sender.getId(),
                receiver.getId()
        );

        validateNoExistingInterest(
                sender.getId(),
                receiver.getId()
        );

        Interest interest = Interest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(InterestStatus.PENDING)
                .message(normalizeMessage(request.getMessage()))
                .build();

        Interest savedInterest =
                interestRepository.save(interest);

        Profile senderProfile =
                findProfileByUser(sender);

        return mapInterest(
                savedInterest,
                senderProfile,
                receiverProfile
        );
    }

    /*
     * ============================================================
     * Sent interests
     * ============================================================
     */

    @Transactional(readOnly = true)
    public InterestPageResponse getSentInterests(
            String authenticatedEmail,
            InterestStatus status,
            Pageable pageable
    ) {

        validatePageable(pageable);

        User authenticatedUser =
                findUserByEmail(authenticatedEmail);

        Page<Interest> interestPage;

        if (status == null) {
            interestPage =
                    interestRepository.findAllBySenderEmail(
                            authenticatedUser.getEmail(),
                            pageable
                    );
        } else {
            interestPage =
                    interestRepository
                            .findAllBySenderEmailAndStatus(
                                    authenticatedUser.getEmail(),
                                    status,
                                    pageable
                            );
        }

        return mapPage(interestPage);
    }

    /*
     * ============================================================
     * Received interests
     * ============================================================
     */

    @Transactional(readOnly = true)
    public InterestPageResponse getReceivedInterests(
            String authenticatedEmail,
            InterestStatus status,
            Pageable pageable
    ) {

        validatePageable(pageable);

        User authenticatedUser =
                findUserByEmail(authenticatedEmail);

        Page<Interest> interestPage;

        if (status == null) {
            interestPage =
                    interestRepository.findAllByReceiverEmail(
                            authenticatedUser.getEmail(),
                            pageable
                    );
        } else {
            interestPage =
                    interestRepository
                            .findAllByReceiverEmailAndStatus(
                                    authenticatedUser.getEmail(),
                                    status,
                                    pageable
                            );
        }

        return mapPage(interestPage);
    }

    /*
     * ============================================================
     * Accept interest
     * ============================================================
     */

    public InterestResponse acceptInterest(
            String authenticatedEmail,
            UUID interestId
    ) {

        User authenticatedUser =
                findUserByEmail(authenticatedEmail);

        Interest interest =
                findInterestById(interestId);

        validateReceiverOwnership(
                interest,
                authenticatedUser
        );

        validatePendingStatus(interest);

        interest.setStatus(
                InterestStatus.ACCEPTED
        );

        Interest savedInterest =
                interestRepository.save(interest);

        return mapInterest(savedInterest);
    }

    /*
     * ============================================================
     * Decline interest
     * ============================================================
     */

    public InterestResponse declineInterest(
            String authenticatedEmail,
            UUID interestId
    ) {

        User authenticatedUser =
                findUserByEmail(authenticatedEmail);

        Interest interest =
                findInterestById(interestId);

        validateReceiverOwnership(
                interest,
                authenticatedUser
        );

        validatePendingStatus(interest);

        interest.setStatus(
                InterestStatus.DECLINED
        );

        Interest savedInterest =
                interestRepository.save(interest);

        return mapInterest(savedInterest);
    }

    /*
     * ============================================================
     * Withdraw interest
     * ============================================================
     */

    public void withdrawInterest(
            String authenticatedEmail,
            UUID interestId
    ) {

        User authenticatedUser =
                findUserByEmail(authenticatedEmail);

        Interest interest =
                findInterestById(interestId);

        validateSenderOwnership(
                interest,
                authenticatedUser
        );

        validatePendingStatus(interest);

        interestRepository.delete(interest);
    }

    /*
     * ============================================================
     * Pending received count
     * ============================================================
     */

    @Transactional(readOnly = true)
    public InterestCountResponse getPendingReceivedCount(
            String authenticatedEmail
    ) {

        User authenticatedUser =
                findUserByEmail(authenticatedEmail);

        long pendingReceived =
                interestRepository
                        .countByReceiverEmailAndStatus(
                                authenticatedUser.getEmail(),
                                InterestStatus.PENDING
                        );

        return InterestCountResponse.builder()
                .pendingReceived(pendingReceived)
                .build();
    }

    /*
     * ============================================================
     * Entity lookup
     * ============================================================
     */

    private User findUserByEmail(
            String email
    ) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated email is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        return userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Authenticated user not found"
                        )
                );
    }

    private Interest findInterestById(
            UUID interestId
    ) {

        if (interestId == null) {
            throw new IllegalArgumentException(
                    "Interest ID is required"
            );
        }

        return interestRepository
                .findById(interestId)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Interest not found"
                        )
                );
    }

    private Profile findCompletedReceiverProfile(
            UUID profileId
    ) {

        if (profileId == null) {
            throw new IllegalArgumentException(
                    "Receiver profile ID is required"
            );
        }

        Profile profile =
                profileRepository
                        .findById(profileId)
                        .orElseThrow(
                                () -> new EntityNotFoundException(
                                        "Receiver profile not found"
                                )
                        );

        if (profile.getUser() == null) {
            throw new IllegalStateException(
                    "Receiver profile is not connected to a user"
            );
        }

        if (!Boolean.TRUE.equals(
                profile.getProfileCompleted()
        )) {
            throw new IllegalArgumentException(
                    "Interest can only be sent to a completed profile"
            );
        }

        return profile;
    }

    private Profile findProfileByUser(
            User user
    ) {

        if (user == null) {
            return null;
        }

        return profileRepository
                .findByUser(user)
                .orElse(null);
    }

    /*
     * ============================================================
     * Ownership validation
     * ============================================================
     */

    private void validateReceiverOwnership(
            Interest interest,
            User authenticatedUser
    ) {

        User receiver = interest.getReceiver();

        if (receiver == null
                || receiver.getId() == null
                || authenticatedUser == null
                || authenticatedUser.getId() == null
                || !receiver.getId().equals(
                        authenticatedUser.getId()
                )) {

            throw new AccessDeniedException(
                    "You are not authorized to update this received interest"
            );
        }
    }

    private void validateSenderOwnership(
            Interest interest,
            User authenticatedUser
    ) {

        User sender = interest.getSender();

        if (sender == null
                || sender.getId() == null
                || authenticatedUser == null
                || authenticatedUser.getId() == null
                || !sender.getId().equals(
                        authenticatedUser.getId()
                )) {

            throw new AccessDeniedException(
                    "You are not authorized to withdraw this interest"
            );
        }
    }

    /*
     * ============================================================
     * Interest validation
     * ============================================================
     */

    private void validateNotSelfInterest(
            UUID senderId,
            UUID receiverId
    ) {

        if (senderId == null || receiverId == null) {
            throw new IllegalArgumentException(
                    "Sender and receiver are required"
            );
        }

        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException(
                    "You cannot send interest to your own profile"
            );
        }
    }

    private void validateNoExistingInterest(
            UUID senderId,
            UUID receiverId
    ) {

        boolean directInterestExists =
                interestRepository
                        .existsBySenderIdAndReceiverId(
                                senderId,
                                receiverId
                        );

        if (directInterestExists) {
            throw new ResourceAlreadyExistsException(
                    "You have already sent interest to this profile"
            );
        }

        boolean reverseInterestExists =
                interestRepository
                        .existsBySenderIdAndReceiverId(
                                receiverId,
                                senderId
                        );

        if (reverseInterestExists) {
            throw new ResourceAlreadyExistsException(
                    "This profile has already sent interest to you"
            );
        }
    }

    private void validatePendingStatus(
            Interest interest
    ) {

        if (interest == null) {
            throw new IllegalArgumentException(
                    "Interest is required"
            );
        }

        if (interest.getStatus()
                != InterestStatus.PENDING) {

            throw new IllegalStateException(
                    "Only pending interests can be updated"
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

        if (pageable.getPageNumber() < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        if (pageable.getPageSize() <= 0) {
            throw new IllegalArgumentException(
                    "Page size must be greater than zero"
            );
        }

        if (pageable.getPageSize() > 100) {
            throw new IllegalArgumentException(
                    "Page size cannot exceed 100"
            );
        }
    }

    /*
     * ============================================================
     * Message normalization
     * ============================================================
     */

    private String normalizeMessage(
            String message
    ) {

        if (message == null) {
            return null;
        }

        String normalized = message.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }

    /*
     * ============================================================
     * Pagination mapping
     * ============================================================
     */

    private InterestPageResponse mapPage(
            Page<Interest> interestPage
    ) {

        List<InterestResponse> interests =
                interestPage
                        .getContent()
                        .stream()
                        .map(this::mapInterest)
                        .toList();

        return InterestPageResponse.builder()
                .interests(interests)
                .page(interestPage.getNumber())
                .size(interestPage.getSize())
                .totalElements(
                        interestPage.getTotalElements()
                )
                .totalPages(
                        interestPage.getTotalPages()
                )
                .first(interestPage.isFirst())
                .last(interestPage.isLast())
                .hasNext(interestPage.hasNext())
                .hasPrevious(
                        interestPage.hasPrevious()
                )
                .build();
    }

    /*
     * ============================================================
     * Interest response mapping
     * ============================================================
     */

    private InterestResponse mapInterest(
            Interest interest
    ) {

        Profile senderProfile =
                findProfileByUser(
                        interest.getSender()
                );

        Profile receiverProfile =
                findProfileByUser(
                        interest.getReceiver()
                );

        return mapInterest(
                interest,
                senderProfile,
                receiverProfile
        );
    }

    private InterestResponse mapInterest(
            Interest interest,
            Profile senderProfile,
            Profile receiverProfile
    ) {

        return InterestResponse.builder()
                .id(interest.getId())
                .sender(
                        mapUser(
                                interest.getSender(),
                                senderProfile
                        )
                )
                .receiver(
                        mapUser(
                                interest.getReceiver(),
                                receiverProfile
                        )
                )
                .status(interest.getStatus())
                .message(interest.getMessage())
                .createdAt(interest.getCreatedAt())
                .updatedAt(interest.getUpdatedAt())
                .build();
    }

    /*
     * ============================================================
     * User response mapping
     * ============================================================
     */

    private InterestUserResponse mapUser(
            User user,
            Profile profile
    ) {

        if (user == null) {
            return null;
        }

        ProfilePhoto primaryPhoto =
                profilePhotoRepository
                        .findFirstByUserIdAndPrimaryPhotoTrue(
                                user.getId()
                        )
                        .orElse(null);

        return InterestUserResponse.builder()
                .userId(user.getId())
                .profileId(
                        profile == null
                                ? null
                                : profile.getId()
                )
                .fullName(user.getFullName())
                .gender(
                        profile == null
                                ? null
                                : profile.getGender()
                )
                .age(
                        profile == null
                                ? null
                                : profile.getAge()
                )
                .denomination(
                        profile == null
                                ? null
                                : profile.getDenomination()
                )
                .profession(
                        profile == null
                                ? null
                                : profile.getProfession()
                )
                .city(
                        profile == null
                                ? null
                                : profile.getCity()
                )
                .state(
                        profile == null
                                ? null
                                : profile.getState()
                )
                .country(
                        profile == null
                                ? null
                                : profile.getCountry()
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
                .build();
    }
}