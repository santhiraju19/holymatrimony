package com.theholymatrimony.backend.communication.dto;

import com.theholymatrimony.backend.communication.enums.MessageStatus;
import com.theholymatrimony.backend.communication.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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

    private UUID replyToMessageId;

private UUID replyToSenderId;

private String replyToContent;

private String replyToMediaUrl;

private MessageType replyToMessageType;

private Boolean replyToDeletedForEveryone;

}