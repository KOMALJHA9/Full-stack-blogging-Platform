package com.rqblog.api.controller;

import com.rqblog.api.dto.CommentRequest;
import com.rqblog.api.dto.CommentResponse;
import com.rqblog.api.service.PostService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CommentController {
    private final PostService service;

    public CommentController(PostService service) {
        this.service = service;
    }

    @GetMapping("/api/posts/{postId}/comments")
    public Map<String, Object> list(@PathVariable long postId) {
        List<CommentResponse> values = service.getComments(postId);
        return Map.of("count", values.size(), "comments", values);
    }

    @PostMapping("/api/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse create(@PathVariable long postId, @Valid @RequestBody CommentRequest request) {
        return service.addComment(postId, request.body(), request.author());
    }

    @DeleteMapping("/api/comments/{id}")
    public Map<String, Object> delete(@PathVariable long id) {
        return service.deleteComment(id);
    }
}
