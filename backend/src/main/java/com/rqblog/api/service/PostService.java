package com.rqblog.api.service;

import com.rqblog.api.dto.CommentResponse;
import com.rqblog.api.dto.CreatePostRequest;
import com.rqblog.api.dto.PostResponse;
import com.rqblog.api.dto.UpdatePostRequest;
import com.rqblog.api.exception.ApiException;
import com.rqblog.api.model.Comment;
import com.rqblog.api.model.Post;
import com.rqblog.api.model.PostLike;
import com.rqblog.api.repository.CommentRepository;
import com.rqblog.api.repository.PostLikeRepository;
import com.rqblog.api.repository.PostRepository;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostService {
    private final PostRepository posts;
    private final CommentRepository comments;
    private final PostLikeRepository likes;

    public PostService(PostRepository posts, CommentRepository comments, PostLikeRepository likes) {
        this.posts = posts;
        this.comments = comments;
        this.likes = likes;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(String tag, String author, String search, String ids,
                                   String requestedSort, int requestedPage, int requestedPageSize) {
        int page = Math.max(requestedPage, 1);
        int pageSize = Math.min(Math.max(requestedPageSize, 1), 50);
        String sort = List.of("newest", "oldest", "title-asc", "title-desc").contains(requestedSort)
            ? requestedSort : "newest";
        Sort order = switch (sort) {
            case "oldest" -> Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("id"));
            case "title-asc" -> Sort.by(Sort.Order.asc("title"), Sort.Order.asc("id"));
            case "title-desc" -> Sort.by(Sort.Order.desc("title"), Sort.Order.desc("id"));
            default -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        };
        Pageable pageable = PageRequest.of(page - 1, pageSize, order);
        Specification<Post> spec = (root, query, builder) -> builder.conjunction();
        if (tag != null && !tag.isBlank()) {
            spec = spec.and((root, query, builder) -> builder.equal(root.get("tag"), tag));
        }
        if (author != null && !author.isBlank()) {
            String value = author.toLowerCase(Locale.ROOT);
            spec = spec.and((root, query, builder) ->
                builder.like(builder.lower(root.get("author")), "%" + value + "%"));
        }
        if (search != null && !search.isBlank()) {
            String value = "%" + search.toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("title")), value),
                builder.like(builder.lower(root.get("content")), value)));
        }
        if (ids != null) {
            List<Long> selected = java.util.Arrays.stream(ids.split(","))
                .map(String::trim).filter(value -> value.matches("[0-9]+"))
                .map(Long::parseLong).filter(id -> id > 0).toList();
            spec = spec.and((root, query, builder) -> selected.isEmpty()
                ? builder.disjunction() : root.get("id").in(selected));
        }
        Page<Post> result = posts.findAll(spec, pageable);
        List<PostResponse> values = result.getContent().stream().map(PostResponse::from).toList();
        return Map.of("count", result.getTotalElements(), "page", page, "pageSize", pageSize,
            "totalPages", result.getTotalPages(), "posts", values);
    }

    @Transactional(readOnly = true)
    public PostResponse get(long id) {
        return PostResponse.from(requirePost(id));
    }

    @Transactional
    public PostResponse create(CreatePostRequest request) {
        Post post = new Post();
        post.title = request.title().trim();
        post.content = request.content();
        post.author = request.author().trim();
        post.tag = request.tag() == null || request.tag().isBlank() ? "general" : request.tag().trim();
        return PostResponse.from(posts.save(post));
    }

    @Transactional
    public PostResponse update(long id, UpdatePostRequest request) {
        Post post = requirePost(id);
        post.title = request.title().trim();
        post.content = request.content();
        post.tag = request.tag() == null || request.tag().isBlank() ? "general" : request.tag().trim();
        posts.saveAndFlush(post);
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse togglePublish(long id) {
        Post post = requirePost(id);
        post.published = !post.published;
        posts.saveAndFlush(post);
        return PostResponse.from(post);
    }

    @Transactional
    public Map<String, Object> setLike(long id, String clientId, boolean liked) {
        requirePost(id);
        if (liked) {
            if (!likes.existsById(new com.rqblog.api.model.PostLikeId(id, clientId))) {
                PostLike entry = new PostLike();
                entry.postId = id;
                entry.clientId = clientId;
                likes.save(entry);
            }
        } else {
            likes.deleteByPostIdAndClientId(id, clientId);
        }
        return Map.of("postId", id, "liked", liked);
    }

    @Transactional
    public Map<String, Object> delete(long id) {
        requirePost(id);
        likes.deleteByPostId(id);
        posts.deleteById(id);
        return Map.of("message", "Post deleted", "id", id);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(long postId) {
        requirePost(postId);
        return comments.findByPost_IdOrderByCreatedAtAsc(postId).stream()
            .map(CommentResponse::from).toList();
    }

    @Transactional
    public CommentResponse addComment(long postId, String body, String author) {
        Post post = requirePost(postId);
        Comment comment = new Comment();
        comment.body = body.trim();
        comment.author = author.trim();
        comment.post = post;
        return CommentResponse.from(comments.save(comment));
    }

    @Transactional
    public Map<String, Object> deleteComment(long id) {
        if (!comments.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Record not found");
        }
        comments.deleteById(id);
        return Map.of("message", "Comment deleted", "id", id);
    }

    private Post requirePost(long id) {
        return posts.findById(id).orElseThrow(() ->
            new ApiException(HttpStatus.NOT_FOUND, "Post not found"));
    }
}
