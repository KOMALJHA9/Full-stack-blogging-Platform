import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generatePostDraft } from '../api/aiApi';
import { useAutoSavedDraft } from '../hooks/useAutoSavedDraft';
import { useCreatePost } from '../hooks/usePostMutations';
import MarkdownEditor from '../components/MarkdownEditor';

const TAGS = ['general', 'react', 'node', 'typescript'];
const DRAFT_STORAGE_KEY = 'rq-blog:draft:create';

interface CreatePostDraft {
  title: string;
  content: string;
  author: string;
  tag: string;
}

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreatePostDraft>({ title: '', content: '', author: '', tag: 'general' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiError, setAiError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const autoSavedDraft = useAutoSavedDraft<CreatePostDraft>(DRAFT_STORAGE_KEY);
  const createMutation = useCreatePost();

  const updateField = <K extends keyof CreatePostDraft,>(field: K, value: CreatePostDraft[K]) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    autoSavedDraft.save(updatedForm);
  };

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setAiError('');
    try {
      const draft = await generatePostDraft(aiPrompt.trim());
      const updatedForm = { ...form, title: draft.title, content: draft.content, tag: draft.tag };
      setForm(updatedForm);
      autoSavedDraft.save(updatedForm);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Could not generate a draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) return;
    try {
      const post = await createMutation.mutateAsync(form);
      autoSavedDraft.clear();
      // After mutateAsync — cache is already invalidated
      // Navigate to the new post
      navigate(`/posts/${post.id}`);
    } catch {
      // error shown via mutation state
    }
  };

  return (
    <main className="page-shell form-shell">
      <button className="back-button" onClick={() => navigate('/')}>← Back</button>
      <h1 className="page-title form-page-title">Create Post</h1>

      {autoSavedDraft.recoveryDraft && (
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

      <div className="draft-save-status" aria-live="polite">
        {autoSavedDraft.isSaving ? 'Saving draft…' : autoSavedDraft.saveError ? 'Draft could not be saved locally.' : autoSavedDraft.lastSavedAt ? `Draft saved locally at ${new Date(autoSavedDraft.lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Draft saves automatically'}
      </div>

      <div className="dev-note">
        <span className="dev-note-label">On success, invalidates:</span>
        <code className="dev-note-code">queryClient.invalidateQueries(['posts'])</code>
        <span className="dev-note-hint">→ all post lists refresh</span>
      </div>

      <section className="ai-draft-panel" aria-labelledby="ai-draft-title">
        <div className="ai-panel-heading">
          <span className="ai-mark" aria-hidden="true">AI</span>
          <h2 id="ai-draft-title" className="ai-panel-title">Draft with AI</h2>
        </div>
        <form className="ai-draft-form" onSubmit={handleGenerateDraft}>
          <textarea
            className="field-control ai-prompt"
            aria-label="Describe the blog post to generate"
            placeholder="What should this post be about?"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            maxLength={3000}
            required
          />
          <button className="button button-secondary" type="submit" disabled={isGenerating || !aiPrompt.trim()}>
            {isGenerating ? 'Generating…' : 'Generate draft'}
          </button>
        </form>
        {aiError && <p className="ai-error" role="alert">{aiError}</p>}
      </section>

      {createMutation.isError && (
        <div className="error-banner">Failed to create post. Try again.</div>
      )}

      <form onSubmit={handleSubmit} className="form-panel">
        <label className="field-label">Title</label>
        <input className="field-control form-control" value={form.title} onChange={e => updateField('title', e.target.value)} required />

        <label className="field-label">Author</label>
        <input className="field-control form-control" value={form.author} onChange={e => updateField('author', e.target.value)} required />

        <label className="field-label">Tag</label>
        <select className="field-control form-control" value={form.tag} onChange={e => updateField('tag', e.target.value)}>
          {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label className="field-label" htmlFor="create-post-content">Content</label>
        <MarkdownEditor
          id="create-post-content"
          value={form.content}
          onChange={content => updateField('content', content)}
          required
        />

        <button className="button button-primary" type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </main>
  );
};

export default CreatePostPage;
