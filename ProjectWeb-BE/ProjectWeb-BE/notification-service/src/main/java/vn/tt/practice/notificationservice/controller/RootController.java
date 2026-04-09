package vn.tt.practice.notificationservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, String> root() {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("service", "notification-service");
        payload.put("status", "UP");
        payload.put("note", "Kafka consumer service is running");
        return payload;
    }
}