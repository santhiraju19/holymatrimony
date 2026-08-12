package com.theholymatrimony.backend.communication.websocket;

import com.theholymatrimony.backend.communication.dto.MessageResponse;
import com.theholymatrimony.backend.communication.dto.SendMessageRequest;
import com.theholymatrimony.backend.communication.service.CommunicationService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;

import org.springframework.stereotype.Controller;

import org.springframework.util.StringUtils;

import org.springframework.validation.annotation.Validated;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@Controller
@Validated
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final CommunicationService
            communicationService;

    private final SimpMessagingTemplate
            messagingTemplate;


    /*
     * ============================================================
     * SEND MESSAGE
     * ============================================================
     */

    @MessageMapping("/chat.send")
    public void sendMessage(
            Principal principal,
            @Valid
            @Payload
            SendMessageRequest request
    ) {

        String senderEmail =
                getAuthenticatedEmail(
                        principal
                );

        MessageResponse savedMessage =
                communicationService
                        .sendMessage(
                                senderEmail,
                                request
                        );

        String receiverEmail =
                communicationService
                        .getUserEmail(
                                savedMessage
                                        .getReceiverId()
                        );

        /*
         * Send persisted message to receiver.
         *
         * Reply-to-message fields are already part
         * of MessageResponse, so no special WebSocket
         * payload is needed for replies.
         */
        messagingTemplate
                .convertAndSendToUser(
                        receiverEmail,
                        "/queue/messages",
                        savedMessage
                );

        /*
         * Echo persisted message to sender.
         */
        messagingTemplate
                .convertAndSendToUser(
                        senderEmail,
                        "/queue/messages",
                        savedMessage
                );
    }


    /*
     * ============================================================
     * MESSAGE DELIVERED RECEIPT
     * ============================================================
     */

    @MessageMapping("/chat.delivered")
    public void markMessageAsDelivered(
            Principal principal,
            @Payload
            DeliveryReceiptRequest request
    ) {

        String receiverEmail =
                getAuthenticatedEmail(
                        principal
                );

        validateDeliveryReceiptRequest(
                request
        );

        MessageResponse updatedMessage =
                communicationService
                        .markMessageAsDelivered(
                                receiverEmail,
                                request.messageId()
                        );

        String senderEmail =
                communicationService
                        .getUserEmail(
                                updatedMessage
                                        .getSenderId()
                        );

        /*
         * Tell the original sender the message
         * has reached the receiver.
         */
        messagingTemplate
                .convertAndSendToUser(
                        senderEmail,
                        "/queue/messages",
                        updatedMessage
                );

        /*
         * Keep all receiver tabs/devices synchronized.
         */
        messagingTemplate
                .convertAndSendToUser(
                        receiverEmail,
                        "/queue/messages",
                        updatedMessage
                );
    }


    /*
     * ============================================================
     * TYPING EVENT
     * ============================================================
     */

    @MessageMapping("/chat.typing")
    public void handleTyping(
            Principal principal,
            @Payload
            TypingEventRequest request
    ) {

        String senderEmail =
                getAuthenticatedEmail(
                        principal
                );

        validateTypingRequest(
                request
        );

        String receiverEmail =
                communicationService
                        .getUserEmail(
                                request
                                        .receiverUserId()
                        );

        log.info(
                "[Typing Backend] sender={}, receiver={}, conversationId={}, typing={}",
                senderEmail,
                receiverEmail,
                request.conversationId(),
                request.typing()
        );

        TypingEventResponse response =
                new TypingEventResponse(
                        request.conversationId(),
                        request.typing()
                );

        messagingTemplate
                .convertAndSendToUser(
                        receiverEmail,
                        "/queue/typing",
                        response
                );
    }


    /*
     * ============================================================
     * WEBSOCKET ERROR HANDLER
     * ============================================================
     */

    @MessageExceptionHandler
    @SendToUser(
            destinations = "/queue/errors",
            broadcast = false
    )
    public WebSocketErrorResponse
    handleException(
            Exception exception
    ) {

        log.error(
                "[Chat WebSocket] Request failed",
                exception
        );

        String message =
                StringUtils.hasText(
                        exception.getMessage()
                )
                        ? exception.getMessage()
                        : "Unable to process the WebSocket message";

        return new WebSocketErrorResponse(
                false,
                message
        );
    }


    /*
     * ============================================================
     * REQUEST VALIDATION
     * ============================================================
     */

    private void validateDeliveryReceiptRequest(
            DeliveryReceiptRequest request
    ) {

        if (
                request == null
        ) {

            throw new IllegalArgumentException(
                    "Delivery receipt is required"
            );
        }

        if (
                request.messageId()
                        == null
        ) {

            throw new IllegalArgumentException(
                    "Message ID is required"
            );
        }
    }


    private void validateTypingRequest(
            TypingEventRequest request
    ) {

        if (
                request == null
        ) {

            throw new IllegalArgumentException(
                    "Typing event is required"
            );
        }

        if (
                request.conversationId()
                        == null
        ) {

            throw new IllegalArgumentException(
                    "Conversation ID is required"
            );
        }

        if (
                request.receiverUserId()
                        == null
        ) {

            throw new IllegalArgumentException(
                    "Receiver user ID is required"
            );
        }
    }


    /*
     * ============================================================
     * AUTHENTICATED USER
     * ============================================================
     */

    private String getAuthenticatedEmail(
            Principal principal
    ) {

        if (
                principal == null
                        ||
                !StringUtils.hasText(
                        principal.getName()
                )
        ) {

            throw new IllegalArgumentException(
                    "Authenticated WebSocket user is required"
            );
        }

        return principal
                .getName()
                .trim();
    }


    /*
     * ============================================================
     * MESSAGE DELIVERY REQUEST
     * ============================================================
     */

    public record DeliveryReceiptRequest(
            UUID messageId
    ) {
    }


    /*
     * ============================================================
     * TYPING REQUEST / RESPONSE
     * ============================================================
     */

    public record TypingEventRequest(
            UUID conversationId,
            UUID receiverUserId,
            boolean typing
    ) {
    }


    public record TypingEventResponse(
            UUID conversationId,
            boolean typing
    ) {
    }


    /*
     * ============================================================
     * ERROR RESPONSE
     * ============================================================
     */

    public record WebSocketErrorResponse(
            boolean success,
            String message
    ) {
    }
}