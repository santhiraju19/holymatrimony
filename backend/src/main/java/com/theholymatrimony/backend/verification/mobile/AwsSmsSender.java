package com.theholymatrimony.backend.verification.mobile;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.pinpointsmsvoicev2.PinpointSmsVoiceV2Client;
import software.amazon.awssdk.services.pinpointsmsvoicev2.model.DestinationCountryParameterKey;
import software.amazon.awssdk.services.pinpointsmsvoicev2.model.MessageType;
import software.amazon.awssdk.services.pinpointsmsvoicev2.model.SendTextMessageRequest;
import software.amazon.awssdk.services.pinpointsmsvoicev2.model.SendTextMessageResponse;

import java.util.HashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(
        name = "sms.provider",
        havingValue = "aws"
)
@Slf4j
public class AwsSmsSender
        implements SmsSender {

    private final PinpointSmsVoiceV2Client
            smsClient;

    private final String senderId;

    private final String entityId;

    private final String templateId;

    public AwsSmsSender(

            @Value("${sms.aws.region:ap-south-1}")
            String region,

            @Value("${sms.aws.sender-id:}")
            String senderId,

            @Value("${sms.aws.entity-id:}")
            String entityId,

            @Value("${sms.aws.template-id:}")
            String templateId
    ) {

        this.senderId =
                normalize(senderId);

        this.entityId =
                normalize(entityId);

        this.templateId =
                normalize(templateId);

        this.smsClient =
                PinpointSmsVoiceV2Client
                        .builder()
                        .region(
                                Region.of(
                                        region
                                )
                        )
                        .build();
    }

    @Override
    public void sendVerificationOtp(
            String mobile,
            String otp
    ) {

        validateConfiguration();

        String destination =
                normalizeMobile(
                        mobile
                );

        String normalizedOtp =
                normalizeOtp(
                        otp
                );

        String message =
                "Holy Matrimony: Your verification code is " +
                        normalizedOtp +
                        ". This code expires in 10 minutes. " +
                        "Do not share this code with anyone.";

        Map<
                DestinationCountryParameterKey,
                String
                >
                destinationCountryParameters =
                new HashMap<>();

        destinationCountryParameters.put(
                DestinationCountryParameterKey.IN_ENTITY_ID,
                entityId
        );

        destinationCountryParameters.put(
                DestinationCountryParameterKey.IN_TEMPLATE_ID,
                templateId
        );

        SendTextMessageRequest request =
                SendTextMessageRequest
                        .builder()
                        .destinationPhoneNumber(
                                destination
                        )
                        .originationIdentity(
                                senderId
                        )
                        .messageBody(
                                message
                        )
                        .messageType(
                                MessageType.TRANSACTIONAL
                        )
                        .destinationCountryParameters(
                                destinationCountryParameters
                        )
                        .timeToLive(
                                600
                        )
                        .build();

        try {

            SendTextMessageResponse response =
                    smsClient
                            .sendTextMessage(
                                    request
                            );

            log.info(
                    "AWS SMS OTP sent successfully to mobile ending {}. Message ID: {}",
                    lastFour(
                            destination
                    ),
                    response.messageId()
            );

        } catch (Exception exception) {

            log.error(
                    "AWS SMS OTP delivery failed for mobile ending {}",
                    lastFour(
                            destination
                    ),
                    exception
            );

            throw new IllegalStateException(
                    "Unable to send the verification OTP right now. Please try again later."
            );
        }
    }

    private void validateConfiguration() {

        if (
                !StringUtils.hasText(
                        senderId
                )
        ) {

            throw new IllegalStateException(
                    "AWS SMS Sender ID is not configured."
            );
        }

        if (
                !StringUtils.hasText(
                        entityId
                )
        ) {

            throw new IllegalStateException(
                    "AWS SMS India Entity ID is not configured."
            );
        }

        if (
                !StringUtils.hasText(
                        templateId
                )
        ) {

            throw new IllegalStateException(
                    "AWS SMS India Template ID is not configured."
            );
        }
    }

    private String normalizeMobile(
            String mobile
    ) {

        if (
                !StringUtils.hasText(
                        mobile
                )
        ) {

            throw new IllegalArgumentException(
                    "Mobile number is required."
            );
        }

        String normalized =
                mobile
                        .trim()
                        .replaceAll(
                                "[\\s()\\-]",
                                ""
                        );

        /*
         * Indian 10-digit mobile number.
         *
         * 9154503430
         * becomes
         * +919154503430
         */
        if (
                normalized.matches(
                        "^[6-9]\\d{9}$"
                )
        ) {

            return "+91" +
                    normalized;
        }

        /*
         * Indian number with country code
         * but without leading plus.
         *
         * 919154503430
         * becomes
         * +919154503430
         */
        if (
                normalized.matches(
                        "^91[6-9]\\d{9}$"
                )
        ) {

            return "+" +
                    normalized;
        }

        /*
         * Already valid E.164.
         */
        if (
                normalized.matches(
                        "^\\+[1-9]\\d{7,14}$"
                )
        ) {

            return normalized;
        }

        throw new IllegalArgumentException(
                "Mobile number is not in a valid international format."
        );
    }

    private String normalizeOtp(
            String otp
    ) {

        if (
                otp == null ||
                !otp
                        .trim()
                        .matches(
                                "^\\d{6}$"
                        )
        ) {

            throw new IllegalArgumentException(
                    "OTP must contain exactly 6 digits."
            );
        }

        return otp.trim();
    }

    private String normalize(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value.trim();
    }

    private String lastFour(
            String mobile
    ) {

        if (
                mobile == null ||
                mobile.length() < 4
        ) {

            return "****";
        }

        return mobile.substring(
                mobile.length() - 4
        );
    }
}