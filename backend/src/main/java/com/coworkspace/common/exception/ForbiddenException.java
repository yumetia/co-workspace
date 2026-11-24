package com.coworkspace.common.exception;

import org.springframework.http.HttpStatus;

/** Action interdite pour cet utilisateur (403). */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
