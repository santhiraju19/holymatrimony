package com.theholymatrimony.backend.payments.controller;

import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import com.theholymatrimony.backend.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestBody CreateOrderRequest request
    ) throws Exception {

        System.out.println("========== PAYMENT CONTROLLER ==========");
        System.out.println("Received Create Order Request");
        System.out.println(request);

        CreateOrderResponse response = paymentService.createOrder(request);

        System.out.println("Returning Response");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestBody VerifyPaymentRequest request
    ) throws Exception {

        paymentService.verifyPayment(request);

        return ResponseEntity.ok("Payment verified successfully");
    }
}