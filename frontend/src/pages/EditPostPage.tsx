import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePost }       from '../hooks/usePost';
import { useAutoSavedDraft } from '../hooks/useAutoSavedDraft';
import { useUpdatePost } from '../hooks/usePostMutations';
import MarkdownEditor from '../components/MarkdownEditor';

const TAGS = ['general', 'react', 'node', 'typescript'];

interface EditPostDraft {
  title: string;
  content: string;
  tag: string;
}

const EditPostPage: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const postId   = Number(id);
  const navigate = useNavigate();

  // Reads from cache ['posts', postId] — no extra API call if already cached
  const { data: post, isLoading } = usePost(postId);
  const updateMutation = useUpdatePost();

  const [form, setForm] = useState<EditPostDraft>({ title: '', content: '', tag: 'general' });
  const autoSavedDraft = useAutoSavedDraft<EditPostDraft>(`rq-blog:draft:edit:${postId}`);

  // Pre-fill form from cached post data
  useEffect(() => {
    if (post) {
      setForm({ title: post.title, content: post.content, tag: post.tag });
    }
  }, [post]);

  const updateField = <K extends keyof EditPostDraft,>(field: K, value: EditPostDraft[K]) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    autoSavedDraft.save(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    await updateMutation.mutateAsync({ id: postId, data: form });
    autoSavedDraft.clear();
    navigate(`/posts/${postId}`);
  };

  if (isLoading) return <div className="state-message">Loading...</div>;
  if (!post)     return <div className="state-message">Post not found.</div>;

  return (
    <main className="page-shell form-shell">
      <button className="back-button" onClick={() => navigate(`/posts/${postId}`)}>← Back</button>
      <h1 className="page-title form-page-title">Edit Post</h1>

      {post && autoSavedDraft.recoveryDraft && (
        <div className="draft-recovery" role="status">
          <span>Unsaved draft from {new Date(autoSavedDraft.recoveryDraft.savedAt).toLocaleString()}.</span>
          <div className="draft-recovery-actions">
            <button className="text-button" type="button" onClick={() => {
              const recovered = autoSavedDraft.restore();
              if (recovered) setForm(recovered);
            }}>Restore</button>
            <button className="text-button button-danger" type="button" onClick={autoSavedDraft.discard}>Discard</button>
          </div>
        </div>
      )}

      {post && <div className="draft-save-status" aria-live="polite">
        {autoSavedDraft.isSaving ? 'Saving draft…' : autoSavedDraft.saveError ? 'Draft could not be saved locally.' : autoSavedDraft.lastSavedAt ? `Draft saved locally at ${new Date(autoSavedDraft.lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Draft saves automatically'}
      </div>}

      <div className="dev-note">
        <span className="dev-note-label">Reads from cache (no API call if fresh):</span>
        <code className="dev-note-code">['posts', {postId}]</code>
        <span className="dev-note-label">On save, invalidates both:</span>
        <code className="dev-note-code">['posts', {postId}]  →  single post refreshes</code>
        <code className="dev-note-code">['posts']  →  all lists refresh</code>
      </div>

      <form onSubmit={handleSubmit} className="form-panel">
        <label className="field-label">Title</label>
        <input className="field-control form-control" value={form.title} onChange={e => updateField('title', e.target.value)} required />

        <label className="field-label">Tag</label>
        <select className="field-control form-control" value={form.tag} onChange={e => updateField('tag', e.target.value)}>
          {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label className="field-label" htmlFor="edit-post-content">Content</label>
        <MarkdownEditor
          id="edit-post-content"
          value={form.content}
          onChange={content => updateField('content', content)}
          required
        />

        <button className="button button-primary" type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
};

export default EditPostPage;
