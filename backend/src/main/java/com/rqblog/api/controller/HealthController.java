package com.rqblog.api.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/")
    public Map<String, String> health() {
        return Map.of("message", "RQ Blog API running");
    }
}
