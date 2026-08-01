
package com.theholymatrimony.backend.communication.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatMediaUploadResponse {

    private String originalFileName;

    private String storedFileName;

    private String mediaUrl;

    private String contentType;

    private long fileSize;

    private String messageType;
}