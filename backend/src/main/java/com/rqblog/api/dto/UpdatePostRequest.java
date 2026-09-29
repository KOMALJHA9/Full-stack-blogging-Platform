package com.rqblog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank String content,
    @Size(max = 80) String tag
) {}
