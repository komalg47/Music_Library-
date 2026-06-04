package com.music_library.user_service.exception;

/**
 * Custom exception for resource not found.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Create exception with message.
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Create exception with message and cause.
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}