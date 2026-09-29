package com.rqblog.api.controller;

import com.rqblog.api.dto.AiChatRequest;
import com.rqblog.api.dto.AiDraftRequest;
import com.rqblog.api.dto.AiSummaryRequest;
import com.rqblog.api.service.AiService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService service;

    public AiController(AiService service) {
        this.service = service;
    }

    @PostMapping("/draft")
    public Map<String, String> draft(@Valid @RequestBody AiDraftRequest request) {
        return service.draft(request.prompt().trim());
    }

    @PostMapping("/summary")
    public Map<String, String> summary(@Valid @RequestBody AiSummaryRequest request) {
        return service.summary(request.content().trim());
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@Valid @RequestBody AiChatRequest request) {
        return service.chat(request);
    }
}
