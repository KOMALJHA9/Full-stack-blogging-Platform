import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts }        from '../hooks/usePosts';
import { useDeletePost, useTogglePublish } from '../hooks/usePostMutations';
import { useBookmarks } from '../hooks/useBookmarks';
import PostLikeButton from '../components/PostLikeButton';
import { getReadingTimeMinutes } from '../utils/readingTime';
import { getPostExcerpt } from '../utils/postExcerpt';
import { useAppSelector, useAppDispatch } from '../hooks/useAppHooks';
import { setTag, setAuthor, setSearch, setSort, setPage } from '../store/slices/filtersSlice';

const TAGS = ['', 'general', 'react', 'node', 'typescript'];

const PostsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Filters now live in Redux instead of local useState.
  // This is the ONE thing that changes from the plain React Query
  // version: navigate away, come back — the tag/author filter
  // is still selected, because Redux state survives unmount.
  const tag    = useAppSelector((s) => s.filters.tag);
  const author = useAppSelector((s) => s.filters.author);
  const search = useAppSelector((s) => s.filters.search);
  const sort   = useAppSelector((s) => s.filters.sort);
  const page   = useAppSelector((s) => s.filters.page);
  const [searchInput, setSearchInput] = useState(search);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const bookmarks = useBookmarks();

  useEffect(() => {
    const timeout = window.setTimeout(() => dispatch(setSearch(searchInput)), 300);
    return () => window.clearTimeout(timeout);
  }, [dispatch, searchInput]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const { data, isLoading, isError, isFetching } = usePosts(
    {
      tag: tag || undefined,
      author: author || undefined,
      search: search || undefined,
      sort,
      page,
      pageSize: 5,
      ids: showBookmarked ? bookmarks.postIds : undefined,
    }
  );
  const posts = data?.posts;

  const deleteMutation  = useDeletePost();
  const publishMutation = useTogglePublish();

  if (isLoading) return <div className="state-message">Loading posts...</div>;
  if (isError)   return <div className="state-message">Failed to load posts.</div>;

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1 className="page-title">Blog Posts</h1>
        <button className="button button-primary" onClick={() => navigate('/create')}>+ New Post</button>
      </header>

      <div className="filter-bar">
        <input
          className="field-control filter-input search-input"
          type="search"
          placeholder="Search titles and content..."
          aria-label="Search posts"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <select className="field-control filter-select" value={tag} onChange={e => dispatch(setTag(e.target.value))}>
          {TAGS.map(t => <option key={t} value={t}>{t || 'All tags'}</option>)}
        </select>
        <input
          className="field-control filter-input"
          placeholder="Filter by author..."
          value={author}
          onChange={e => dispatch(setAuthor(e.target.value))}
        />
        <select className="field-control filter-select sort-select" value={sort} aria-label="Sort posts" onChange={e => dispatch(setSort(e.target.value as typeof sort))}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title-asc">Title A–Z</option>
          <option value="title-desc">Title Z–A</option>
        </select>
      </div>

      <div className="results-bar" aria-live="polite">
        <span>{data ? `${data.count} ${data.count === 1 ? 'post' : 'posts'} found` : 'Loading posts...'}</span>
        <div className="results-actions">
          <button
            className={`text-button bookmark-filter${showBookmarked ? ' is-bookmarked' : ''}`}
            type="button"
            aria-pressed={showBookmarked}
            onClick={() => {
              setShowBookmarked(current => !current);
              dispatch(setPage(1));
            }}
          >
            {showBookmarked ? 'Show all posts' : `Saved posts (${bookmarks.postIds.length})`}
          </button>
          {isFetching && <span className="fetching-indicator">Refreshing...</span>}
        </div>
      </div>

      {posts?.length === 0 && <div className="empty-state">{showBookmarked ? 'No saved posts yet.' : 'No posts found. Create one!'}</div>}

      {posts?.map(post => (
        <article key={post.id} className="post-card">
          <div className="post-card-top">
            <span className="tag-chip">{post.tag}</span>
            <span className={`status-chip ${post.published ? 'is-published' : 'is-draft'}`}>
              {post.published ? 'Published' : 'Draft'}
            </span>
          </div>
          <h2 className="post-title" onClick={() => navigate(`/posts/${post.id}`)}>{post.title}</h2>
          <p className="post-meta">by {post.author} · {post.comments.length} comments · {getReadingTimeMinutes(post.content)} min read</p>
          <p className="post-excerpt">{getPostExcerpt(post.content)}</p>
          <div className="post-actions">
            <button className="text-button" onClick={() => navigate(`/posts/${post.id}`)}>View</button>
            <PostLikeButton postId={post.id} />
            <button
              className={`text-button bookmark-button${bookmarks.isBookmarked(post.id) ? ' is-bookmarked' : ''}`}
              type="button"
              aria-pressed={bookmarks.isBookmarked(post.id)}
              onClick={() => {
                bookmarks.toggleBookmark(post.id);
                if (showBookmarked) dispatch(setPage(1));
              }}
            >
              {bookmarks.isBookmarked(post.id) ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button className="text-button" onClick={() => navigate(`/posts/${post.id}/edit`)}>Edit</button>
            <button className="text-button" onClick={() => publishMutation.mutate(post.id)}>
              {publishMutation.isPending ? '...' : post.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              className="text-button button-danger"
              onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(post.id); }}
            >
              Delete
            </button>
          </div>
        </article>
      ))}

      {!!data?.totalPages && (
        <nav className="pagination" aria-label="Post pages">
          <button className="button button-secondary pagination-button" disabled={page <= 1 || isFetching} onClick={() => dispatch(setPage(page - 1))}>
            Previous
          </button>
          <span className="pagination-label">Page {data.page} of {data.totalPages}</span>
          <button className="button button-secondary pagination-button" disabled={page >= data.totalPages || isFetching} onClick={() => dispatch(setPage(page + 1))}>
            Next
          </button>
        </nav>
      )}
    </main>
  );
};

export default PostsPage;
