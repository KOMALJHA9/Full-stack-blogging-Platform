package com.rqblog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AiChatRequest(
    @NotBlank @Size(max = 2000) String message,
    List<HistoryMessage> history
) {
    public record HistoryMessage(String role, String content) {}
}
