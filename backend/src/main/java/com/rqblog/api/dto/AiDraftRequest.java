package com.rqblog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiDraftRequest(@NotBlank @Size(max = 3000) String prompt) {}
