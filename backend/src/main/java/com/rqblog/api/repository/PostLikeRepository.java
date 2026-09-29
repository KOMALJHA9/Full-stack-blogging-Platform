package com.rqblog.api.repository;

import com.rqblog.api.model.PostLike;
import com.rqblog.api.model.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    void deleteByPostIdAndClientId(Long postId, String clientId);
    void deleteByPostId(Long postId);
}
