package com.theholymatrimony.backend.franchise.service;

import com.theholymatrimony.backend.franchise.dto.CreateFranchiseLeadRequest;
import com.theholymatrimony.backend.franchise.dto.FranchiseLeadResponse;
import com.theholymatrimony.backend.franchise.dto.UpdateFranchiseLeadRequest;

import java.util.List;
import java.util.UUID;

public interface FranchiseLeadService {

    List<FranchiseLeadResponse> listLeads(
            String email
    );

    FranchiseLeadResponse createLead(
            String email,
            CreateFranchiseLeadRequest request
    );

    FranchiseLeadResponse updateLead(
            String email,
            UUID leadId,
            UpdateFranchiseLeadRequest request
    );
}
