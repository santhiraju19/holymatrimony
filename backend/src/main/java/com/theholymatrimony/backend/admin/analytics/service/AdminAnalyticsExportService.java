package com.theholymatrimony.backend.admin.analytics.service;

import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsExportService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public byte[] exportUsers(
            LocalDate from,
            LocalDate to
    ) {

        DateRange range =
                resolveRange(from, to);

        List<User> users =
                userRepository
                        .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                range.start(),
                                range.end()
                        );

        StringBuilder csv =
                new StringBuilder();

        csv.append(
                "User ID,Name,Email,Mobile,Account Status,Membership Type,Registered On,Last Login\n"
        );

        for (User user : users) {
            row(
                    csv,
                    value(user.getId()),
                    user.getFullName(),
                    user.getEmail(),
                    user.getMobile(),
                    value(user.getStatus()),
                    user.getMembershipType(),
                    value(user.getCreatedAt()),
                    value(user.getLastLoginAt())
            );
        }

        return bytes(csv);
    }

    @Transactional(readOnly = true)
    public byte[] exportProfiles(
            LocalDate from,
            LocalDate to
    ) {

        DateRange range =
                resolveRange(from, to);

        List<Profile> profiles =
                profileRepository
                        .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                range.start(),
                                range.end()
                        );

        StringBuilder csv =
                new StringBuilder();

        csv.append(
                "Profile ID,User ID,Name,Email,Mobile,Gender,City,State,Country,Completion %,Profile Status,Browse Status,Verification Status,Created On,Updated On\n"
        );

        for (Profile profile : profiles) {

            User user =
                    profile.getUser();

            boolean completed =
                    Boolean.TRUE.equals(
                            profile.getProfileCompleted()
                    );

            row(
                    csv,
                    value(profile.getId()),
                    user != null
                            ? value(user.getId())
                            : "",
                    user != null
                            ? user.getFullName()
                            : "",
                    user != null
                            ? user.getEmail()
                            : "",
                    user != null
                            ? user.getMobile()
                            : "",
                    value(profile.getGender()),
                    profile.getCity(),
                    profile.getState(),
                    profile.getCountry(),
                    value(
                            profile.getCompletionPercentage()
                    ),
                    completed
                            ? "COMPLETED"
                            : "INCOMPLETE",
                    completed
                            ? "LIVE"
                            : "HIDDEN",
                    value(
                            profile.getVerificationStatus()
                    ),
                    value(profile.getCreatedAt()),
                    value(profile.getUpdatedAt())
            );
        }

        return bytes(csv);
    }

    @Transactional(readOnly = true)
    public byte[] exportMemberships(
            LocalDate from,
            LocalDate to
    ) {

        DateRange range =
                resolveRange(from, to);

        List<Membership> memberships =
                membershipRepository
                        .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                range.start(),
                                range.end()
                        );

        StringBuilder csv =
                new StringBuilder();

        csv.append(
                "Membership ID,User ID,Name,Email,Plan,Status,Start Date,Expiry Date,Payment Status,Payment Amount INR,Created On\n"
        );

        for (
                Membership membership :
                memberships
        ) {

            User user =
                    membership.getUser();

            Payment payment =
                    membership.getPayment();

            row(
                    csv,
                    value(membership.getId()),
                    user != null
                            ? value(user.getId())
                            : "",
                    user != null
                            ? user.getFullName()
                            : "",
                    user != null
                            ? user.getEmail()
                            : "",
                    value(membership.getPlan()),
                    value(membership.getStatus()),
                    value(membership.getStartDate()),
                    value(membership.getExpiryDate()),
                    payment != null
                            ? value(payment.getStatus())
                            : "",
                    payment != null
                            ? rupees(
                                    payment.getAmount()
                            )
                            : "",
                    value(membership.getCreatedAt())
            );
        }

        return bytes(csv);
    }

    @Transactional(readOnly = true)
    public byte[] exportPayments(
            LocalDate from,
            LocalDate to
    ) {

        DateRange range =
                resolveRange(from, to);

        List<Payment> payments =
                paymentRepository
                        .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                range.start(),
                                range.end()
                        );

        StringBuilder csv =
                new StringBuilder();

        csv.append(
                "Payment ID,User ID,Customer Name,Email,Plan,Amount INR,Currency,Status,Source,Razorpay Order ID,Razorpay Payment ID,Paid At,Created On\n"
        );

        for (Payment payment : payments) {

            User user =
                    payment.getUser();

            row(
                    csv,
                    value(payment.getId()),
                    user != null
                            ? value(user.getId())
                            : "",
                    payment.getCustomerName(),
                    payment.getEmail(),
                    payment.getPlan(),
                    rupees(payment.getAmount()),
                    payment.getCurrency(),
                    value(payment.getStatus()),
                    value(payment.getPaymentSource()),
                    payment.getRazorpayOrderId(),
                    payment.getRazorpayPaymentId(),
                    value(payment.getPaidAt()),
                    value(payment.getCreatedAt())
            );
        }

        return bytes(csv);
    }

    private DateRange resolveRange(
            LocalDate from,
            LocalDate to
    ) {

        LocalDate resolvedTo =
                to != null
                        ? to
                        : LocalDate.now();

        LocalDate resolvedFrom =
                from != null
                        ? from
                        : resolvedTo.withDayOfMonth(1);

        if (
                resolvedFrom.isAfter(
                        resolvedTo
                )
        ) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }

        return new DateRange(
                resolvedFrom.atStartOfDay(),
                resolvedTo
                        .plusDays(1)
                        .atStartOfDay()
        );
    }

    private void row(
            StringBuilder csv,
            Object... values
    ) {

        for (
                int index = 0;
                index < values.length;
                index++
        ) {

            if (index > 0) {
                csv.append(',');
            }

            csv.append(
                    escape(
                            values[index]
                    )
            );
        }

        csv.append('\n');
    }

    private String escape(
            Object raw
    ) {

        if (raw == null) {
            return "";
        }

        String value =
                raw.toString();

        /*
         * Protect spreadsheet applications
         * from interpreting exported text
         * as formulas.
         */
        if (
                value.startsWith("=")
                        || value.startsWith("+")
                        || value.startsWith("-")
                        || value.startsWith("@")
        ) {
            value = "'" + value;
        }

        boolean quote =
                value.contains(",")
                        || value.contains("\"")
                        || value.contains("\n")
                        || value.contains("\r");

        value =
                value.replace(
                        "\"",
                        "\"\""
                );

        return quote
                ? "\"" + value + "\""
                : value;
    }

    private String rupees(
            Integer amountInPaise
    ) {

        if (amountInPaise == null) {
            return "";
        }

        return BigDecimal
                .valueOf(amountInPaise)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                )
                .toPlainString();
    }

    private String value(
            Object value
    ) {
        return value == null
                ? ""
                : value.toString();
    }

    private byte[] bytes(
            StringBuilder csv
    ) {

        /*
         * UTF-8 BOM improves Excel handling
         * of names and Indian-language text.
         */
        String content =
                "\uFEFF" + csv;

        return content.getBytes(
                StandardCharsets.UTF_8
        );
    }

    private record DateRange(
            LocalDateTime start,
            LocalDateTime end
    ) {
    }
}
