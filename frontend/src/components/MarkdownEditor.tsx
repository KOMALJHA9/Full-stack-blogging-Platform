import React, { useRef, useState } from 'react';
import MarkdownContent from './MarkdownContent';

interface MarkdownEditorProps {
  id: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ id, value, required = false, onChange }) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const updated = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(updated);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const addListPrefix = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEndIndex = value.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const selectedLines = value.slice(lineStart, lineEnd);
    const listLines = selectedLines.split('\n').map(line => `- ${line || 'list item'}`).join('\n');
    onChange(`${value.slice(0, lineStart)}${listLines}${value.slice(lineEnd)}`);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + listLines.length);
    });
  };

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        <div className="markdown-modes" role="group" aria-label="Markdown editor mode">
          <button className="markdown-mode-button" type="button" aria-pressed={mode === 'write'} onClick={() => setMode('write')}>Write</button>
          <button className="markdown-mode-button" type="button" aria-pressed={mode === 'preview'} disabled={!value.trim()} onClick={() => setMode('preview')}>Preview</button>
        </div>
        {mode === 'write' && (
          <div className="markdown-tools" role="group" aria-label="Markdown formatting">
            <button className="markdown-tool markdown-bold" type="button" title="Bold" aria-label="Bold" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelection('**', '**', 'bold text')}>B</button>
            <button className="markdown-tool markdown-italic" type="button" title="Italic" aria-label="Italic" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelection('*', '*', 'italic text')}>I</button>
            <button className="markdown-tool" type="button" title="Insert link" aria-label="Insert link" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelection('[', '](https://)', 'link text')}>Link</button>
            <button className="markdown-tool" type="button" title="Bulleted list" aria-label="Bulleted list" onMouseDown={e => e.preventDefault()} onClick={addListPrefix}>List</button>
            <button className="markdown-tool markdown-code-tool" type="button" title="Code block" aria-label="Code block" onMouseDown={e => e.preventDefault()} onClick={() => wrapSelection('```\n', '\n```', 'code')}>Code</button>
          </div>
        )}
      </div>
      {mode === 'write' ? (
        <textarea
          ref={textareaRef}
          id={id}
          className="field-control markdown-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          aria-label="Post content in Markdown"
        />
      ) : (
        <div className="markdown-preview markdown-content" aria-label="Markdown preview">
          <MarkdownContent content={value} />
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;