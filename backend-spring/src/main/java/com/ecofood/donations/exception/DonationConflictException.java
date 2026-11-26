package com.ecofood.donations.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DonationConflictException extends RuntimeException {

    public DonationConflictException(String message) {
        super(message);
    }

    public DonationConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
