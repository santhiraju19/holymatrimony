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

    private final CommunicationService communicationService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(
            Principal principal,
            @Valid @Payload SendMessageRequest request
    ) {
        String senderEmail =
                getAuthenticatedEmail(principal);

        MessageResponse savedMessage =
                communicationService.sendMessage(
                        senderEmail,
                        request
                );

        String receiverEmail =
                communicationService.getUserEmail(
                        request.getReceiverUserId()
                );

        messagingTemplate.convertAndSendToUser(
                receiverEmail,
                "/queue/messages",
                savedMessage
        );

        messagingTemplate.convertAndSendToUser(
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
        @Payload DeliveryReceiptRequest request
) {

    String receiverEmail =
            getAuthenticatedEmail(
                    principal
            );

    if (
            request == null ||
            request.messageId() == null
    ) {
        throw new IllegalArgumentException(
                "Message ID is required"
        );
    }

    MessageResponse updatedMessage =
            communicationService
                    .markMessageAsDelivered(
                            receiverEmail,
                            request.messageId()
                    );

    /*
     * Tell original sender that the receiver
     * has received the message.
     */
    String senderEmail =
            communicationService
                    .getUserEmail(
                            updatedMessage
                                    .getSenderId()
                    );

    messagingTemplate
            .convertAndSendToUser(
                    senderEmail,
                    "/queue/messages",
                    updatedMessage
            );

    /*
     * Also return it to the receiver so any
     * additional tabs/devices stay synchronized.
     */
    messagingTemplate
            .convertAndSendToUser(
                    receiverEmail,
                    "/queue/messages",
                    updatedMessage
            );
}


    @MessageMapping("/chat.typing")
    public void handleTyping(
            Principal principal,
            @Payload TypingEventRequest request
    ) {
        String senderEmail =
                getAuthenticatedEmail(principal);

        validateTypingRequest(request);

        String receiverEmail =
                communicationService.getUserEmail(
                        request.receiverUserId()
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

        messagingTemplate.convertAndSendToUser(
                receiverEmail,
                "/queue/typing",
                response
        );
    }

    @MessageExceptionHandler
    @SendToUser(
            destinations = "/queue/errors",
            broadcast = false
    )
    public WebSocketErrorResponse handleException(
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

    private void validateTypingRequest(
            TypingEventRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Typing event is required"
            );
        }

        if (request.conversationId() == null) {
            throw new IllegalArgumentException(
                    "Conversation ID is required"
            );
        }

        if (request.receiverUserId() == null) {
            throw new IllegalArgumentException(
                    "Receiver user ID is required"
            );
        }
    }

    private String getAuthenticatedEmail(
            Principal principal
    ) {
        if (
                principal == null ||
                !StringUtils.hasText(
                        principal.getName()
                )
        ) {
            throw new IllegalStateException(
                    "Authenticated WebSocket user is required"
            );
        }

        return principal.getName().trim();
    }

    public record TypingEventRequest(
            UUID conversationId,
            UUID receiverUserId,
            boolean typing
    ) {
    }
    public record DeliveryReceiptRequest(
        UUID messageId
) {
}

    public record TypingEventResponse(
            UUID conversationId,
            boolean typing
    ) {
    }

    public record WebSocketErrorResponse(
            boolean success,
            String message
    ) {
    }
}