package com.rqblog.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
    @NotBlank @Size(max = 10000) String body,
    @NotBlank @Size(max = 120) String author
) {}
