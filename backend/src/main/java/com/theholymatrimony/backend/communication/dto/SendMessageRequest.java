package com.theholymatrimony.backend.communication.dto;

import com.theholymatrimony.backend.communication.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;



@Getter
@Setter
@NoArgsConstructor
public class SendMessageRequest {

    @NotNull(message = "Receiver user ID is required")
    private UUID receiverUserId;

    @Size(
            max = 2000,
            message = "Message cannot exceed 2000 characters"
    )
    private String content;

    @Size(
            max = 1000,
            message = "Media URL cannot exceed 1000 characters"
    )
    private String mediaUrl;

    private MessageType messageType;

    private UUID replyToMessageId;
}