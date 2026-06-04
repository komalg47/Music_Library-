package com.music_library.user_service.exception;

/**
 * Custom exception for authentication failures.
 */
public class AuthenticationException extends RuntimeException {

    /**
     * Create exception with message.
     */
    public AuthenticationException(String message) {
        super(message);
    }

    /**
     * Create exception with message and cause.
     */
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}