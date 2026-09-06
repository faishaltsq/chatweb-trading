'use client';

import { useRef, useState, useCallback } from 'react';
import { Send, ImagePlus, X, Loader2 } from 'lucide-react';

interface InputBarProps {
  onSend: (text: string, files?: FileList) => void;
  disabled: boolean;
}

export default function InputBar({ onSend, disabled }: InputBarProps) {
  const [input, setInput] = useState('');
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newPreviews: { file: File; url: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.type.startsWith('image/')) {
        newPreviews.push({ file: f, url: URL.createObjectURL(f) });
      }
    }
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  const handleSubmit = useCallback(() => {
    const text = input.trim();
    if (!text && previews.length === 0) return;

    if (previews.length > 0) {
      const dt = new DataTransfer();
      previews.forEach((p) => dt.items.add(p.file));
      onSend(text, dt.files);
    } else {
      onSend(text);
    }

    setInput('');
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [input, previews, onSend]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          setPreviews((prev) => [
            ...prev,
            { file, url: URL.createObjectURL(file) },
          ]);
        }
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer?.files || null);
  }

  return (
    <div
      className={`border-t bg-[var(--bg-surface)] p-4 transition-colors duration-200 ${
        dragging ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)]'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      <div className="max-w-3xl mx-auto">
        {previews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative group animate-slideUp">
                <img
                  src={p.url}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-lg border border-[var(--border-bright)]"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {dragging && (
          <div className="flex items-center justify-center py-4 mb-3 rounded-xl border-2 border-dashed border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] text-sm font-medium animate-fadeIn">
            Drop chart image here
          </div>
        )}

        <div className="flex items-end gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_1px_var(--accent-dim),0_0_16px_var(--accent-glow)] transition-all duration-200">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex-shrink-0"
            title="Upload chart image"
          >
            <ImagePlus size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Send a message or paste a chart..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none py-2 max-h-32 scrollbar-thin"
            style={{ minHeight: '36px' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = '36px';
              t.style.height = Math.min(t.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || (!input.trim() && previews.length === 0)}
            className="p-2 rounded-lg bg-[var(--accent)] hover:brightness-110 text-[var(--bg-root)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
          >
            {disabled ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="text-center text-[11px] text-[var(--text-muted)] mt-2">
          TradingChat AI · Gemini Vision + Claude Sonnet
        </div>
      </div>
    </div>
  );
}
