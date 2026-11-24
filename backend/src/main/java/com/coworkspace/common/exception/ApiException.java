package com.coworkspace.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception métier : porte le statut HTTP et un message lisible par l'utilisateur (en français).
 * Elle est convertie en réponse ProblemDetail par {@link GlobalExceptionHandler}.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
