import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePost }       from '../hooks/usePost';
import { useComments }   from '../hooks/useComments';
import { useAutoSavedDraft } from '../hooks/useAutoSavedDraft';
import { useBookmarks } from '../hooks/useBookmarks';
import PostLikeButton from '../components/PostLikeButton';
import { useAddComment, useDeleteComment, useDeletePost } from '../hooks/usePostMutations';
import { generatePostSummary } from '../api/aiApi';
import { getReadingTimeMinutes } from '../utils/readingTime';
import MarkdownContent from '../components/MarkdownContent';

interface CommentDraft {
  body: string;
  author: string;
}

const PostDetailPage: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const postId   = Number(id);
  const navigate = useNavigate();

  const [commentDraft, setCommentDraft] = useState<CommentDraft>({ body: '', author: '' });
  const [summaryResult, setSummaryResult] = useState<{ key: string; summary: string } | null>(null);
  const [summaryRequestKey, setSummaryRequestKey] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<{ key: string; message: string } | null>(null);
  const autoSavedDraft = useAutoSavedDraft<CommentDraft>(`rq-blog:draft:comment:${postId}`);
  const bookmarks = useBookmarks();

  // Query key: ['posts', postId]  e.g. ['posts', 1]
  const { data: post, isLoading: postLoading } = usePost(postId);

  // Query key: ['posts', postId, 'comments']  e.g. ['posts', 1, 'comments']
  const { data: comments, isLoading: commentsLoading } = useComments(postId);

  const addCommentMutation    = useAddComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);
  const deletePostMutation    = useDeletePost();

  const updateCommentField = <K extends keyof CommentDraft,>(field: K, value: CommentDraft[K]) => {
    const updatedDraft = { ...commentDraft, [field]: value };
    setCommentDraft(updatedDraft);
    autoSavedDraft.save(updatedDraft);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentDraft.body.trim() || !commentDraft.author.trim()) return;
    await addCommentMutation.mutateAsync(commentDraft);
    autoSavedDraft.clear();
    setCommentDraft({ body: '', author: '' });
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post and all its comments?')) return;
    await deletePostMutation.mutateAsync(postId);
    navigate('/');
  };

  const handleGenerateSummary = async () => {
    if (!post || summaryRequestKey) return;
    const key = `${post.id}:${post.updatedAt}`;
    setSummaryRequestKey(key);
    setSummaryError(null);
    try {
      const summary = await generatePostSummary(post.content);
      setSummaryResult({ key, summary });
    } catch (error) {
      setSummaryError({
        key,
        message: error instanceof Error ? error.message : 'Could not generate a summary.',
      });
    } finally {
      setSummaryRequestKey(null);
    }
  };

  if (postLoading) return <div className="state-message">Loading...</div>;
  if (!post)       return <div className="state-message">Post not found.</div>;

  const summaryKey = `${post.id}:${post.updatedAt}`;
  const summary = summaryResult?.key === summaryKey ? summaryResult.summary : '';
  const isSummarizing = summaryRequestKey === summaryKey;
  const currentSummaryError = summaryError?.key === summaryKey ? summaryError.message : '';

  return (
    <main className="page-shell detail-shell">
      <button className="back-button" onClick={() => navigate('/')}>← Back</button>

      {/* Query keys display */}
      <div className="dev-note">
        <div><span className="dev-note-label">Post key:</span> <code className="dev-note-code">['posts', {postId}]</code></div>
        <div><span className="dev-note-label">Comments key:</span> <code className="dev-note-code">['posts', {postId}, 'comments']</code></div>
      </div>

      <article className="detail-card">
        <div className="post-card-top">
          <span className="tag-chip">{post.tag}</span>
          <span className={`status-chip ${post.published ? 'is-published' : 'is-draft'}`}>
            {post.published ? 'Published' : 'Draft'}
          </span>
        </div>
        <h1 className="detail-title">{post.title}</h1>
        <p className="post-meta">by {post.author} · {new Date(post.createdAt).toLocaleDateString()} · {getReadingTimeMinutes(post.content)} min read</p>
        <section className="post-summary" aria-labelledby="summary-title">
          <div className="post-summary-header">
            <h2 id="summary-title" className="summary-title">AI summary</h2>
            <button className="button button-secondary summary-button" type="button" onClick={handleGenerateSummary} disabled={isSummarizing}>
              {isSummarizing ? 'Summarizing…' : summary ? 'Regenerate' : 'Summarize'}
            </button>
          </div>
          {summary && <p className="summary-copy" aria-live="polite">{summary}</p>}
          {currentSummaryError && <p className="summary-error" role="alert">{currentSummaryError}</p>}
        </section>
        <div className="detail-content markdown-content">
          <MarkdownContent content={post.content} />
        </div>
        <div className="post-actions">
          <button className="text-button" onClick={() => navigate(`/posts/${postId}/edit`)}>Edit</button>
          <PostLikeButton postId={postId} />
          <button
            className={`text-button bookmark-button${bookmarks.isBookmarked(postId) ? ' is-bookmarked' : ''}`}
            type="button"
            aria-pressed={bookmarks.isBookmarked(postId)}
            onClick={() => bookmarks.toggleBookmark(postId)}
          >
            {bookmarks.isBookmarked(postId) ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button className="text-button button-danger" onClick={handleDeletePost}>Delete post</button>
        </div>
      </article>

      {/* Comments section */}
      <h2 className="section-title">Comments ({comments?.length ?? 0})</h2>

      {commentsLoading && <p className="muted-copy">Loading comments...</p>}

      {comments?.map(comment => (
        <article key={comment.id} className="comment-item">
          <div className="comment-top">
            <strong className="comment-author">{comment.author}</strong>
            <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="comment-body">{comment.body}</p>
          <button
            className="text-button button-danger"
            onClick={() => deleteCommentMutation.mutate(comment.id)}
          >
            Delete
          </button>
        </article>
      ))}

      {/* Add comment form */}
      <section className="form-panel comment-form-panel">
        <h3 className="form-title">Add a comment</h3>
        {autoSavedDraft.recoveryDraft && (
          <div className="draft-recovery" role="status">
            <span>Unsaved comment from {new Date(autoSavedDraft.recoveryDraft.savedAt).toLocaleString()}.</span>
            <div className="draft-recovery-actions">
              <button className="text-button" type="button" onClick={() => {
                const recovered = autoSavedDraft.restore();
                if (recovered) setCommentDraft(recovered);
              }}>Restore</button>
              <button className="text-button button-danger" type="button" onClick={autoSavedDraft.discard}>Discard</button>
            </div>
          </div>
        )}
        <div className="draft-save-status" aria-live="polite">
          {autoSavedDraft.isSaving ? 'Saving comment draft…' : autoSavedDraft.saveError ? 'Comment draft could not be saved locally.' : autoSavedDraft.lastSavedAt ? `Comment draft saved locally at ${new Date(autoSavedDraft.lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Comment draft saves automatically'}
        </div>
        <form onSubmit={handleAddComment}>
          <input
            className="field-control form-control"
            placeholder="Your name"
            value={commentDraft.author}
            onChange={e => updateCommentField('author', e.target.value)}
            required
          />
          <textarea
            className="field-control form-control comment-input"
            placeholder="Write a comment..."
            value={commentDraft.body}
            onChange={e => updateCommentField('body', e.target.value)}
            required
          />
          <button className="button button-primary" type="submit" disabled={addCommentMutation.isPending}>
            {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default PostDetailPage;
