package com.rqblog.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LikeRequest(
    @NotNull @Size(min = 1, max = 128) String clientId,
    @NotNull Boolean liked
) {}
