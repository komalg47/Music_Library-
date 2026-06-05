package com.music_library.admin_service.exception;

/**
 * Custom exception for invalid requests.
 */
public class InvalidRequestException extends RuntimeException {

    /**
     * Create exception with message.
     */
    public InvalidRequestException(String message) {
        super(message);
    }

    /**
     * Create exception with message and cause.
     */
    public InvalidRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}