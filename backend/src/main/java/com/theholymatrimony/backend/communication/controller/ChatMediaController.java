
package com.theholymatrimony.backend.communication.controller;

import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.communication.dto.ChatMediaUploadResponse;
import com.theholymatrimony.backend.communication.service.ChatMediaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/communication/media")
@RequiredArgsConstructor
public class ChatMediaController {

    private final ChatMediaStorageService
            chatMediaStorageService;

    @PostMapping(
            value = "/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<
            ApiResponse<ChatMediaUploadResponse>
            > uploadImage(
            Authentication authentication,

            @RequestPart("file")
            MultipartFile file
    ) {
        getAuthenticatedEmail(
                authentication
        );

        ChatMediaStorageService.StoredChatMedia
                storedMedia =
                chatMediaStorageService
                        .storeImage(file);

        ChatMediaUploadResponse response =
                ChatMediaUploadResponse.builder()
                        .originalFileName(
                                storedMedia
                                        .originalFileName()
                        )
                        .storedFileName(
                                storedMedia
                                        .storedFileName()
                        )
                        .mediaUrl(
                                storedMedia
                                        .mediaUrl()
                        )
                        .contentType(
                                storedMedia
                                        .contentType()
                        )
                        .fileSize(
                                storedMedia
                                        .fileSize()
                        )
                        .messageType(
                                "IMAGE"
                        )
                        .build();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Chat image uploaded successfully",
                        response
                )
        );
    }

    private String getAuthenticatedEmail(
            Authentication authentication
    ) {
        if (
                authentication == null ||
                !authentication.isAuthenticated() ||
                !StringUtils.hasText(
                        authentication.getName()
                )
        ) {
            throw new IllegalStateException(
                    "Authenticated user is required"
            );
        }

        return authentication
                .getName()
                .trim();
    }
}