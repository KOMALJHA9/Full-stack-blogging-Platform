package com.rqblog.api.model;

import java.io.Serializable;
import java.util.Objects;

public class PostLikeId implements Serializable {
    public Long postId;
    public String clientId;

    public PostLikeId() {}

    public PostLikeId(Long postId, String clientId) {
        this.postId = postId;
        this.clientId = clientId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof PostLikeId that)) return false;
        return Objects.equals(postId, that.postId) && Objects.equals(clientId, that.clientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, clientId);
    }
}
