package com.theholymatrimony.backend.common.exception;

import com.theholymatrimony.backend.auth.exception.AccountStatusException;
import com.theholymatrimony.backend.auth.exception.InvalidRefreshTokenException;
import com.theholymatrimony.backend.common.response.ApiResponse;
import com.theholymatrimony.backend.membership.entitlement.MembershipFeatureRequiredException;

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
     * ============================================================
     * 409 CONFLICT
     * ============================================================
     */

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse handleResourceAlreadyExists(
            ResourceAlreadyExistsException exception
    ) {

        return buildResponse(
                exception.getMessage()
        );
    }

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
     * ============================================================
     * 400 BAD REQUEST
     * ============================================================
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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleValidationException(
            MethodArgumentNotValidException exception
    ) {

        String message =
                exception
                        .getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .findFirst()
                        .map(error -> {

                            String defaultMessage =
                                    error.getDefaultMessage();

                            if (
                                    defaultMessage == null
                                    || defaultMessage.isBlank()
                            ) {
                                return "Invalid value for field '"
                                        + error.getField()
                                        + "'.";
                            }

                            return defaultMessage;
                        })
                        .orElse(
                                "Request validation failed."
                        );

        return buildResponse(
                message
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleConstraintViolation(
            ConstraintViolationException exception
    ) {

        String message =
                exception
                        .getConstraintViolations()
                        .stream()
                        .findFirst()
                        .map(
                                violation ->
                                        violation.getMessage()
                        )
                        .orElse(
                                "Request validation failed."
                        );

        return buildResponse(
                message
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleHttpMessageNotReadable(
            HttpMessageNotReadableException exception
    ) {

        return buildResponse(
                "The request body is missing, malformed, or contains an invalid value."
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException exception
    ) {

        String parameterName =
                exception.getName();

        return buildResponse(
                "Invalid value provided for parameter '"
                        + parameterName
                        + "'."
        );
    }

    /*
     * ============================================================
     * 401 UNAUTHORIZED
     * ============================================================
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

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse handleBadCredentials(
            BadCredentialsException exception
    ) {

        return buildResponse(
                "Invalid email address or password."
        );
    }

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
     * ============================================================
     * 403 FORBIDDEN
     * ============================================================
     */

    /*
     * Membership entitlement failure.
     *
     * This handler MUST appear separately from AccessDeniedException
     * because membership restrictions are business entitlements,
     * not general authorization failures.
     */
    @ExceptionHandler(MembershipFeatureRequiredException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse handleMembershipFeatureRequired(
            MembershipFeatureRequiredException exception
    ) {

        return buildResponse(
                resolveMessage(
                        exception,
                        "Upgrade your membership to access this feature."
                )
        );
    }

    /*
     * General authorization failure.
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
     * Account suspended, blocked, deactivated,
     * or otherwise unavailable.
     */
    @ExceptionHandler(AccountStatusException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse handleAccountStatusException(
            AccountStatusException exception
    ) {

        return buildResponse(
                resolveMessage(
                        exception,
                        "Your account is not currently active."
                )
        );
    }

    /*
     * ============================================================
     * 405 METHOD NOT ALLOWED
     * ============================================================
     */

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ApiResponse handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception
    ) {

        String method =
                exception.getMethod();

        return buildResponse(
                "Request method '"
                        + method
                        + "' is not supported for this endpoint."
        );
    }

    /*
     * ============================================================
     * 500 INTERNAL SERVER ERROR
     * ============================================================
     */

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse handleUnexpectedException(
            Exception exception
    ) {

        /*
         * Temporary development logging.
         *
         * Keep this while actively developing so unexpected
         * exceptions remain visible in the backend console.
         *
         * The exception details themselves are never returned
         * to the API client.
         */
        exception.printStackTrace();

        return buildResponse(
                "An unexpected server error occurred."
        );
    }

    /*
     * ============================================================
     * RESPONSE HELPERS
     * ============================================================
     */

    private ApiResponse buildResponse(
            String message
    ) {

        return ApiResponse
                .builder()
                .success(false)
                .message(message)
                .build();
    }

    private String resolveMessage(
            Exception exception,
            String fallbackMessage
    ) {

        String message =
                exception.getMessage();

        if (
                message == null
                || message.isBlank()
        ) {
            return fallbackMessage;
        }

        return message;
    }
}
