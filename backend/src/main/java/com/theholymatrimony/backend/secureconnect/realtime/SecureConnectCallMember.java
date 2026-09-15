package com.theholymatrimony.backend.secureconnect.realtime;

import java.util.UUID;

public record SecureConnectCallMember(

        UUID userId,

        String memberId,

        String displayName

) {
}
