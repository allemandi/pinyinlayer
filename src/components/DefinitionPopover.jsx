import { useEffect, useState } from 'react';
import { Stamp, X } from 'lucide-react';
import { lookupWord } from '../utils/lookupWord.js';
import { translateSentence } from '../utils/translateSentence.js';

const WIDTH = 320;
const MARGIN = 16;

function clampPosition(rect) {
  const left = Math.min(Math.max(rect.left, MARGIN), window.innerWidth - WIDTH - MARGIN);
  const top = Math.min(rect.bottom + 10, window.innerHeight - 240);
  return { left: Math.max(left, MARGIN), top: Math.max(top, MARGIN) };
}

/**
 * Popover shown when a character/phrase is tapped in the reader. Looks up
 * CC-CEDICT definitions, offers a save-to-vocab "stamp", and translates the
 * containing sentence on demand.
 */
export default function DefinitionPopover({ target, onClose, isSaved, onToggleSave }) {
  const [senses, setSenses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookupError, setLookupError] = useState('');
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  useEffect(() => {
    if (!target) return;
    let cancelled = false;

    async function fetchDefinitions() {
      setSenses(null);
      setLoading(true);
      setLookupError('');
      setTranslation(null);
      setTranslateError('');

      try {
        const result = await lookupWord(target.text);
        if (!cancelled) {
          setSenses(result ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setLookupError('Unable to load dictionary results right now.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDefinitions();

    return () => {
      cancelled = true;
    };
  }, [target]);

  if (!target) return null;

  const handleTranslate = async () => {
    setTranslating(true);
    setTranslateError('');
    try {
      setTranslation(await translateSentence(target.sentence));
    } catch {
      setTranslateError("Couldn't translate that sentence right now.");
    } finally {
      setTranslating(false);
    }
  };

  const pinyinText = target.pinyin.join(' ');
  const saved = isSaved(target.text);
  const { left, top } = clampPosition(target.rect);

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/10" onClick={onClose} />
      <div
        className="fixed z-40 min-w-[20rem] max-w-sm rounded-3xl border border-rule bg-surface p-5 shadow-2xl shadow-black/10 ring-1 ring-white/70 dark:border-slate-700 dark:bg-slate-950"
        style={{ left, top }}
        role="dialog"
        aria-modal="true"
        aria-label={`Definition for ${target.text}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-reading text-3xl leading-tight text-ink">{target.text}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-ink-faint">
              {target.text.length > 1 ? 'phrase' : 'character'}
            </p>
            <p className="mt-2 text-base font-medium text-jade">{pinyinText}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() =>
                onToggleSave({
                  word: target.text,
                  pinyin: pinyinText,
                  definitions: senses?.map((s) => s.d.join('; ')) ?? [],
                  sentence: target.sentence,
                })
              }
              aria-label={saved ? 'Remove from vocab list' : 'Save to vocab list'}
              aria-pressed={saved}
              className="rounded-full border border-rule bg-surface px-2.5 py-2 text-ink-faint transition hover:bg-seal-soft hover:text-seal"
            >
              <Stamp
                size={18}
                strokeWidth={2}
                className={saved ? 'text-seal' : 'text-ink-faint'}
                fill={saved ? 'currentColor' : 'none'}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close definition popover"
              className="rounded-full border border-rule bg-surface px-2.5 py-2 text-ink-faint transition hover:bg-surface-dim hover:text-ink"
            >
              <X size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-3xl bg-surface-dim p-4 dark:bg-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-faint dark:text-slate-500">Looking up definitions</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft dark:text-slate-400">Fetching dictionary results for this token.</p>
            </div>
          ) : lookupError ? (
            <div className="rounded-3xl bg-butter/90 px-4 py-3 text-sm leading-6 text-seal">
              {lookupError}
            </div>
          ) : senses && senses.length > 0 ? (
            <ul className="space-y-3 text-sm leading-6 text-ink dark:text-slate-100">
              {senses.map((sense, i) => (
                <li key={i} className="rounded-3xl bg-surface-dim px-4 py-3 dark:bg-slate-900">
                  {sense.t && <span className="text-ink-faint">({sense.t}) </span>}
                  <span>{sense.d.join('; ')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-3xl bg-surface-dim px-4 py-4 text-sm leading-6 text-ink-soft dark:bg-slate-900 dark:text-slate-400">
              No dictionary entry found for this token. You can still translate the full sentence below.
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-rule pt-4 dark:border-slate-700">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                translating
                  ? 'bg-surface-dim text-ink-soft'
                  : 'bg-jade text-white hover:bg-jade/90'
              }`}
            >
              {translating ? 'Translating…' : 'Translate full sentence'}
            </button>
            {translation && (
              <div className="rounded-3xl bg-surface-dim px-4 py-3 text-sm italic leading-6 text-ink-soft">
                “{translation}”
              </div>
            )}
            {translateError && <p className="text-sm text-seal">{translateError}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
