package com.theholymatrimony.backend.common.exception;

import com.theholymatrimony.backend.auth.exception.InvalidRefreshTokenException;
import com.theholymatrimony.backend.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * 409 Conflict
     *
     * Used when a resource already exists.
     *
     * Examples:
     * - Duplicate email address
     * - Duplicate interest
     * - Duplicate profile record
     */
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse handleResourceAlreadyExists(
            ResourceAlreadyExistsException exception
    ) {
        return buildResponse(exception.getMessage());
    }

    /*
     * 409 Conflict
     *
     * Handles database constraint violations.
     *
     * Examples:
     * - Unique constraint violation
     * - Duplicate database record
     * - Foreign-key constraint violation
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse handleDataIntegrityViolation(
            DataIntegrityViolationException exception
    ) {
        return buildResponse(
                "The requested operation conflicts with existing data."
        );
    }

    /*
     * 400 Bad Request
     *
     * Handles invalid business-state transitions.
     *
     * Examples:
     * - Accepting an already accepted interest
     * - Declining an already declined interest
     * - Withdrawing a non-pending interest
     */
    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleIllegalStateException(
            IllegalStateException exception
    ) {
        return buildResponse(
                resolveMessage(
                        exception,
                        "The requested operation is not allowed in the current state."
                )
        );
    }

    /*
     * 400 Bad Request
     *
     * Handles invalid method arguments raised by application services.
     *
     * Examples:
     * - Invalid UUID-related application input
     * - Invalid status value
     * - Invalid pagination value
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleIllegalArgumentException(
            IllegalArgumentException exception
    ) {
        return buildResponse(
                resolveMessage(
                        exception,
                        "The request contains an invalid value."
                )
        );
    }

    /*
     * 400 Bad Request
     *
     * Handles @Valid request-body validation failures.
     *
     * Example:
     * A required DTO field is empty or incorrectly formatted.
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
                .map(error -> {
                    String defaultMessage = error.getDefaultMessage();

                    if (defaultMessage == null || defaultMessage.isBlank()) {
                        return "Invalid value for field '" +
                                error.getField() +
                                "'.";
                    }

                    return defaultMessage;
                })
                .orElse("Request validation failed.");

        return buildResponse(message);
    }

    /*
     * 400 Bad Request
     *
     * Handles validation failures on:
     * - Request parameters
     * - Path variables
     * - Controller method arguments
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
     * 400 Bad Request
     *
     * Handles malformed JSON request bodies.
     *
     * Examples:
     * - Missing quotation marks
     * - Invalid JSON syntax
     * - Invalid enum value
     * - Wrong value type
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception
    ) {
        return buildResponse(
                "The request body is missing, malformed, or contains an invalid value."
        );
    }

    /*
     * 400 Bad Request
     *
     * Handles path-variable and request-parameter type mismatches.
     *
     * Examples:
     * - Invalid UUID
     * - Text passed where a number is required
     * - Invalid enum request parameter
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException exception
    ) {
        String parameterName = exception.getName();

        return buildResponse(
                "Invalid value provided for parameter '" +
                        parameterName +
                        "'."
        );
    }

    /*
     * 401 Unauthorized
     *
     * Handles invalid, expired, revoked, or missing refresh tokens.
     */
    @ExceptionHandler(InvalidRefreshTokenException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleInvalidRefreshToken(
            InvalidRefreshTokenException exception
    ) {
        return buildResponse(
                resolveMessage(
                        exception,
                        "The refresh token is invalid or expired."
                )
        );
    }

    /*
     * 401 Unauthorized
     *
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
     * 401 Unauthorized
     *
     * Handles requests where authentication is required but no
     * authenticated user is available.
     */
    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleAuthenticationCredentialsNotFound(
            AuthenticationCredentialsNotFoundException exception
    ) {
        return buildResponse(
                "Authentication is required to access this resource."
        );
    }

    /*
     * 403 Forbidden
     *
     * Handles authenticated users who do not have permission
     * to perform the requested action.
     *
     * Examples:
     * - Sender tries to accept an interest
     * - User modifies another user's profile
     * - Non-admin accesses an admin endpoint
     */
  @ExceptionHandler(AccessDeniedException.class)
@ResponseStatus(HttpStatus.FORBIDDEN)
public ApiResponse handleAccessDenied(
        AccessDeniedException exception
) {
    return buildResponse(
            resolveMessage(
                    exception,
                    "You do not have permission to perform this action."
            )
    );
}

    /*
     * 405 Method Not Allowed
     *
     * Example:
     * A GET request is sent to a POST-only endpoint.
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ApiResponse handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception
    ) {
        String method = exception.getMethod();

        return buildResponse(
                "Request method '" +
                        method +
                        "' is not supported for this endpoint."
        );
    }

    /*
     * 500 Internal Server Error
     *
     * Final fallback for unexpected server failures.
     *
     * Do not expose exception details to API clients.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse handleUnexpectedException(
            Exception exception
    ) {
        /*
         * Temporary development logging.
         * This prints the complete exception in the backend console
         * while returning a safe message to the client.
         */
        exception.printStackTrace();

        return buildResponse(
                "An unexpected server error occurred."
        );
    }

    /*
     * Creates the standard Holy Matrimony API error response.
     */
    private ApiResponse buildResponse(
            String message
    ) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .build();
    }

    /*
     * Prevents null or blank exception messages from being returned.
     */
    private String resolveMessage(
            Exception exception,
            String fallbackMessage
    ) {
        String message = exception.getMessage();

        if (message == null || message.isBlank()) {
            return fallbackMessage;
        }

        return message;
    }
}