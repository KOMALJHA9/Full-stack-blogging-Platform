package com.rqblog.api.repository;

import com.rqblog.api.model.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
	List<Post> findTop12ByPublishedTrueOrderByCreatedAtDesc();
}
