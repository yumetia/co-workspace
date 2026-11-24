package com.coworkspace.common.exception;

import org.springframework.http.HttpStatus;

/** Règle métier non respectée (400), ex. créneau hors des horaires d'ouverture. */
public class BusinessException extends ApiException {

    public BusinessException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
