import { useEffect, useRef, useState } from 'react';
import { Settings2, BookMarked, Type } from 'lucide-react';

const LEVELS = [1, 2, 3, 4, 5, 6];

/**
 * Reading controls: pinyin on/off, the HSK-level settings popover, and the
 * button that opens the saved-vocab drawer.
 */
export default function Controls({
  pinyinVisible,
  onTogglePinyin,
  hskFilter,
  onChangeHskFilter,
  vocabCount,
  onOpenVocab,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const onClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [settingsOpen]);

  return (
    <div className="flex items-center gap-2 border-t border-rule bg-surface px-3 py-2">
      <button
        type="button"
        onClick={onTogglePinyin}
        aria-pressed={pinyinVisible}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          pinyinVisible
            ? 'bg-jade-soft text-jade'
            : 'bg-surface-dim text-ink-soft hover:text-ink'
        }`}
      >
        <Type size={15} strokeWidth={2.25} />
        Pinyin
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-expanded={settingsOpen}
          aria-label="Pinyin visibility settings"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            settingsOpen ? 'bg-surface-dim text-ink' : 'text-ink-soft hover:text-ink'
          }`}
        >
          <Settings2 size={15} strokeWidth={2.25} />
          HSK {hskFilter === 'all' ? 'All' : `≤ ${hskFilter}`}
        </button>

        {settingsOpen && (
          <div
            ref={popoverRef}
            className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-xl border border-rule bg-surface p-3 shadow-lg"
          >
            <p className="mb-2 text-xs font-medium text-ink-soft">
              I already know HSK levels up to…
            </p>
            <div className="mb-2 grid grid-cols-3 gap-1.5">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onChangeHskFilter(level)}
                  className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${
                    hskFilter === level
                      ? 'bg-jade text-surface'
                      : 'bg-surface-dim text-ink hover:bg-jade-soft'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onChangeHskFilter('all')}
              className={`w-full rounded-lg py-1.5 text-sm font-medium transition-colors ${
                hskFilter === 'all'
                  ? 'bg-jade text-surface'
                  : 'bg-surface-dim text-ink hover:bg-jade-soft'
              }`}
            >
              Show pinyin for everything
            </button>
            <p className="mt-2 text-xs leading-snug text-ink-faint">
              Pinyin stays hidden on words at or below your level, and appears
              on anything harder.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenVocab}
        className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <BookMarked size={15} strokeWidth={2.25} />
        Vocab
        {vocabCount > 0 && (
          <span className="rounded-full bg-seal px-1.5 py-0.5 text-xs font-semibold text-surface">
            {vocabCount}
          </span>
        )}
      </button>
    </div>
  );
}
