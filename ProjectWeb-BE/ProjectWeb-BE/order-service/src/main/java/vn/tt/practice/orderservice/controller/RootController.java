package vn.tt.practice.orderservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("service", "order-service");
        payload.put("status", "UP");
        payload.put("api", "/v1/api/order or /api/order");
        return payload;
    }
}