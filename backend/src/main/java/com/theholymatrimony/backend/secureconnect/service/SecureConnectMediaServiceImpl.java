package com.theholymatrimony.backend.secureconnect.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.safety.repository.UserBlockRepository;
import com.theholymatrimony.backend.secureconnect.dto.SecureConnectMediaCredentials;
import com.theholymatrimony.backend.secureconnect.entity.SecureConnectCallSession;
import com.theholymatrimony.backend.secureconnect.enums.CallStatus;
import com.theholymatrimony.backend.secureconnect.provider.CallProvider;
import com.theholymatrimony.backend.secureconnect.repository.SecureConnectCallSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class SecureConnectMediaServiceImpl
        implements SecureConnectMediaService {

    private final UserRepository userRepository;
    private final SecureConnectCallSessionRepository callSessionRepository;
    private final UserBlockRepository userBlockRepository;
    private final CallProvider callProvider;

    public SecureConnectMediaServiceImpl(
            UserRepository userRepository,
            SecureConnectCallSessionRepository callSessionRepository,
            UserBlockRepository userBlockRepository,
            CallProvider callProvider
    ) {
        this.userRepository =
                userRepository;

        this.callSessionRepository =
                callSessionRepository;

        this.userBlockRepository =
                userBlockRepository;

        this.callProvider =
                callProvider;
    }

    @Override
    @Transactional
    public SecureConnectMediaCredentials createCredentials(
            String authenticatedEmail,
            UUID callId
    ) {
        if (!StringUtils.hasText(
                authenticatedEmail
        )) {
            throw new IllegalArgumentException(
                    "Authenticated user is required."
            );
        }

        if (callId == null) {
            throw new IllegalArgumentException(
                    "Call ID is required."
            );
        }

        User authenticatedUser =
                userRepository
                        .findByEmail(
                                authenticatedEmail.trim()
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Authenticated user was not found."
                                        )
                        );

        SecureConnectCallSession call =
                callSessionRepository
                        .findForUpdate(callId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Secure Connect call was not found."
                                        )
                        );

        User caller =
                call.getCaller();

        User callee =
                call.getCallee();

        if (caller == null
                || callee == null
                || caller.getId() == null
                || callee.getId() == null) {
            throw new IllegalStateException(
                    "Secure Connect call participants are invalid."
            );
        }

        UUID authenticatedUserId =
                authenticatedUser.getId();

        boolean participant =
                caller
                        .getId()
                        .equals(
                                authenticatedUserId
                        )
                        ||
                        callee
                                .getId()
                                .equals(
                                        authenticatedUserId
                                );

        if (!participant) {
            throw new IllegalStateException(
                    "Only call participants can access Secure Connect media."
            );
        }

        if (call.getStatus()
                != CallStatus.ACCEPTED) {
            throw new IllegalStateException(
                    "Secure Connect media is available only after the call is accepted."
            );
        }

        /*
         * Recheck both account states immediately before issuing a
         * provider token. This closes access if either account was
         * deactivated, suspended or disabled after the call began.
         */
        if (!caller.isAccountActive()
                || !callee.isAccountActive()) {
            throw new IllegalStateException(
                    "Secure Connect media is unavailable because a participant account is inactive."
            );
        }

        /*
         * Blocking is bidirectional for Secure Connect. A block made
         * after ringing/acceptance must prevent new LiveKit credentials.
         */
        boolean blocked =
                userBlockRepository
                        .existsByBlockerIdAndBlockedUserIdOrBlockerIdAndBlockedUserId(
                                caller.getId(),
                                callee.getId(),
                                callee.getId(),
                                caller.getId()
                        );

        if (blocked) {
            throw new IllegalStateException(
                    "Secure Connect is unavailable between these members."
            );
        }

        String providerName =
                callProvider.providerName();

        String roomName =
                callProvider.roomName(call);

        if (StringUtils.hasText(
                call.getProvider()
        ) && !providerName.equals(
                call.getProvider()
        )) {
            throw new IllegalStateException(
                    "Secure Connect provider cannot be changed for an active call."
            );
        }

        if (StringUtils.hasText(
                call.getProviderRoomId()
        ) && !roomName.equals(
                call.getProviderRoomId()
        )) {
            throw new IllegalStateException(
                    "Secure Connect room cannot be changed for an active call."
            );
        }

        if (!StringUtils.hasText(
                call.getProvider()
        )) {
            call.setProvider(
                    providerName
            );
        }

        if (!StringUtils.hasText(
                call.getProviderRoomId()
        )) {
            call.setProviderRoomId(
                    roomName
            );
        }

        callSessionRepository.save(
                call
        );

        return callProvider
                .createParticipantCredentials(
                        call,
                        authenticatedUserId
                );
    }
}
