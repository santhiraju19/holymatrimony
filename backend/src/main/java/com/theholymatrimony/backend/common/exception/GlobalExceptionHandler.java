package com.theholymatrimony.backend.common.exception;

import com.theholymatrimony.backend.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<Object> handleAlreadyExists(
            ResourceAlreadyExistsException ex) {

        return ApiResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .data(null)
                .build();
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleException(Exception ex) {

        return ApiResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .data(null)
                .build();
    }
}