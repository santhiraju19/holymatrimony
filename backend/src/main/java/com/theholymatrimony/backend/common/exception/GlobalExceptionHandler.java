package com.theholymatrimony.backend.common.exception;

import com.theholymatrimony.backend.auth.exception.InvalidRefreshTokenException;
import com.theholymatrimony.backend.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * 409 Conflict
     * Used when a record already exists, such as a duplicate email.
     */
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse handleResourceAlreadyExists(
            ResourceAlreadyExistsException exception
    ) {
        return buildResponse(exception.getMessage());
    }

    /*
     * 400 Bad Request
     * Handles @Valid request-body validation failures.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleValidationException(
            MethodArgumentNotValidException exception
    ) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Request validation failed.");

        return buildResponse(message);
    }

    /*
     * 400 Bad Request
     * Handles validation failures on request parameters and path variables.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleConstraintViolation(
            ConstraintViolationException exception
    ) {
        String message = exception.getConstraintViolations()
                .stream()
                .findFirst()
                .map(violation -> violation.getMessage())
                .orElse("Request validation failed.");

        return buildResponse(message);
    }

    /*
     * 401 Unauthorized
     * Handles invalid, expired, revoked, or missing refresh tokens.
     */
    @ExceptionHandler(InvalidRefreshTokenException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleInvalidRefreshToken(
            InvalidRefreshTokenException exception
    ) {
        return buildResponse(exception.getMessage());
    }

    /*
     * 401 Unauthorized
     * Handles incorrect login credentials.
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleBadCredentials(
            BadCredentialsException exception
    ) {
        return buildResponse(
                "Invalid email address or password."
        );
    }

    /*
     * 403 Forbidden
     * Handles authenticated users who do not have permission.
     */
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse handleAccessDenied(
            AccessDeniedException exception
    ) {
        return buildResponse(
                "You do not have permission to perform this action."
        );
    }

    /*
     * 405 Method Not Allowed
     * Example: GET request sent to a POST-only refresh endpoint.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ApiResponse handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception
    ) {
        String method = exception.getMethod();

        return buildResponse(
                "Request method '" + method + "' is not supported."
        );
    }

    /*
     * 500 Internal Server Error
     * Final fallback for unexpected server failures.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse handleUnexpectedException(
            Exception exception
    ) {
        return buildResponse(
                "An unexpected server error occurred."
        );
    }

    private ApiResponse buildResponse(
            String message
    ) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}