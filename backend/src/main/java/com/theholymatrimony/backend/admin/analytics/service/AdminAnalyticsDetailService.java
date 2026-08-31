package com.theholymatrimony.backend.admin.analytics.service;

import com.theholymatrimony.backend.admin.analytics.dto.AdminAnalyticsDetailResponse;
import com.theholymatrimony.backend.admin.analytics.dto.AdminAnalyticsDetailRow;
import com.theholymatrimony.backend.auth.entity.User;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.payments.entity.Membership;
import com.theholymatrimony.backend.payments.entity.Payment;
import com.theholymatrimony.backend.payments.enums.MembershipPlan;
import com.theholymatrimony.backend.payments.enums.PaymentStatus;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.profile.entity.Profile;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsDetailService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public AdminAnalyticsDetailResponse getDetails(
            String metric,
            LocalDate from,
            LocalDate to,
            String search,
            Integer page,
            Integer size
    ) {
        String resolvedMetric = normalizeMetric(metric);

        LocalDate resolvedTo =
                to != null
                        ? to
                        : LocalDate.now();

        LocalDate resolvedFrom =
                from != null
                        ? from
                        : resolvedTo.withDayOfMonth(1);

        if (resolvedFrom.isAfter(resolvedTo)) {
            throw new IllegalArgumentException(
                    "From date cannot be after to date."
            );
        }

        int resolvedPage =
                page == null
                        ? 0
                        : Math.max(0, page);

        int resolvedSize =
                size == null
                        ? 20
                        : Math.max(
                                1,
                                Math.min(size, 100)
                        );

        LocalDateTime start =
                resolvedFrom.atStartOfDay();

        LocalDateTime end =
                resolvedTo
                        .plusDays(1)
                        .atStartOfDay();

        List<AdminAnalyticsDetailRow> rows =
                loadRows(
                        resolvedMetric,
                        start,
                        end
                );

        String normalizedSearch =
                normalizeSearch(search);

        if (normalizedSearch != null) {
            rows =
                    rows.stream()
                            .filter(
                                    row ->
                                            matchesSearch(
                                                    row,
                                                    normalizedSearch
                                            )
                            )
                            .toList();
        }

        rows =
                rows.stream()
                        .sorted(
                                Comparator.comparing(
                                                this::sortDate,
                                                Comparator.nullsLast(
                                                        Comparator.naturalOrder()
                                                )
                                        )
                                        .reversed()
                        )
                        .toList();

        long totalElements =
                rows.size();

        int totalPages =
                totalElements == 0
                        ? 0
                        : (int) Math.ceil(
                                totalElements
                                        / (double) resolvedSize
                        );

        int fromIndex =
                Math.min(
                        resolvedPage * resolvedSize,
                        rows.size()
                );

        int toIndex =
                Math.min(
                        fromIndex + resolvedSize,
                        rows.size()
                );

        List<AdminAnalyticsDetailRow> pageRows =
                rows.subList(
                        fromIndex,
                        toIndex
                );

        return AdminAnalyticsDetailResponse
                .builder()
                .metric(resolvedMetric)
                .title(titleFor(resolvedMetric))
                .from(resolvedFrom)
                .to(resolvedTo)
                .totalElements(totalElements)
                .page(resolvedPage)
                .size(resolvedSize)
                .totalPages(totalPages)
                .rows(pageRows)
                .build();
    }

    private List<AdminAnalyticsDetailRow> loadRows(
            String metric,
            LocalDateTime start,
            LocalDateTime end
    ) {
        return switch (metric) {
            case "REGISTERED_USERS" ->
                    userRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .map(this::userRow)
                            .toList();

            case "TOTAL_USERS" ->
                    userRepository
                            .findAll()
                            .stream()
                            .map(this::userRow)
                            .toList();

            case "PROFILES_CREATED" ->
                    profileRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .map(this::profileRow)
                            .toList();

            case "COMPLETED_PROFILES" ->
                    profileRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .filter(
                                    profile ->
                                            Boolean.TRUE.equals(
                                                    profile.getProfileCompleted()
                                            )
                            )
                            .map(this::profileRow)
                            .toList();

            case "INCOMPLETE_PROFILES" ->
                    profileRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .filter(
                                    profile ->
                                            !Boolean.TRUE.equals(
                                                    profile.getProfileCompleted()
                                            )
                            )
                            .map(this::profileRow)
                            .toList();

            case "BROWSE_VISIBLE" ->
                    profileRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .filter(
                                    profile ->
                                            Boolean.TRUE.equals(
                                                    profile.getProfileCompleted()
                                            )
                            )
                            .map(this::profileRow)
                            .toList();

            case "PAID_MEMBERSHIPS" ->
                    paidMembershipRows(
                            start,
                            end,
                            null
                    );

            case "SILVER_MEMBERSHIPS" ->
                    paidMembershipRows(
                            start,
                            end,
                            MembershipPlan.SILVER
                    );

            case "GOLD_MEMBERSHIPS" ->
                    paidMembershipRows(
                            start,
                            end,
                            MembershipPlan.GOLD
                    );

            case "PLATINUM_MEMBERSHIPS" ->
                    paidMembershipRows(
                            start,
                            end,
                            MembershipPlan.PLATINUM
                    );

            case "SUCCESSFUL_PAYMENTS",
                 "PERIOD_REVENUE" ->
                    paymentRepository
                            .findAll()
                            .stream()
                            .filter(
                                    payment ->
                                            payment.getStatus()
                                                    == PaymentStatus.SUCCESS
                            )
                            .filter(
                                    payment ->
                                            inRange(
                                                    payment.getPaidAt(),
                                                    start,
                                                    end
                                            )
                            )
                            .map(this::paymentRow)
                            .toList();

            case "PENDING_PAYMENTS" ->
                    paymentRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .filter(
                                    payment ->
                                            payment.getStatus()
                                                    == PaymentStatus.PENDING
                            )
                            .map(this::paymentRow)
                            .toList();

            case "FAILED_PAYMENTS" ->
                    paymentRepository
                            .findAllByCreatedAtBetweenOrderByCreatedAtDesc(
                                    start,
                                    end
                            )
                            .stream()
                            .filter(
                                    payment ->
                                            payment.getStatus()
                                                    == PaymentStatus.FAILED
                            )
                            .map(this::paymentRow)
                            .toList();

            case "LIFETIME_REVENUE" ->
                    paymentRepository
                            .findAll()
                            .stream()
                            .filter(
                                    payment ->
                                            payment.getStatus()
                                                    == PaymentStatus.SUCCESS
                            )
                            .map(this::paymentRow)
                            .toList();

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported analytics metric."
                    );
        };
    }

    private List<AdminAnalyticsDetailRow> paidMembershipRows(
            LocalDateTime start,
            LocalDateTime end,
            MembershipPlan plan
    ) {
        List<Membership> memberships =
                membershipRepository.findAll();

        return memberships
                .stream()
                .filter(
                        membership ->
                                membership.getPlan()
                                        != MembershipPlan.FREE
                )
                .filter(
                        membership ->
                                plan == null
                                        || membership.getPlan()
                                        == plan
                )
                .filter(
                        membership ->
                                membership.getPayment()
                                        != null
                )
                .filter(
                        membership ->
                                membership
                                        .getPayment()
                                        .getStatus()
                                        == PaymentStatus.SUCCESS
                )
                .filter(
                        membership ->
                                membership
                                        .getPayment()
                                        .getAmount()
                                        != null
                                        && membership
                                        .getPayment()
                                        .getAmount()
                                        > 0
                )
                .filter(
                        membership ->
                                inRange(
                                        membership
                                                .getPayment()
                                                .getPaidAt(),
                                        start,
                                        end
                                )
                )
                .map(this::membershipRow)
                .toList();
    }

    private AdminAnalyticsDetailRow userRow(
            User user
    ) {
        return AdminAnalyticsDetailRow
                .builder()
                .id(user.getId())
                .userId(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .membershipPlan(
                        user.getMembershipType()
                )
                .membershipStatus(
                        user.getStatus() == null
                                ? null
                                : user.getStatus().name()
                )
                .registeredAt(
                        user.getCreatedAt()
                )
                .createdAt(
                        user.getCreatedAt()
                )
                .build();
    }

    private AdminAnalyticsDetailRow profileRow(
            Profile profile
    ) {
        User user =
                profile.getUser();

        return AdminAnalyticsDetailRow
                .builder()
                .id(profile.getId())
                .userId(
                        user == null
                                ? null
                                : user.getId()
                )
                .name(
                        user == null
                                ? null
                                : user.getFullName()
                )
                .email(
                        user == null
                                ? null
                                : user.getEmail()
                )
                .mobile(
                        user == null
                                ? profile.getMobile()
                                : firstNonBlank(
                                        user.getMobile(),
                                        profile.getMobile()
                                )
                )
                .gender(profile.getGender())
                .location(profileLocation(profile))
                .completionPercentage(
                        profile.getCompletionPercentage()
                )
                .profileCompleted(
                        profile.getProfileCompleted()
                )
                .verificationStatus(
                        profile.getVerificationStatus() == null
                                ? null
                                : profile
                                        .getVerificationStatus()
                                        .name()
                )
                .membershipPlan(
                        user == null
                                ? null
                                : user.getMembershipType()
                )
                .registeredAt(
                        user == null
                                ? null
                                : user.getCreatedAt()
                )
                .createdAt(
                        profile.getCreatedAt()
                )
                .build();
    }

    private AdminAnalyticsDetailRow membershipRow(
            Membership membership
    ) {
        User user =
                membership.getUser();

        Payment payment =
                membership.getPayment();

        return AdminAnalyticsDetailRow
                .builder()
                .id(membership.getId())
                .userId(
                        user == null
                                ? null
                                : user.getId()
                )
                .name(
                        user == null
                                ? null
                                : user.getFullName()
                )
                .email(
                        user == null
                                ? null
                                : user.getEmail()
                )
                .mobile(
                        user == null
                                ? null
                                : user.getMobile()
                )
                .membershipPlan(
                        membership.getPlan() == null
                                ? null
                                : membership
                                        .getPlan()
                                        .name()
                )
                .membershipStatus(
                        membership.getStatus() == null
                                ? null
                                : membership
                                        .getStatus()
                                        .name()
                )
                .paymentStatus(
                        payment == null
                                || payment.getStatus() == null
                                ? null
                                : payment
                                        .getStatus()
                                        .name()
                )
                .amount(
                        payment == null
                                ? null
                                : paiseToRupees(
                                        payment.getAmount()
                                )
                )
                .registeredAt(
                        user == null
                                ? null
                                : user.getCreatedAt()
                )
                .createdAt(
                        membership.getCreatedAt()
                )
                .paidAt(
                        payment == null
                                ? null
                                : payment.getPaidAt()
                )
                .startDate(
                        membership.getStartDate()
                )
                .expiryDate(
                        membership.getExpiryDate()
                )
                .build();
    }

    private AdminAnalyticsDetailRow paymentRow(
            Payment payment
    ) {
        User user =
                payment.getUser();

        return AdminAnalyticsDetailRow
                .builder()
                .id(payment.getId())
                .userId(
                        user == null
                                ? null
                                : user.getId()
                )
                .name(
                        firstNonBlank(
                                payment.getCustomerName(),
                                user == null
                                        ? null
                                        : user.getFullName()
                        )
                )
                .email(
                        firstNonBlank(
                                payment.getEmail(),
                                user == null
                                        ? null
                                        : user.getEmail()
                        )
                )
                .mobile(
                        firstNonBlank(
                                payment.getPhone(),
                                user == null
                                        ? null
                                        : user.getMobile()
                        )
                )
                .membershipPlan(
                        payment.getPlan()
                )
                .paymentStatus(
                        payment.getStatus() == null
                                ? null
                                : payment
                                        .getStatus()
                                        .name()
                )
                .paymentSource(
                        payment.getPaymentSource() == null
                                ? null
                                : payment
                                        .getPaymentSource()
                                        .name()
                )
                .paymentMethod(
                        payment.getPaymentMethod()
                )
                .amount(
                        paiseToRupees(
                                payment.getAmount()
                        )
                )
                .razorpayOrderId(
                        payment.getRazorpayOrderId()
                )
                .razorpayPaymentId(
                        payment.getRazorpayPaymentId()
                )
                .registeredAt(
                        user == null
                                ? null
                                : user.getCreatedAt()
                )
                .createdAt(
                        payment.getCreatedAt()
                )
                .paidAt(
                        payment.getPaidAt()
                )
                .build();
    }

    private String profileLocation(
            Profile profile
    ) {
        List<String> parts =
                new ArrayList<>();

        addIfPresent(
                parts,
                profile.getCity()
        );

        addIfPresent(
                parts,
                profile.getState()
        );

        addIfPresent(
                parts,
                profile.getCountry()
        );

        return parts.isEmpty()
                ? null
                : String.join(", ", parts);
    }

    private void addIfPresent(
            List<String> parts,
            String value
    ) {
        if (
                value != null
                        && !value.isBlank()
        ) {
            parts.add(value.trim());
        }
    }

    private boolean matchesSearch(
            AdminAnalyticsDetailRow row,
            String search
    ) {
        return contains(
                row.getName(),
                search
        )
                || contains(
                        row.getEmail(),
                        search
                )
                || contains(
                        row.getMobile(),
                        search
                )
                || contains(
                        row.getMembershipPlan(),
                        search
                )
                || contains(
                        row.getPaymentStatus(),
                        search
                )
                || contains(
                        row.getRazorpayOrderId(),
                        search
                )
                || contains(
                        row.getRazorpayPaymentId(),
                        search
                )
                || contains(
                        row.getLocation(),
                        search
                );
    }

    private boolean contains(
            String value,
            String search
    ) {
        return value != null
                && value
                        .toLowerCase(Locale.ROOT)
                        .contains(search);
    }

    private String normalizeSearch(
            String search
    ) {
        if (search == null) {
            return null;
        }

        String normalized =
                search.trim()
                        .toLowerCase(Locale.ROOT);

        return normalized.isBlank()
                ? null
                : normalized;
    }

    private String normalizeMetric(
            String metric
    ) {
        if (
                metric == null
                        || metric.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Analytics metric is required."
            );
        }

        return metric
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private String titleFor(
            String metric
    ) {
        return switch (metric) {
            case "REGISTERED_USERS" ->
                    "Registered Users";

            case "TOTAL_USERS" ->
                    "Total Platform Users";

            case "PROFILES_CREATED" ->
                    "Profiles Created";

            case "COMPLETED_PROFILES" ->
                    "Completed Profiles";

            case "INCOMPLETE_PROFILES" ->
                    "Incomplete Profiles";

            case "BROWSE_VISIBLE" ->
                    "Browse Visible Profiles";

            case "PAID_MEMBERSHIPS" ->
                    "Paid Memberships";

            case "SILVER_MEMBERSHIPS" ->
                    "Silver Memberships";

            case "GOLD_MEMBERSHIPS" ->
                    "Gold Memberships";

            case "PLATINUM_MEMBERSHIPS" ->
                    "Platinum Memberships";

            case "SUCCESSFUL_PAYMENTS" ->
                    "Successful Payments";

            case "PENDING_PAYMENTS" ->
                    "Pending Payments";

            case "FAILED_PAYMENTS" ->
                    "Failed Payments";

            case "PERIOD_REVENUE" ->
                    "Period Revenue Transactions";

            case "LIFETIME_REVENUE" ->
                    "Lifetime Revenue Transactions";

            default ->
                    "Analytics Details";
        };
    }

    private boolean inRange(
            LocalDateTime value,
            LocalDateTime start,
            LocalDateTime end
    ) {
        return value != null
                && !value.isBefore(start)
                && value.isBefore(end);
    }

    private LocalDateTime sortDate(
            AdminAnalyticsDetailRow row
    ) {
        if (row.getPaidAt() != null) {
            return row.getPaidAt();
        }

        if (row.getCreatedAt() != null) {
            return row.getCreatedAt();
        }

        return row.getRegisteredAt();
    }

    private BigDecimal paiseToRupees(
            Integer amountInPaise
    ) {
        if (amountInPaise == null) {
            return BigDecimal.ZERO;
        }

        return BigDecimal
                .valueOf(amountInPaise)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }

    private String firstNonBlank(
            String first,
            String second
    ) {
        if (
                first != null
                        && !first.isBlank()
        ) {
            return first;
        }

        return second;
    }
}
