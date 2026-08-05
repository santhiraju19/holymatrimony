package com.theholymatrimony.backend.auth.emailotp;

import com.theholymatrimony.backend.auth.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailOtpDeliveryService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    EmailOtpDeliveryService.class
            );

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name:Holy Matrimony}")
    private String fromName;

    @Value("${app.mail.support-email:support@theholymatrimony.com}")
    private String supportEmail;

    public void send(
            User user,
            String otp
    ) {
        validateRecipientAndOtp(user, otp);

        sendHtmlEmail(
                user,
                "Verify your Holy Matrimony account",
                buildVerificationHtml(user, otp),
                "verification"
        );
    }

    public void sendPasswordResetOtp(
            User user,
            String otp
    ) {
        validateRecipientAndOtp(user, otp);

        sendHtmlEmail(
                user,
                "Reset your Holy Matrimony password",
                buildPasswordResetHtml(user, otp),
                "password reset"
        );
    }

    private void sendHtmlEmail(
            User user,
            String subject,
            String html,
            String emailType
    ) {
        try {
            LOGGER.info(
                    "Preparing {} email for {}",
                    emailType,
                    user.getEmail()
            );

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            StandardCharsets.UTF_8.name()
                    );

            helper.setFrom(
                    fromAddress,
                    fromName
            );

            helper.setTo(
                    user.getEmail()
            );

            helper.setSubject(subject);

            helper.setText(
                    html,
                    true
            );

            mailSender.send(message);

            LOGGER.info(
                    "{} email sent successfully to {}",
                    capitalize(emailType),
                    user.getEmail()
            );

        } catch (MessagingException exception) {
            LOGGER.error(
                    "Unable to prepare {} email for {}",
                    emailType,
                    user.getEmail(),
                    exception
            );

            throw new IllegalStateException(
                    "Unable to prepare the "
                            + emailType
                            + " email.",
                    exception
            );

        } catch (MailException exception) {
            LOGGER.error(
                    "{} SMTP delivery failed for {}",
                    capitalize(emailType),
                    user.getEmail(),
                    exception
            );

            throw new IllegalStateException(
                    "Unable to send the "
                            + emailType
                            + " email.",
                    exception
            );

        } catch (Exception exception) {
            LOGGER.error(
                    "Unexpected {} email failure for {}",
                    emailType,
                    user.getEmail(),
                    exception
            );

            throw new IllegalStateException(
                    "Unable to send the "
                            + emailType
                            + " email.",
                    exception
            );
        }
    }

    private String buildVerificationHtml(
            User user,
            String otp
    ) {
        return buildEmailHtml(
                user,
                otp,
                "Verify your email address",
                "Complete your Holy Matrimony account verification.",
                "Use the verification code below to confirm your email address.",
                "Email verification code",
                "If you did not create a Holy Matrimony account, you may safely ignore this email.",
                "#eef6ff",
                "#33506f",
                "For your security, do not share this code with anyone. "
                        + "Holy Matrimony representatives will never ask you for your OTP."
        );
    }

    private String buildPasswordResetHtml(
            User user,
            String otp
    ) {
        return buildEmailHtml(
                user,
                otp,
                "Reset your password",
                "Use this secure code to continue.",
                "We received a request to reset your Holy Matrimony password.",
                "Password reset code",
                "If you did not request a password reset, you may safely ignore this email. "
                        + "Your existing password will remain unchanged.",
                "#fff1f2",
                "#9f1239",
                "Do not share this code with anyone. "
                        + "Holy Matrimony representatives will never ask for your password-reset OTP."
        );
    }

    private String buildEmailHtml(
            User user,
            String otp,
            String heading,
            String subtitle,
            String introduction,
            String otpLabel,
            String ignoreMessage,
            String securityBackground,
            String securityTextColor,
            String securityMessage
    ) {
        String safeName =
                escapeHtml(
                        getDisplayName(user)
                );

        String safeOtp =
                escapeHtml(otp);

        String safeSupportEmail =
                escapeHtml(supportEmail);

        String safeHeading =
                escapeHtml(heading);

        String safeSubtitle =
                escapeHtml(subtitle);

        String safeIntroduction =
                escapeHtml(introduction);

        String safeOtpLabel =
                escapeHtml(otpLabel);

        String safeIgnoreMessage =
                escapeHtml(ignoreMessage);

        String safeSecurityMessage =
                escapeHtml(securityMessage);

        return """
                <!doctype html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                </head>

                <body style="margin:0;padding:0;background:#f3f6fa;font-family:Arial,Helvetica,sans-serif;color:#172033;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f3f6fa;padding:32px 12px;">
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.12);">

                                    <tr>
                                        <td style="padding:34px 32px;background:#0B2D5C;text-align:center;">
                                            <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#F2D675;text-transform:uppercase;">
                                                Faith • Family • Forever
                                            </div>

                                            <h1 style="margin:14px 0 0;font-size:30px;line-height:38px;color:#ffffff;">
                                                %s
                                            </h1>

                                            <p style="margin:12px 0 0;font-size:15px;line-height:24px;color:#d9e8ff;">
                                                %s
                                            </p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:34px 32px;">
                                            <p style="margin:0;font-size:16px;line-height:26px;color:#334155;">
                                                Hello <strong>%s</strong>,
                                            </p>

                                            <p style="margin:18px 0 0;font-size:15px;line-height:25px;color:#475569;">
                                                %s
                                            </p>

                                            <div style="margin:28px 0;padding:24px;border:1px solid #ead79b;border-radius:20px;background:#fffaf0;text-align:center;">
                                                <div style="font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#9a7415;">
                                                    %s
                                                </div>

                                                <div style="margin-top:12px;font-size:38px;line-height:46px;font-weight:800;letter-spacing:10px;color:#0B2D5C;">
                                                    %s
                                                </div>

                                                <div style="margin-top:12px;font-size:13px;color:#64748b;">
                                                    This code expires in 10 minutes.
                                                </div>
                                            </div>

                                            <div style="padding:16px 18px;border-radius:16px;background:%s;color:%s;font-size:13px;line-height:21px;">
                                                %s
                                            </div>

                                            <p style="margin:24px 0 0;font-size:14px;line-height:23px;color:#64748b;">
                                                %s
                                            </p>

                                            <p style="margin:22px 0 0;font-size:14px;line-height:23px;color:#64748b;">
                                                Need assistance? Email
                                                <a href="mailto:%s" style="color:#0B2D5C;font-weight:700;text-decoration:none;">
                                                    %s
                                                </a>
                                            </p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding:22px 32px;background:#071B36;text-align:center;">
                                            <div style="font-size:16px;font-weight:800;color:#ffffff;">
                                                Holy Matrimony
                                            </div>

                                            <div style="margin-top:6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#D4AF37;">
                                                Faith • Family • Forever
                                            </div>

                                            <div style="margin-top:12px;font-size:11px;color:#94a3b8;">
                                                This is an automated security email.
                                            </div>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                safeHeading,
                safeHeading,
                safeSubtitle,
                safeName,
                safeIntroduction,
                safeOtpLabel,
                safeOtp,
                securityBackground,
                securityTextColor,
                safeSecurityMessage,
                safeIgnoreMessage,
                safeSupportEmail,
                safeSupportEmail
        );
    }

    private void validateRecipientAndOtp(
            User user,
            String otp
    ) {
        if (
                user == null
                        || user.getEmail() == null
                        || user.getEmail().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "A valid recipient email address is required."
            );
        }

        if (
                otp == null
                        || !otp.matches("\\d{6}")
        ) {
            throw new IllegalArgumentException(
                    "A valid 6-digit OTP is required."
            );
        }

        if (
                fromAddress == null
                        || fromAddress.isBlank()
        ) {
            throw new IllegalStateException(
                    "The email sender address is not configured."
            );
        }
    }

    private String getDisplayName(
            User user
    ) {
        if (
                user.getFullName() == null
                        || user.getFullName().isBlank()
        ) {
            return "Member";
        }

        return user.getFullName().trim();
    }

    private String capitalize(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return "Email";
        }

        return Character.toUpperCase(
                value.charAt(0)
        ) + value.substring(1);
    }

    private String escapeHtml(
            String value
    ) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}