package com.rqblog.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "post_likes")
@IdClass(PostLikeId.class)
public class PostLike {
    @Id
    public Long postId;
    @Id
    public String clientId;
    public Instant createdAt;

    @PrePersist
    void beforeInsert() {
        createdAt = Instant.now();
    }
}
