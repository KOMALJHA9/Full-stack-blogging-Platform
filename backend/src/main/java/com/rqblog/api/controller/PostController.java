package com.rqblog.api.controller;

import com.rqblog.api.dto.CreatePostRequest;
import com.rqblog.api.dto.LikeRequest;
import com.rqblog.api.dto.PostResponse;
import com.rqblog.api.dto.UpdatePostRequest;
import com.rqblog.api.service.PostService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(
        @RequestParam(required = false) String tag,
        @RequestParam(required = false) String author,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String ids,
        @RequestParam(defaultValue = "newest") String sort,
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "5") int pageSize
    ) {
        return service.list(tag, author, search, ids, sort, page, pageSize);
    }

    @GetMapping("/{id}")
    public PostResponse get(@PathVariable long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(@Valid @RequestBody CreatePostRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public PostResponse update(@PathVariable long id, @Valid @RequestBody UpdatePostRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/publish")
    public PostResponse togglePublish(@PathVariable long id) {
        return service.togglePublish(id);
    }

    @PatchMapping("/{id}/like")
    public Map<String, Object> like(@PathVariable long id, @Valid @RequestBody LikeRequest request) {
        return service.setLike(id, request.clientId(), request.liked());
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable long id) {
        return service.delete(id);
    }
}
