package vn.tt.practice.apigateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("service", "api-gateway");
        payload.put("status", "UP");
        payload.put("product", "/v1/api/products or /api/product");
        payload.put("order", "/v1/api/order or /api/order");
        payload.put("payment", "/v1/api/payment or /api/payment");
        payload.put("user", "/v1/api/user or /api/user");
        return payload;
    }
}