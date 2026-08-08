package com.theholymatrimony.backend.auth.exception;

public class AccountStatusException
        extends RuntimeException {

    public AccountStatusException(
            String message
    ) {
        super(message);
    }
}