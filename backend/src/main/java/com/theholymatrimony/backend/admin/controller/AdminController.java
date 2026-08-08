package com.theholymatrimony.backend.admin.controller;

import com.theholymatrimony.backend.admin.dto.AdminDashboardResponse;
import com.theholymatrimony.backend.admin.service.AdminDashboardService;
import com.theholymatrimony.backend.common.response.ApiResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>>
    getDashboard() {

        AdminDashboardResponse response =
                adminDashboardService.getDashboard();

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }
}