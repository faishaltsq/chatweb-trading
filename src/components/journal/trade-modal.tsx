'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Star, Upload } from 'lucide-react';
import ChartImageModal from './chart-image-modal';
import {
  TIMEFRAMES, STATUSES, DIRECTIONS, EMOTIONS,
  type TradeFormData, emptyTrade,
} from '@/lib/journal/constants';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TradeFormData) => void;
  initial?: TradeFormData;
  title?: string;
  savedPairs?: string[];
}

export default function TradeModal({ open, onClose, onSave, initial, title, savedPairs = [] }: TradeModalProps) {
  const [form, setForm] = useState<TradeFormData>(initial || emptyTrade());
  const [tagInput, setTagInput] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyTrade());
      setTagInput('');
    }
  }, [open, initial]);

  if (!open) return null;

  function set<K extends keyof TradeFormData>(key: K, val: TradeFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addTP() {
    set('takeProfit', [...form.takeProfit, 0]);
  }

  function removeTP(i: number) {
    set('takeProfit', form.takeProfit.filter((_, idx) => idx !== i));
  }

  function setTP(i: number, val: number) {
    const tps = [...form.takeProfit];
    tps[i] = val;
    set('takeProfit', tps);
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t]);
    }
    setTagInput('');
  }

  function removeTag(t: string) {
    set('tags', form.tags.filter((x) => x !== t));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('chartUrl', reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" onClick={onClose} />
      <div className="relative z-10 bg-[var(--bg-surface)] border hairline border-[var(--border-bright)] rounded-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto scrollbar-thin animate-slideUp shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b hairline border-[var(--border)] sticky top-0 bg-[var(--bg-surface)] z-10 rounded-t-2xl">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight">{title || 'New Trade'}</h2>
          <button
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] rounded-xl hover:bg-white/8 text-[var(--text-secondary)] transition-colors flex items-center justify-center touch-manipulation"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className="input-field" />
            </Field>
            <Field label="Pair / Symbol">
              <input
                list="pair-suggestions"
                value={form.pair}
                onChange={(e) => set('pair', e.target.value.toUpperCase())}
                className="input-field font-mono"
                placeholder="XAUUSD, AAPL, BBRI..."
                autoComplete="off"
                spellCheck={false}
              />
              <datalist id="pair-suggestions">
                {savedPairs.map((p) => <option key={p} value={p} />)}
              </datalist>
            </Field>
            <Field label="Direction">
              <select value={form.direction} onChange={(e) => set('direction', e.target.value)} className="input-field">
                {DIRECTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Timeframe">
              <select value={form.timeframe} onChange={(e) => set('timeframe', e.target.value)} className="input-field">
                {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <Field label="Entry Price">
              <input type="number" step="any" value={form.entryPrice ?? ''}
                onChange={(e) => set('entryPrice', e.target.value ? Number(e.target.value) : null)}
                className="input-field font-mono" placeholder="0.00" />
            </Field>
            <Field label="Stop Loss">
              <input type="number" step="any" value={form.stopLoss ?? ''}
                onChange={(e) => set('stopLoss', e.target.value ? Number(e.target.value) : null)}
                className="input-field font-mono" placeholder="0.00" />
            </Field>
            <Field label="Lot Size">
              <input type="number" step="any" value={form.lotSize ?? ''}
                onChange={(e) => set('lotSize', e.target.value ? Number(e.target.value) : null)}
                className="input-field font-mono" placeholder="0.01" />
            </Field>
          </div>

          <Field label="Take Profit">
            <div className="space-y-2">
              {form.takeProfit.map((tp, i) => (
                <div key={i} className="flex gap-2">
                  <input type="number" step="any" value={tp || ''}
                    onChange={(e) => setTP(i, Number(e.target.value))}
                    className="input-field flex-1 font-mono" placeholder={`TP${i + 1}`} />
                  <button type="button" onClick={() => removeTP(i)}
                    className="min-w-[36px] min-h-[36px] rounded-xl hover:bg-[var(--bear)]/15 text-[var(--bear)] transition-colors flex items-center justify-center touch-manipulation">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addTP}
                className="flex items-center gap-1.5 py-1 text-xs text-[var(--accent)] hover:brightness-125 transition-colors touch-manipulation">
                <Plus size={13} /> Add Take Profit
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="PnL ($)">
              <input type="number" step="any" value={form.pnlDollar ?? ''}
                onChange={(e) => set('pnlDollar', e.target.value ? Number(e.target.value) : null)}
                className="input-field font-mono" placeholder="0.00" />
            </Field>
            <Field label="PnL (pips/pts)">
              <input type="number" step="any" value={form.pnlPips ?? ''}
                onChange={(e) => set('pnlPips', e.target.value ? Number(e.target.value) : null)}
                className="input-field font-mono" placeholder="0" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <Field label="Setup Quality">
              <div className="flex gap-1 flex-wrap items-center pt-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set('setupRating', n)}
                    className={`min-w-[28px] min-h-[28px] p-1 rounded-md flex items-center justify-center transition-colors touch-manipulation ${(form.setupRating ?? 0) >= n ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]/30'}`}
                  >
                    <Star size={16} fill={(form.setupRating ?? 0) >= n ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Emotion">
              <select value={form.emotion} onChange={(e) => set('emotion', e.target.value)} className="input-field">
                <option value="">-</option>
                {EMOTIONS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tags">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map((t) => (
                <span key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent)] text-xs border hairline border-[var(--accent-dim)]">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-white transition-colors p-0.5">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="input-field flex-1" placeholder="Add tag..." />
              <button
                type="button"
                onClick={addTag}
                className="px-3.5 py-2 min-h-[38px] rounded-xl bg-white/5 text-xs text-[var(--text-secondary)] hover:bg-white/8 transition-colors touch-manipulation"
              >
                Add
              </button>
            </div>
          </Field>

          <Field label="Chart Screenshot">
            {form.chartUrl ? (
              <div className="relative group">
                <img
                  src={form.chartUrl}
                  alt="chart"
                  onClick={() => setShowFullImage(true)}
                  className="max-h-40 rounded-xl border hairline border-[var(--border)] cursor-pointer hover:opacity-90 transition-opacity"
                  title="Klik untuk memperbesar"
                />
                <button type="button" onClick={() => set('chartUrl', '')}
                  className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/60 text-[var(--bear)] opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border hairline border-dashed border-[var(--border)] hover:border-[var(--accent-dim)] text-[var(--text-muted)] text-xs transition-colors touch-manipulation">
                <Upload size={14} /> Upload screenshot
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </Field>

          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              className="input-field min-h-[80px] resize-y" placeholder="Entry rationale, market context, lessons..." />
          </Field>

          <div className="flex justify-end gap-2.5 pt-2 border-t hairline border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-white/5 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/85 text-white text-sm font-semibold transition-all duration-200 shadow-[0_0_16px_var(--accent-glow)] touch-manipulation"
            >
              {initial ? 'Update Trade' : 'Add Trade'}
            </button>
          </div>
        </form>

        <ChartImageModal
          open={showFullImage}
          onClose={() => setShowFullImage(false)}
          imageUrl={form.chartUrl}
          title={`${form.pair || 'Trade'} Chart Screenshot`}
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[var(--text-muted)] mb-1.5 font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
