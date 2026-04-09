package com.codingexample.firstProject.exception;

import java.time.Instant;
import java.util.Map;

public class ApiError {
    private Instant timestamp = Instant.now();
    private int status;
    private String message;
    private Map<String, String> validationErrors;

    public ApiError(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public ApiError(int status, String message, Map<String, String> validationErrors) {
        this.status = status;
        this.message = message;
        this.validationErrors = validationErrors;
    }

    public Instant getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public Map<String, String> getValidationErrors() { return validationErrors; }
}