package com.theholymatrimony.backend.notification.service;

public class NotificationNotFoundException
        extends RuntimeException {

    public NotificationNotFoundException(
            String message
    ) {
        super(message);
    }
}
