package com.theholymatrimony.backend.admin.service;

import com.theholymatrimony.backend.admin.dto.AdminDashboardResponse;
import com.theholymatrimony.backend.auth.repository.UserRepository;
import com.theholymatrimony.backend.communication.repository.ChatMessageRepository;
import com.theholymatrimony.backend.interest.repository.InterestRepository;
import com.theholymatrimony.backend.payments.repository.MembershipRepository;
import com.theholymatrimony.backend.payments.repository.PaymentRepository;
import com.theholymatrimony.backend.profile.repository.ProfileRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final InterestRepository interestRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        return AdminDashboardResponse
                .builder()
                .totalUsers(userRepository.count())
                .totalProfiles(profileRepository.count())
                .totalInterests(interestRepository.count())
                .totalMessages(chatMessageRepository.count())
                .totalMemberships(membershipRepository.count())
                .totalPayments(paymentRepository.count())
                .totalRevenue(BigDecimal.ZERO)
                .build();
    }
}