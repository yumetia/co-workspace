package com.coworkspace.common.exception;

import org.springframework.http.HttpStatus;

/** Conflit avec l'état actuel des données (409), ex. email déjà utilisé, créneau déjà pris. */
public class ConflictException extends ApiException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
