package com.theholymatrimony.backend.communication.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.communication.dto.ConversationPageResponse;
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
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communication")
@RequiredArgsConstructor
public class CommunicationController {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final CommunicationService communicationService;

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<MessageResponse>>
    sendMessage(
            Authentication authentication,
            @Valid @RequestBody SendMessageRequest request
    ) {
        String senderEmail =
                getAuthenticatedEmail(authentication);

        MessageResponse response =
                communicationService.sendMessage(
                        senderEmail,
                        request
                );

        String receiverEmail =
                communicationService.getUserEmail(
                        response.getReceiverId()
                );

        /*
         * Broadcast the persisted database response.
         * The receiver sees it immediately.
         */
        messagingTemplate.convertAndSendToUser(
                receiverEmail,
                "/queue/messages",
                response
        );

        /*
         * Also echo the persisted response to the sender.
         */
        messagingTemplate.convertAndSendToUser(
                senderEmail,
                "/queue/messages",
                response
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Message sent successfully",
                                response
                        )
                );
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationPageResponse>>
    getConversations(
            Authentication authentication,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {
        ConversationPageResponse response =
                communicationService.getConversations(
                        getAuthenticatedEmail(authentication),
                        validatePage(page),
                        validateSize(size)
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<ApiResponse<MessagePageResponse>>
    getMessages(
            Authentication authentication,

            @PathVariable
            UUID conversationId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {
        MessagePageResponse response =
                communicationService.getMessages(
                        getAuthenticatedEmail(authentication),
                        conversationId,
                        validatePage(page),
                        validateSize(size)
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @PostMapping(
            "/conversations/{conversationId}/read"
    )
    public ResponseEntity<ApiResponse<Map<String, Integer>>>
    markConversationAsRead(
            Authentication authentication,

            @PathVariable
            UUID conversationId
    ) {
        int updatedMessages =
                communicationService
                        .markConversationAsRead(
                                getAuthenticatedEmail(authentication),
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

    @GetMapping("/unread-count")
    public ResponseEntity<
            ApiResponse<UnreadMessageCountResponse>
            >
    getUnreadCount(
            Authentication authentication
    ) {
        UnreadMessageCountResponse response =
                communicationService.getUnreadCount(
                        getAuthenticatedEmail(authentication)
                );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @GetMapping(
            "/conversations/{conversationId}/unread-count"
    )
    public ResponseEntity<
            ApiResponse<UnreadMessageCountResponse>
            >
    getConversationUnreadCount(
            Authentication authentication,

            @PathVariable
            UUID conversationId
    ) {
        UnreadMessageCountResponse response =
                communicationService
                        .getConversationUnreadCount(
                                getAuthenticatedEmail(authentication),
                                conversationId
                        );

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication
                .getName()
                .trim();
    }

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