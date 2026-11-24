package com.coworkspace.common.exception;

import org.springframework.http.HttpStatus;

/** Ressource introuvable (404). */
public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
