
package com.theholymatrimony.backend.safety.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;

import com.theholymatrimony.backend.communication.entity.Conversation;
import com.theholymatrimony.backend.communication.repository.ConversationRepository;

import com.theholymatrimony.backend.safety.dto.BlockStatusResponse;
import com.theholymatrimony.backend.safety.dto.ReportUserRequest;
import com.theholymatrimony.backend.safety.dto.UserReportResponse;

import com.theholymatrimony.backend.safety.entity.UserBlock;
import com.theholymatrimony.backend.safety.entity.UserReport;

import com.theholymatrimony.backend.safety.enums.ReportStatus;

import com.theholymatrimony.backend.safety.repository.UserBlockRepository;
import com.theholymatrimony.backend.safety.repository.UserReportRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SafetyService {

    private final UserRepository
            userRepository;

    private final ConversationRepository
            conversationRepository;

    private final UserBlockRepository
            userBlockRepository;

    private final UserReportRepository
            userReportRepository;


    /*
     * ============================================================
     * BLOCK USER
     * ============================================================
     */

    @Transactional
    public BlockStatusResponse blockUser(
            String authenticatedEmail,
            UUID targetUserId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        User targetUser =
                getUserById(
                        targetUserId
                );

        validateDifferentUsers(
                currentUser,
                targetUser
        );

        boolean alreadyBlocked =
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserId(
                                currentUser.getId(),
                                targetUser.getId()
                        );

        if (!alreadyBlocked) {

            UserBlock block =
                    UserBlock.builder()
                            .blocker(
                                    currentUser
                            )
                            .blockedUser(
                                    targetUser
                            )
                            .build();

            userBlockRepository.save(
                    block
            );
        }

        return getBlockStatus(
                authenticatedEmail,
                targetUserId
        );
    }


    /*
     * ============================================================
     * UNBLOCK USER
     * ============================================================
     */

    @Transactional
    public BlockStatusResponse unblockUser(
            String authenticatedEmail,
            UUID targetUserId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        User targetUser =
                getUserById(
                        targetUserId
                );

        validateDifferentUsers(
                currentUser,
                targetUser
        );

        userBlockRepository
                .findByBlockerIdAndBlockedUserId(
                        currentUser.getId(),
                        targetUser.getId()
                )
                .ifPresent(
                        userBlockRepository::delete
                );

        /*
         * Flush the DELETE before calculating the new status.
         *
         * This prevents the subsequent existence query from
         * observing stale persistence state.
         */
        userBlockRepository.flush();

        return buildBlockStatus(
                currentUser,
                targetUser
        );
    }


    /*
     * ============================================================
     * BLOCK STATUS
     * ============================================================
     */

    @Transactional(
            readOnly = true
    )
    public BlockStatusResponse getBlockStatus(
            String authenticatedEmail,
            UUID targetUserId
    ) {

        User currentUser =
                getUserByEmail(
                        authenticatedEmail
                );

        User targetUser =
                getUserById(
                        targetUserId
                );

        validateDifferentUsers(
                currentUser,
                targetUser
        );

        return buildBlockStatus(
                currentUser,
                targetUser
        );
    }


    /*
     * ============================================================
     * REPORT USER
     * ============================================================
     */

    @Transactional
    public UserReportResponse reportUser(
            String authenticatedEmail,
            UUID targetUserId,
            ReportUserRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Report request is required"
            );
        }

        User reporter =
                getUserByEmail(
                        authenticatedEmail
                );

        User reportedUser =
                getUserById(
                        targetUserId
                );

        validateDifferentUsers(
                reporter,
                reportedUser
        );

        Conversation conversation =
                resolveConversation(
                        reporter,
                        reportedUser,
                        request.getConversationId()
                );

        String details =
                normalizeDetails(
                        request.getDetails()
                );

        UserReport report =
                UserReport.builder()
                        .reporter(
                                reporter
                        )
                        .reportedUser(
                                reportedUser
                        )
                        .conversation(
                                conversation
                        )
                        .reason(
                                request.getReason()
                        )
                        .details(
                                details
                        )
                        .status(
                                ReportStatus.PENDING
                        )
                        .build();

        UserReport saved =
                userReportRepository.save(
                        report
                );

        return mapReportResponse(
                saved
        );
    }


    /*
     * ============================================================
     * MESSAGING SAFETY CHECK
     * ============================================================
     *
     * This will be called by CommunicationService before a new
     * message is persisted.
     *
     * Messaging is unavailable if EITHER user has blocked the
     * other user.
     */

    @Transactional(
            readOnly = true
    )
    public void validateMessagingAllowed(
            UUID firstUserId,
            UUID secondUserId
    ) {

        if (
                firstUserId == null ||
                secondUserId == null
        ) {

            throw new IllegalArgumentException(
                    "Both user IDs are required"
            );
        }

        if (
                firstUserId.equals(
                        secondUserId
                )
        ) {

            throw new IllegalArgumentException(
                    "Users must be different"
            );
        }

        boolean blocked =
                isMessagingBlocked(
                        firstUserId,
                        secondUserId
                );

        if (blocked) {

            /*
             * Intentionally neutral.
             *
             * Do not reveal which user created the block.
             */
            throw new AccessDeniedException(
                    "Messaging is currently unavailable."
            );
        }
    }


    /*
     * ============================================================
     * INTERNAL BLOCK STATUS
     * ============================================================
     */

    private BlockStatusResponse buildBlockStatus(
            User currentUser,
            User targetUser
    ) {

        UUID currentUserId =
                currentUser.getId();

        UUID targetUserId =
                targetUser.getId();

        boolean blockedByMe =
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserId(
                                currentUserId,
                                targetUserId
                        );

        boolean messagingBlocked =
                blockedByMe ||
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserId(
                                targetUserId,
                                currentUserId
                        );

        return BlockStatusResponse
                .builder()
                .userId(
                        targetUserId
                )
                .blockedByMe(
                        blockedByMe
                )
                .messagingBlocked(
                        messagingBlocked
                )
                .build();
    }


    private boolean isMessagingBlocked(
            UUID firstUserId,
            UUID secondUserId
    ) {

        return userBlockRepository
                .existsByBlockerIdAndBlockedUserId(
                        firstUserId,
                        secondUserId
                )
                ||
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserId(
                                secondUserId,
                                firstUserId
                        );
    }


    /*
     * ============================================================
     * CONVERSATION VALIDATION
     * ============================================================
     */

    private Conversation resolveConversation(
            User reporter,
            User reportedUser,
            UUID conversationId
    ) {

        if (conversationId == null) {
            return null;
        }

        Conversation conversation =
                conversationRepository
                        .findById(
                                conversationId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Conversation not found"
                                        )
                        );

        UUID reporterId =
                reporter.getId();

        UUID reportedUserId =
                reportedUser.getId();

        UUID participantOneId =
                conversation
                        .getParticipantOne()
                        .getId();

        UUID participantTwoId =
                conversation
                        .getParticipantTwo()
                        .getId();

        boolean correctParticipants =
                (
                        participantOneId.equals(
                                reporterId
                        )
                        &&
                        participantTwoId.equals(
                                reportedUserId
                        )
                )
                ||
                (
                        participantOneId.equals(
                                reportedUserId
                        )
                        &&
                        participantTwoId.equals(
                                reporterId
                        )
                );

        if (!correctParticipants) {

            throw new AccessDeniedException(
                    "The selected conversation does not belong to these users."
            );
        }

        return conversation;
    }


    /*
     * ============================================================
     * USER HELPERS
     * ============================================================
     */

    private User getUserByEmail(
            String email
    ) {

        if (
                email == null ||
                email.isBlank()
        ) {

            throw new AccessDeniedException(
                    "Authenticated user is required"
            );
        }

        return userRepository
                .findByEmail(
                        email.trim()
                )
                .orElseThrow(
                        () ->
                                new AccessDeniedException(
                                        "Authenticated user was not found"
                                )
                );
    }


    private User getUserById(
            UUID userId
    ) {

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return userRepository
                .findById(
                        userId
                )
                .orElseThrow(
                        () ->
                                new IllegalArgumentException(
                                        "User not found"
                                )
                );
    }


    private void validateDifferentUsers(
            User currentUser,
            User targetUser
    ) {

        if (
                currentUser
                        .getId()
                        .equals(
                                targetUser.getId()
                        )
        ) {

            throw new IllegalArgumentException(
                    "You cannot perform this action on your own account"
            );
        }
    }


    /*
     * ============================================================
     * REPORT HELPERS
     * ============================================================
     */

    private String normalizeDetails(
            String details
    ) {

        if (details == null) {
            return null;
        }

        String normalized =
                details.trim();

        if (normalized.isEmpty()) {
            return null;
        }

        return normalized;
    }


    private UserReportResponse mapReportResponse(
            UserReport report
    ) {

        UUID conversationId =
                report.getConversation() == null
                        ? null
                        : report
                                .getConversation()
                                .getId();

        return UserReportResponse
                .builder()
                .id(
                        report.getId()
                )
                .reportedUserId(
                        report
                                .getReportedUser()
                                .getId()
                )
                .conversationId(
                        conversationId
                )
                .reason(
                        report.getReason()
                )
                .details(
                        report.getDetails()
                )
                .status(
                        report.getStatus()
                )
                .createdAt(
                        report.getCreatedAt()
                )
                .build();
    }
}