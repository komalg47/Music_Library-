package com.music_library.user_service.exception;

/**
 * Custom exception for duplicate resources.
 */
public class DuplicateResourceException extends RuntimeException {

    /**
     * Create exception with message.
     */
    public DuplicateResourceException(String message) {
        super(message);
    }

    /**
     * Create exception with message and cause.
     */
    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}