package com.rqblog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiSummaryRequest(@NotBlank @Size(max = 12000) String content) {}
