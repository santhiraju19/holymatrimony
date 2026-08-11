package com.theholymatrimony.backend.communication.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;

import com.theholymatrimony.backend.communication.dto.ConversationPageResponse;
import com.theholymatrimony.backend.communication.dto.EditMessageRequest;
import com.theholymatrimony.backend.communication.dto.MessagePageResponse;
import com.theholymatrimony.backend.communication.dto.MessageResponse;
import com.theholymatrimony.backend.communication.dto.SendMessageRequest;
import com.theholymatrimony.backend.communication.dto.UnreadMessageCountResponse;

import com.theholymatrimony.backend.communication.service.CommunicationService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communication")
@RequiredArgsConstructor
public class CommunicationController {

    private static final int DEFAULT_PAGE_SIZE = 20;

    private static final int MAX_PAGE_SIZE = 100;

    private final CommunicationService
            communicationService;

    private final SimpMessagingTemplate
            messagingTemplate;

    /*
     * ============================================================
     * SEND MESSAGE
     * ============================================================
     */

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageResponse>>
    sendMessage(
            Authentication authentication,

            @Valid
            @RequestBody
            SendMessageRequest request
    ) {

        String senderEmail =
                getAuthenticatedEmail(
                        authentication
                );

        MessageResponse response =
                communicationService
                        .sendMessage(
                                senderEmail,
                                request
                        );

        String receiverEmail =
                communicationService
                        .getUserEmail(
                                response.getReceiverId()
                        );

        /*
         * Receiver gets the persisted message immediately.
         */
        messagingTemplate
                .convertAndSendToUser(
                        receiverEmail,
                        "/queue/messages",
                        response
                );

        /*
         * Sender also receives the persisted response.
         *
         * This keeps multiple browser tabs/devices synchronized.
         */
        messagingTemplate
                .convertAndSendToUser(
                        senderEmail,
                        "/queue/messages",
                        response
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        ApiResponse.success(
                                "Message sent successfully",
                                response
                        )
                );
    }

    /*
     * ============================================================
     * EDIT MESSAGE
     * ============================================================
     */

    @PatchMapping(
            "/messages/{messageId}"
    )
    public ResponseEntity<ApiResponse<MessageResponse>>
    editMessage(
            Authentication authentication,

            @PathVariable
            UUID messageId,

            @Valid
            @RequestBody
            EditMessageRequest request
    ) {

        String senderEmail =
                getAuthenticatedEmail(
                        authentication
                );

        MessageResponse response =
                communicationService
                        .editMessage(
                                senderEmail,
                                messageId,
                                request.getContent()
                        );

        broadcastMessageUpdate(
                senderEmail,
                response
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Message edited successfully",
                        response
                )
        );
    }

    /*
     * ============================================================
     * DELETE MESSAGE FOR EVERYONE
     * ============================================================
     */

    @DeleteMapping(
            "/messages/{messageId}"
    )
    public ResponseEntity<ApiResponse<MessageResponse>>
    deleteMessageForEveryone(
            Authentication authentication,

            @PathVariable
            UUID messageId
    ) {

        String senderEmail =
                getAuthenticatedEmail(
                        authentication
                );

        MessageResponse response =
                communicationService
                        .deleteMessageForEveryone(
                                senderEmail,
                                messageId
                        );

        broadcastMessageUpdate(
                senderEmail,
                response
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Message deleted successfully",
                        response
                )
        );
    }

    /*
     * ============================================================
     * GET CONVERSATIONS
     * ============================================================
     */

    @GetMapping(
            "/conversations"
    )
    public ResponseEntity<
            ApiResponse<
                    ConversationPageResponse
            >
            >
    getConversations(
            Authentication authentication,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {

        ConversationPageResponse response =
                communicationService
                        .getConversations(
                                getAuthenticatedEmail(
                                        authentication
                                ),
                                validatePage(
                                        page
                                ),
                                validateSize(
                                        size
                                )
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    /*
     * ============================================================
     * GET MESSAGES
     * ============================================================
     */

    @GetMapping(
            "/messages/{conversationId}"
    )
    public ResponseEntity<
            ApiResponse<
                    MessagePageResponse
            >
            >
    getMessages(
            Authentication authentication,

            @PathVariable
            UUID conversationId,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "20"
            )
            int size
    ) {

        MessagePageResponse response =
                communicationService
                        .getMessages(
                                getAuthenticatedEmail(
                                        authentication
                                ),
                                conversationId,
                                validatePage(
                                        page
                                ),
                                validateSize(
                                        size
                                )
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    /*
     * ============================================================
     * MARK CONVERSATION AS READ
     * ============================================================
     */

    @PostMapping(
            "/conversations/{conversationId}/read"
    )
    public ResponseEntity<
            ApiResponse<
                    Map<String, Integer>
            >
            >
    markConversationAsRead(
            Authentication authentication,

            @PathVariable
            UUID conversationId
    ) {

        int updatedMessages =
                communicationService
                        .markConversationAsRead(
                                getAuthenticatedEmail(
                                        authentication
                                ),
                                conversationId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Messages marked as read",

                        Map.of(
                                "updatedMessages",
                                updatedMessages
                        )
                )
        );
    }

    /*
     * ============================================================
     * TOTAL UNREAD COUNT
     * ============================================================
     */

    @GetMapping(
            "/unread-count"
    )
    public ResponseEntity<
            ApiResponse<
                    UnreadMessageCountResponse
            >
            >
    getUnreadCount(
            Authentication authentication
    ) {

        UnreadMessageCountResponse response =
                communicationService
                        .getUnreadCount(
                                getAuthenticatedEmail(
                                        authentication
                                )
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    /*
     * ============================================================
     * CONVERSATION UNREAD COUNT
     * ============================================================
     */

    @GetMapping(
            "/conversations/{conversationId}/unread-count"
    )
    public ResponseEntity<
            ApiResponse<
                    UnreadMessageCountResponse
            >
            >
    getConversationUnreadCount(
            Authentication authentication,

            @PathVariable
            UUID conversationId
    ) {

        UnreadMessageCountResponse response =
                communicationService
                        .getConversationUnreadCount(
                                getAuthenticatedEmail(
                                        authentication
                                ),
                                conversationId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        response
                )
        );
    }

    /*
     * ============================================================
     * BROADCAST MESSAGE UPDATE
     * ============================================================
     *
     * Used by edit and delete.
     *
     * The receiver sees the change immediately.
     * The sender also receives it so additional
     * tabs/devices stay synchronized.
     */

    private void broadcastMessageUpdate(
            String senderEmail,
            MessageResponse response
    ) {

        String receiverEmail =
                communicationService
                        .getUserEmail(
                                response.getReceiverId()
                        );

        messagingTemplate
                .convertAndSendToUser(
                        receiverEmail,
                        "/queue/messages",
                        response
                );

        messagingTemplate
                .convertAndSendToUser(
                        senderEmail,
                        "/queue/messages",
                        response
                );
    }

    /*
     * ============================================================
     * AUTHENTICATED EMAIL
     * ============================================================
     */

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                !authentication
                        .isAuthenticated() ||
                authentication
                        .getName() == null ||
                authentication
                        .getName()
                        .isBlank()
        ) {

            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication
                .getName()
                .trim();
    }

    /*
     * ============================================================
     * PAGINATION
     * ============================================================
     */

    private int validatePage(
            int page
    ) {

        if (page < 0) {

            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        return page;
    }

    private int validateSize(
            int size
    ) {

        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }

        return Math.min(
                size,
                MAX_PAGE_SIZE
        );
    }
}