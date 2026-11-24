package com.coworkspace.common.exception;

import org.springframework.http.HttpStatus;

/** Identifiants invalides (401). */
public class AuthenticationFailedException extends ApiException {

    public AuthenticationFailedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
