import { Eye, EyeOff, BookMarked } from 'lucide-react';

const LEVELS = [1, 2, 3, 4, 5, 6];

/**
 * Reading controls: pinyin on/off, HSK filter (inline, clearly labeled),
 * and the saved-vocab drawer button.
 */
export default function Controls({
  pinyinVisible,
  onTogglePinyin,
  hskFilter,
  onChangeHskFilter,
  vocabCount,
  onOpenVocab,
}) {
  return (
    <div className="border-t border-rule bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onTogglePinyin}
          aria-pressed={pinyinVisible}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-base font-medium transition-colors ${
            pinyinVisible
              ? 'bg-jade-soft text-jade'
              : 'bg-surface-dim text-ink-soft hover:text-ink'
          }`}
        >
          {pinyinVisible ? <Eye size={18} strokeWidth={2.25} /> : <EyeOff size={18} strokeWidth={2.25} />}
          {pinyinVisible ? 'Pinyin on' : 'Pinyin off'}
        </button>

        <button
          type="button"
          onClick={onOpenVocab}
          className="ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-base font-medium text-ink-soft transition-colors hover:bg-lavender-soft hover:text-ink"
        >
          <BookMarked size={18} strokeWidth={2.25} />
          Vocab
          {vocabCount > 0 && (
            <span className="rounded-full bg-seal px-2 py-0.5 text-sm font-semibold text-surface">
              {vocabCount}
            </span>
          )}
        </button>
      </div>

      {pinyinVisible && (
        <div className="mt-2.5 rounded-xl border border-rule bg-surface-dim/60 p-3">
          <p className="mb-2 text-sm font-medium text-ink-soft">Which words should show pinyin?</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChangeHskFilter('all')}
              aria-pressed={hskFilter === 'all'}
              className={`rounded-lg px-4 py-2 text-base font-medium transition-colors ${
                hskFilter === 'all'
                  ? 'bg-lavender text-surface shadow-sm'
                  : 'bg-surface text-ink hover:bg-lavender-soft'
              }`}
            >
              Every word
            </button>

            <button
              type="button"
              onClick={() => onChangeHskFilter(hskFilter === 'all' ? 3 : hskFilter)}
              aria-pressed={hskFilter !== 'all'}
              className={`rounded-lg px-4 py-2 text-base font-medium transition-colors ${
                hskFilter !== 'all'
                  ? 'bg-jade text-surface shadow-sm'
                  : 'bg-surface text-ink hover:bg-jade-soft'
              }`}
            >
              Only harder words
            </button>
          </div>

          {hskFilter !== 'all' && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-ink-faint">
                Hide pinyin on words I already know up to HSK level:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChangeHskFilter(level)}
                    aria-pressed={hskFilter === level}
                    aria-label={`Hide pinyin for HSK ${level} and below`}
                    className={`min-w-[2.75rem] rounded-lg px-3 py-2 text-base font-semibold transition-colors ${
                      hskFilter === level
                        ? 'bg-jade text-surface shadow-sm'
                        : 'bg-surface text-ink hover:bg-jade-soft'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm leading-snug text-ink-faint">
                Pinyin appears on words above HSK {hskFilter}. Hover or press-and-hold any word to peek at its pinyin.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
