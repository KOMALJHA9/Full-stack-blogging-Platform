package com.rqblog.api.dto;

import com.rqblog.api.model.Post;
import java.time.Instant;
import java.util.List;

public record PostResponse(
    Long id,
    String title,
    String content,
    String author,
    String tag,
    boolean published,
    List<CommentResponse> comments,
    Instant createdAt,
    Instant updatedAt
) {
    public static PostResponse from(Post post) {
        List<CommentResponse> comments = post.comments.stream()
            .map(CommentResponse::from)
            .toList();
        return new PostResponse(post.id, post.title, post.content, post.author, post.tag,
            post.published, comments, post.createdAt, post.updatedAt);
    }
}
