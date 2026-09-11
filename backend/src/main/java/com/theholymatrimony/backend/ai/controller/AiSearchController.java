package com.theholymatrimony.backend.ai.controller;

import com.theholymatrimony.backend.ai.dto.AiSearchInterpretationResponse;
import com.theholymatrimony.backend.ai.dto.AiSearchRequest;
import com.theholymatrimony.backend.ai.service.AiSearchService;
import com.theholymatrimony.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profiles/ai-search")
@RequiredArgsConstructor
public class AiSearchController {

    private final AiSearchService aiSearchService;

    @PostMapping("/interpret")
    public ResponseEntity<
            ApiResponse<AiSearchInterpretationResponse>
            > interpret(
            @Valid
            @RequestBody
            AiSearchRequest request
    ) {

        AiSearchInterpretationResponse result =
                aiSearchService.interpret(
                        request.getQuery()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Search interpreted",
                        result
                )
        );
    }
}
