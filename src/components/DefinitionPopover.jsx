import { useEffect, useState } from 'react';
import { Stamp, X } from 'lucide-react';
import { lookupWord } from '../utils/lookupWord.js';
import { translateSentence } from '../utils/translateSentence.js';
import { convertWordAsync } from '../utils/chineseConversion.js';
import hskWords from '../data/hskWords.js';

const WIDTH = 380; // Desktop width for popover
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
 * Displays both Simplified and Traditional characters if they differ.
 */
export default function DefinitionPopover({ target, onClose, isSaved, onToggleSave }) {
  const [senses, setSenses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookupError, setLookupError] = useState('');
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  const [simpWord, setSimpWord] = useState('');
  const [tradWord, setTradWord] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Check if we are on a mobile view-port to render a centered bottom-sheet card
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;

    async function fetchDefinitions() {
      setSenses(null);
      setLoading(true);
      setLookupError('');
      setTranslation(null);
      setTranslateError('');
      setSimpWord('');
      setTradWord('');

      try {
        const [result, simp, trad] = await Promise.all([
          lookupWord(target.text),
          convertWordAsync(target.text, 'simplified'),
          convertWordAsync(target.text, 'traditional'),
        ]);

        if (!cancelled) {
          setSimpWord(simp);
          setTradWord(trad);
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

  // Render centered bottom sheet style on mobile, custom-positioned popover on desktop
  const popoverStyle = isMobile
    ? { left: '50%', transform: 'translateX(-50%)', bottom: '1.25rem', top: 'auto' }
    : { left, top };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div
        className="fixed z-40 w-[calc(100vw-2.5rem)] sm:w-auto sm:min-w-[24rem] sm:max-w-md rounded-3xl border border-rule bg-surface p-6 shadow-2xl shadow-black/15 ring-1 ring-white/70 transition-all dark:border-slate-700 dark:bg-slate-950"
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label={`Definition for ${target.text}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-reading text-3xl leading-tight text-ink flex flex-wrap items-baseline gap-2">
              <span className="font-bold">{simpWord || target.text}</span>
              {simpWord && tradWord && simpWord !== tradWord && (
                <span className="text-lg font-normal text-ink-soft dark:text-slate-400">
                  ({tradWord})
                </span>
              )}
            </h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-ink-faint">
              {target.text.length > 1 ? 'phrase' : 'character'}
              {(() => {
                const checkedText = simpWord || target.text;
                const hskLevel = hskWords[checkedText];
                return hskLevel !== undefined ? ` • HSK ${hskLevel}` : '';
              })()}
            </p>
            <p className="mt-2.5 text-base font-semibold text-jade">{pinyinText}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
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
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer ${
                saved
                  ? 'bg-seal-soft border-seal/30 text-seal shadow-xs'
                  : 'bg-surface border-rule text-ink-soft hover:bg-seal-soft hover:text-seal'
              }`}
            >
              <Stamp
                size={14}
                strokeWidth={2.25}
                fill={saved ? 'currentColor' : 'none'}
              />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close definition popover"
              className="rounded-full border border-rule bg-surface p-1.5 text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer"
            >
              <X size={16} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-3xl bg-surface-dim p-4 dark:bg-slate-900 animate-pulse">
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
                <li key={i} className="rounded-3xl bg-surface-dim px-4 py-3.5 dark:bg-slate-900">
                  {sense.t && sense.t !== (simpWord || target.text) && (
                    <span className="text-ink-faint font-medium">({sense.t}) </span>
                  )}
                  <span className="font-medium text-ink-soft dark:text-slate-200">{sense.d.join('; ')}</span>
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
              className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer ${
                translating
                  ? 'bg-surface-dim text-ink-soft'
                  : 'bg-jade text-white hover:bg-jade/90'
              }`}
            >
              {translating ? 'Translating…' : 'Translate full sentence'}
            </button>
            {translation && (
              <div className="rounded-3xl bg-surface-dim px-4 py-3.5 text-sm italic leading-6 text-ink-soft dark:bg-slate-900 dark:text-slate-300">
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
