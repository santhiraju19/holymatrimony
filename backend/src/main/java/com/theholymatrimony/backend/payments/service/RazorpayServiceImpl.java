package com.theholymatrimony.backend.payments.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.theholymatrimony.backend.payments.dto.CreateOrderRequest;
import com.theholymatrimony.backend.payments.dto.CreateOrderResponse;
import com.theholymatrimony.backend.payments.dto.VerifyPaymentRequest;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Override
    public CreateOrderResponse createOrder(CreateOrderRequest request) {

        System.out.println("========== PAYMENT SERVICE ==========");
        System.out.println("Plan : " + request.getPlan());
        System.out.println("Cycle: " + request.getBillingCycle());

        try {

            int amount = getAmount(
                    request.getPlan(),
                    request.getBillingCycle()
            );

            System.out.println("Amount = " + amount);

            JSONObject options = new JSONObject();
            options.put("amount", amount);
            options.put("currency", "INR");
            options.put("receipt", "HM-" + System.currentTimeMillis());

            System.out.println("Calling Razorpay...");

            Order order = razorpayClient.orders.create(options);

            System.out.println("Razorpay Order Created");
            System.out.println(order);

            return new CreateOrderResponse(
                    order.get("id"),
                    keyId,
                    amount,
                    "INR"
            );

        } catch (Exception ex) {

            ex.printStackTrace();

            throw new RuntimeException(
                    "Unable to create Razorpay order",
                    ex
            );
        }
    }

    @Override
    public void verifyPayment(
            VerifyPaymentRequest request
    ) throws Exception {

        System.out.println("Verify Payment API Called");
    }

    private int getAmount(
            String plan,
            String billingCycle
    ) {

        if ("PREMIUM".equalsIgnoreCase(plan)) {
            return "YEARLY".equalsIgnoreCase(billingCycle)
                    ? 299900
                    : 29900;
        }

        if ("ELITE".equalsIgnoreCase(plan)) {
            return "YEARLY".equalsIgnoreCase(billingCycle)
                    ? 499900
                    : 49900;
        }

        return "YEARLY".equalsIgnoreCase(billingCycle)
                ? 99900
                : 9900;
    }
}