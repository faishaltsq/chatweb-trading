'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Eye, Brain, Zap } from 'lucide-react';

export interface ModelOption {
  id: string;
  label: string;
  description: string;
  vision: boolean;
  reasoning: boolean;
  icon: 'eye' | 'brain' | 'zap';
}

export const MODELS: ModelOption[] = [
  {
    id: 'ag/gemini-3.8-flash-high',
    label: 'Gemini 3.8 Flash High',
    description: 'Vision + thinking · best for chart analysis',
    vision: true,
    reasoning: true,
    icon: 'eye',
  },
  {
    id: 'ag/gemini-3.8-flash-medium',
    label: 'Gemini 3.8 Flash Medium',
    description: 'Vision + thinking · balanced speed',
    vision: true,
    reasoning: true,
    icon: 'eye',
  },
  {
    id: 'ag/claude-opus-4-6-thinking',
    label: 'Claude Opus 4.6 Thinking',
    description: 'Deep reasoning · text only',
    vision: false,
    reasoning: true,
    icon: 'brain',
  },
  {
    id: 'ag/claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    description: 'Fast Claude · text only',
    vision: false,
    reasoning: true,
    icon: 'brain',
  },
  {
    id: 'ag/gemini-pro-agent',
    label: 'Gemini Pro Agent',
    description: 'Vision · fast, no thinking',
    vision: true,
    reasoning: false,
    icon: 'zap',
  },
];

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

function ModelIcon({ icon, size = 14 }: { icon: ModelOption['icon']; size?: number }) {
  if (icon === 'eye') return <Eye size={size} />;
  if (icon === 'brain') return <Brain size={size} />;
  return <Zap size={size} />;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = MODELS.find((m) => m.id === value) ?? MODELS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/8 border hairline border-[var(--border-bright)] text-[var(--text-secondary)] hover:text-white transition-all duration-200 text-xs"
      >
        <ModelIcon icon={selected.icon} size={13} />
        <span className="max-w-[120px] truncate hidden sm:block">{selected.label}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-[var(--bg-elevated)] border hairline border-[var(--border-bright)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-dropIn">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => { onChange(model.id); setOpen(false); }}
              className={`flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.04] transition-colors border-b hairline border-[var(--border)] last:border-0 ${
                value === model.id ? 'bg-[var(--accent-subtle)]' : ''
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${value === model.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                <ModelIcon icon={model.icon} size={15} />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-medium ${value === model.id ? 'text-[var(--accent)]' : 'text-white'}`}>
                  {model.label}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{model.description}</div>
                <div className="flex gap-1.5 mt-1.5">
                  {model.vision && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--info)]/12 text-[var(--info)]">vision</span>
                  )}
                  {model.reasoning && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--warning)]/12 text-[var(--warning)]">thinking</span>
                  )}
                  {!model.vision && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-[var(--text-muted)]">text only</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
