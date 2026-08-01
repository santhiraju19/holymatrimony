package com.theholymatrimony.backend.communication.dto;

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
public class ConversationResponse {

    private UUID id;

    private ConversationUserResponse otherUser;

    private String lastMessage;

    private UUID lastMessageSenderId;

    private LocalDateTime lastMessageAt;

    private long unreadCount;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}