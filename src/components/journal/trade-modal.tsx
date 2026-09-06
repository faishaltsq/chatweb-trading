'use client';

import { useState, useRef } from 'react';
import { X, Plus, Trash2, Star, Upload } from 'lucide-react';
import {
  PAIRS, TIMEFRAMES, STATUSES, DIRECTIONS, EMOTIONS,
  type TradeFormData, emptyTrade,
} from '@/lib/journal/constants';

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TradeFormData) => void;
  initial?: TradeFormData;
  title?: string;
}

export default function TradeModal({ open, onClose, onSave, initial, title }: TradeModalProps) {
  const [form, setForm] = useState<TradeFormData>(initial || emptyTrade());
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative z-10 bg-[var(--bg-surface)] border border-[var(--border-bright)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-slideUp shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)] z-10">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title || 'New Trade'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className="input-field" />
            </Field>
            <Field label="Pair">
              <select value={form.pair} onChange={(e) => set('pair', e.target.value)} className="input-field">
                {PAIRS.map((p) => <option key={p}>{p}</option>)}
              </select>
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

          <div className="grid grid-cols-3 gap-3">
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
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addTP}
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:brightness-125 transition-colors">
                <Plus size={13} /> Add Take Profit
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Setup Quality">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button key={n} type="button" onClick={() => set('setupRating', n)}
                    className={`p-0.5 transition-colors ${(form.setupRating ?? 0) >= n ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]/30'}`}>
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
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent)] text-xs border border-[var(--accent-dim)]">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-white transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="input-field flex-1" placeholder="Add tag..." />
              <button type="button" onClick={addTag}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-[var(--text-secondary)] hover:bg-white/10 transition-colors">Add</button>
            </div>
          </Field>

          <Field label="Chart Screenshot">
            {form.chartUrl ? (
              <div className="relative group">
                <img src={form.chartUrl} alt="chart" className="max-h-40 rounded-lg border border-[var(--border)]" />
                <button type="button" onClick={() => set('chartUrl', '')}
                  className="absolute top-1 right-1 p-1 rounded bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-[var(--border)] hover:border-[var(--accent-dim)] text-[var(--text-muted)] text-xs transition-colors">
                <Upload size={14} /> Upload screenshot
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </Field>

          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
              className="input-field min-h-[80px] resize-y" placeholder="Entry rationale, market context, lessons..." />
          </Field>

          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit"
              className="group relative px-5 py-2 rounded-lg bg-[var(--accent)] hover:brightness-110 text-[var(--bg-root)] text-sm font-semibold transition-all duration-200">
              {initial ? 'Update Trade' : 'Add Trade'}
              <div className="absolute inset-0 rounded-lg bg-[var(--accent-glow)] blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  );
}
