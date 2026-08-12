
package com.theholymatrimony.backend.communication.dto;

import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private UUID id;

    private UUID conversationId;

    private UUID senderId;

    private UUID receiverId;

    private String content;

    private String mediaUrl;

    private MessageType messageType;

    private MessageStatus status;

    private LocalDateTime deliveredAt;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime editedAt;

    private Boolean deletedForEveryone;

    private LocalDateTime deletedAt;

    /*
     * ============================================================
     * REPLY SNAPSHOT
     * ============================================================
     */

    private UUID replyToMessageId;

    private UUID replyToSenderId;

    private String replyToContent;

    private String replyToMediaUrl;

    private MessageType replyToMessageType;

    private Boolean replyToDeletedForEveryone;

    /*
     * ============================================================
     * MESSAGE REACTIONS
     * ============================================================
     *
     * Contains the current reactions for this message.
     *
     * Each user can have at most one reaction on a message.
     */

    @Builder.Default
    private List<MessageReactionResponse> reactions =
            List.of();
}