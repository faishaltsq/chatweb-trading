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
      className={`border-t hairline glass p-4 transition-colors duration-200 ${
        dragging ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)]'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
    >
      <div className="max-w-4xl mx-auto">
        {previews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {previews.map((p, i) => (
              <div key={i} className="relative group animate-slideUp">
                <img
                  src={p.url}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-xl border hairline border-[var(--border-bright)]"
                />
                <button
                  onClick={() => removePreview(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--bear)] flex items-center justify-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-lg touch-manipulation"
                  title="Remove image"
                >
                  <X size={12} className="text-white" />
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

        <div className="flex items-end gap-2 bg-[var(--bg-elevated)] border hairline border-[var(--border-bright)] rounded-2xl px-2.5 sm:px-3 py-1.5 sm:py-2 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)] transition-all duration-200">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl hover:bg-white/8 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center justify-center flex-shrink-0 touch-manipulation"
            title="Upload chart image"
          >
            <ImagePlus size={19} />
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
            className="flex-1 resize-none bg-transparent text-[var(--text-primary)] text-base sm:text-sm placeholder-[var(--text-muted)] outline-none py-2 max-h-32 scrollbar-thin"
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
            className="min-w-[38px] min-h-[38px] sm:min-w-[40px] sm:min-h-[40px] rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center flex-shrink-0 touch-manipulation"
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
