import { useEffect, useState } from 'react';
import { Stamp, X, Globe, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { lookupWord } from '../utils/lookupWord.js';
import { translateSentence } from '../utils/translateSentence.js';
import { convertWordAsync } from '../utils/chineseConversion.js';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { getHskLevel } from '../utils/hsk.js';
import { speakText, stopSpeech } from '../utils/tts.js';

const WIDTH = 380; // Desktop width for popover
const MARGIN = 16;

function computePopoverPosition(rect, popoverElement) {
  if (typeof window === 'undefined' || !rect) {
    return { left: MARGIN, top: MARGIN };
  }

  const popoverHeight = popoverElement ? popoverElement.offsetHeight : 320;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const left = Math.min(Math.max(rect.left, MARGIN), viewportWidth - WIDTH - MARGIN);

  let top = rect.bottom + 10;

  if (top + popoverHeight > viewportHeight - MARGIN) {
    const topAbove = rect.top - popoverHeight - 10;
    if (topAbove >= MARGIN) {
      top = topAbove;
    } else {
      top = Math.max(MARGIN, viewportHeight - popoverHeight - MARGIN);
    }
  }

  return { left: Math.max(left, MARGIN), top: Math.max(top, MARGIN) };
}

/**
 * Popover shown when a character/phrase is tapped in the reader.
 * Formatted like DeepL Dictionary entry cards with Audio pronunciation,
 * HSK level tags, CC-CEDICT definitions, and sentence translation.
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
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const [position, setPosition] = useState({ left: MARGIN, top: MARGIN });

  const [isPlayingWordAudio, setIsPlayingWordAudio] = useState(false);
  const [copiedSentence, setCopiedSentence] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEscapeKey(onClose, Boolean(target));
  const popoverRef = useFocusTrap(Boolean(target));

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
      } catch {
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
      stopSpeech();
    };
  }, [target]);

  useEffect(() => {
    if (!target || isMobile) return;

    const updatePosition = () => {
      setPosition(computePopoverPosition(target.rect, popoverRef.current));
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [target, isMobile, loading, senses, translation, popoverRef]);

  if (!target) return null;

  const handleSpeakWord = () => {
    if (isPlayingWordAudio) {
      stopSpeech();
      setIsPlayingWordAudio(false);
    } else {
      const wordToSpeak = simpWord || target.text;
      setIsPlayingWordAudio(true);
      speakText(
        wordToSpeak,
        'zh-CN',
        () => setIsPlayingWordAudio(false),
        () => setIsPlayingWordAudio(false)
      );
    }
  };

  const handleTranslate = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setTranslateError('Sentence translation requires an internet connection.');
      return;
    }
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
  const checkedText = simpWord || target.text;
  const hskLevel = getHskLevel(checkedText);

  const popoverStyle = isMobile
    ? { left: '50%', transform: 'translateX(-50%)', bottom: '1.25rem', top: 'auto' }
    : { left: position.left, top: position.top };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />
      <div
        ref={popoverRef}
        className="fixed z-40 w-[calc(100vw-2.5rem)] max-h-[calc(100vh-2rem)] overflow-y-auto sm:w-auto sm:min-w-[24rem] sm:max-w-md rounded-3xl border border-rule bg-surface p-5 sm:p-6 shadow-2xl shadow-black/15 ring-1 ring-white/70 transition-all dark:border-slate-800 dark:bg-slate-950"
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label={`Definition for ${target.text}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-reading text-3xl leading-tight text-ink dark:text-slate-100 font-bold flex flex-wrap items-baseline gap-2">
                <span>{simpWord || target.text}</span>
                {simpWord && tradWord && simpWord !== tradWord && (
                  <span className="text-lg font-normal text-ink-soft dark:text-slate-400">
                    ({tradWord})
                  </span>
                )}
              </h2>

              <button
                type="button"
                onClick={handleSpeakWord}
                title={isPlayingWordAudio ? 'Stop audio' : 'Listen to word pronunciation'}
                aria-label="Listen to word pronunciation"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                  isPlayingWordAudio
                    ? 'bg-seal-soft border-seal text-seal dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-surface-dim border-rule text-jade hover:bg-jade-soft dark:border-slate-800 dark:bg-slate-900 dark:text-sky-400'
                }`}
              >
                {isPlayingWordAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isPlayingWordAudio ? 'Stop' : 'Listen'}</span>
              </button>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                {target.text.length > 1 ? 'phrase' : 'character'}
              </span>
              {hskLevel !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-full bg-jade-soft px-2.5 py-0.5 text-[11px] font-bold text-jade dark:bg-emerald-950 dark:text-emerald-300">
                  HSK {hskLevel}
                </span>
              )}
            </div>

            <p className="mt-2 text-base font-bold text-jade dark:text-sky-400">{pinyinText}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                onToggleSave({
                  word: target.text,
                  pinyin: pinyinText,
                  definitions: senses?.map((s) => s.d.join('; ')) ?? [],
                })
              }
              aria-label={saved ? 'Remove from vocab list' : 'Save to vocab list'}
              aria-pressed={saved}
              className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer ${
                saved
                  ? 'bg-seal-soft border-seal/30 text-seal shadow-xs dark:bg-rose-950 dark:text-rose-300'
                  : 'bg-surface border-rule text-ink-soft hover:bg-seal-soft hover:text-seal dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <Stamp
                size={14}
                strokeWidth={2.25}
                fill={saved ? 'currentColor' : 'none'}
              />
              <span>{saved ? 'Saved' : 'Save Word'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close definition popover"
              className="inline-flex items-center gap-1 rounded-2xl border border-rule bg-surface px-2.5 py-1.5 text-xs font-bold text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            >
              <X size={16} strokeWidth={2.25} />
              <span>Close</span>
            </button>
          </div>
        </div>

        <div className="space-y-3" aria-live="polite">
          {loading ? (
            <div className="rounded-2xl bg-surface-dim p-4 dark:bg-slate-900 animate-pulse" aria-busy="true">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint dark:text-slate-500">Looking up definitions</p>
              <p className="mt-1 text-xs leading-5 text-ink-soft dark:text-slate-400">Fetching dictionary results for this token.</p>
            </div>
          ) : lookupError ? (
            <div className="rounded-2xl bg-butter/90 px-4 py-3 text-xs font-bold text-seal">
              {lookupError}
            </div>
          ) : senses && senses.length > 0 ? (
            <ul className="space-y-2 text-sm leading-relaxed text-ink dark:text-slate-100">
              {senses.map((sense, i) => (
                <li key={i} className="rounded-2xl border border-rule/60 bg-surface-dim p-3.5 dark:border-slate-800 dark:bg-slate-900">
                  {sense.t && sense.t !== (simpWord || target.text) && (
                    <span className="text-xs text-ink-faint font-medium">({sense.t}) </span>
                  )}
                  <span className="font-semibold text-ink-soft dark:text-slate-200">{sense.d.join('; ')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl bg-surface-dim p-4 text-xs font-medium text-ink-soft dark:bg-slate-900 dark:text-slate-400">
              No dictionary entry found for this token. You can still translate the full sentence below.
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-rule pt-4 dark:border-slate-800">
          <div className="flex flex-col gap-2.5" aria-live="polite">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer ${
                translating
                  ? 'bg-surface-dim text-ink-soft'
                  : 'bg-jade text-white shadow-xs hover:bg-jade/90'
              }`}
            >
              <Globe size={15} strokeWidth={2.25} />
              <span>{translating ? 'Translating…' : 'Translate full sentence (online)'}</span>
            </button>

            {translation && (
              <div className="relative rounded-2xl border border-rule bg-surface-dim p-3.5 text-xs font-medium italic leading-relaxed text-ink-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <div className="flex items-start justify-between gap-2">
                  <span>“{translation}”</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(translation);
                      setCopiedSentence(true);
                      setTimeout(() => setCopiedSentence(false), 2000);
                    }}
                    title="Copy sentence translation"
                    aria-label="Copy sentence translation"
                    className="inline-flex items-center gap-1 shrink-0 text-ink-faint hover:text-ink cursor-pointer font-bold text-[11px]"
                  >
                    {copiedSentence ? <Check size={14} className="text-jade" /> : <Copy size={14} />}
                    <span>{copiedSentence ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}
            {translateError && <p className="text-xs font-semibold text-seal">{translateError}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
