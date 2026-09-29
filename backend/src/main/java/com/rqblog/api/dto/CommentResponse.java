package com.rqblog.api.dto;

import com.rqblog.api.model.Comment;
import java.time.Instant;

public record CommentResponse(Long id, String body, String author, Long postId, Instant createdAt) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(comment.id, comment.body, comment.author,
            comment.getPostId(), comment.createdAt);
    }
}
