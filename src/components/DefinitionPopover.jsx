import { useEffect, useState } from 'react';
import { Stamp } from 'lucide-react';
import { lookupWord } from '../lib/lookupWord.js';
import { translateSentence } from '../lib/translateSentence.js';

const WIDTH = 288;
const MARGIN = 12;

function clampPosition(rect) {
  const left = Math.min(Math.max(rect.left, MARGIN), window.innerWidth - WIDTH - MARGIN);
  const top = Math.min(rect.bottom + 8, window.innerHeight - 220);
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
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setSenses(null);
    setLoading(true);
    setTranslation(null);
    setTranslateError('');

    lookupWord(target.text).then((result) => {
      if (!cancelled) {
        setSenses(result);
        setLoading(false);
      }
    });

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
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="fixed z-40 w-72 rounded-xl border border-rule bg-surface p-4 shadow-xl"
        style={{ left, top }}
        role="dialog"
        aria-label={`Definition for ${target.text}`}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="font-reading text-2xl leading-tight">{target.text}</p>
            <p className="mt-1 font-mono text-sm text-jade">{pinyinText}</p>
          </div>
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
            className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-seal-soft"
          >
            <Stamp
              size={20}
              strokeWidth={2}
              className={saved ? 'text-seal' : 'text-ink-faint'}
              fill={saved ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {loading && <p className="text-sm text-ink-faint">Looking up…</p>}
        {!loading && (!senses || senses.length === 0) && (
          <p className="text-sm text-ink-faint">No definition found.</p>
        )}
        {!loading && senses && senses.length > 0 && (
          <ul className="mb-1 space-y-1.5 text-sm leading-snug text-ink">
            {senses.map((sense, i) => (
              <li key={i}>
                {sense.t && <span className="text-ink-faint">({sense.t}) </span>}
                {sense.d.join('; ')}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 border-t border-rule pt-3">
          {!translation && !translating && (
            <button
              type="button"
              onClick={handleTranslate}
              className="text-sm font-medium text-jade hover:underline"
            >
              Translate full sentence →
            </button>
          )}
          {translating && <p className="text-sm text-ink-faint">Translating…</p>}
          {translation && (
            <p className="text-sm italic leading-snug text-ink-soft">“{translation}”</p>
          )}
          {translateError && <p className="text-sm text-seal">{translateError}</p>}
        </div>
      </div>
    </>
  );
}
