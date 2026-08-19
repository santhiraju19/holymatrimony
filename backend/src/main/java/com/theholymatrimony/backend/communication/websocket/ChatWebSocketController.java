package com.theholymatrimony.backend.communication.websocket;

import com.theholymatrimony.backend.communication.dto.MessageResponse;
import com.theholymatrimony.backend.communication.dto.SendMessageRequest;
import com.theholymatrimony.backend.communication.service.CommunicationService;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeatureRequiredException;

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

        /*
         * CommunicationService performs all authoritative
         * messaging validation, including:
         *
         * - membership CHAT entitlement
         * - blocked-user safety rules
         * - accepted-interest requirement
         * - message validation
         *
         * Keeping those rules in the shared service protects
         * both REST and WebSocket message sends.
         */
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
         * Deliver persisted message to receiver.
         */
        messagingTemplate
                .convertAndSendToUser(
                        receiverEmail,
                        "/queue/messages",
                        savedMessage
                );

        /*
         * Echo persisted message to sender.
         *
         * This keeps multiple tabs/devices synchronized and
         * ensures the sender receives the authoritative
         * persisted representation.
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
         * Tell the original sender that the message
         * reached the receiver.
         */
        messagingTemplate
                .convertAndSendToUser(
                        senderEmail,
                        "/queue/messages",
                        updatedMessage
                );

        /*
         * Keep receiver tabs/devices synchronized.
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
     *
     * REST requests are handled by GlobalExceptionHandler.
     *
     * STOMP/WebSocket messages use this handler instead.
     *
     * MembershipFeatureRequiredException represents an expected
     * business restriction, not a backend failure, so it is logged
     * at INFO rather than ERROR.
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

        /*
         * Membership entitlement failures are normal
         * user-facing business events.
         *
         * Example:
         *
         * "Upgrade your membership to access chat."
         */
        if (
                exception instanceof
                        MembershipFeatureRequiredException
        ) {

            log.info(
                    "[Chat WebSocket] Membership upgrade required: {}",
                    resolveExceptionMessage(
                            exception
                    )
            );

        } else {

            /*
             * Unexpected WebSocket failures remain visible
             * with the complete stack trace.
             */
            log.error(
                    "[Chat WebSocket] Request failed",
                    exception
            );
        }

        String message =
                resolveExceptionMessage(
                        exception
                );

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
     * EXCEPTION MESSAGE
     * ============================================================
     */

    private String resolveExceptionMessage(
            Exception exception
    ) {

        if (
                exception != null
                        &&
                StringUtils.hasText(
                        exception.getMessage()
                )
        ) {

            return exception
                    .getMessage()
                    .trim();
        }

        return "Unable to process the WebSocket message";
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
