package com.rqblog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
    @NotBlank @Size(max = 255) String title,
    @NotBlank String content,
    @NotBlank @Size(max = 120) String author,
    @Size(max = 80) String tag
) {}
