import { useState } from 'react';
import { Eye, EyeOff, BookMarked, Settings } from 'lucide-react';

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
  const [showSettings, setShowSettings] = useState(false);

  // Auto-collapse settings when Pinyin is turned off
  const handleTogglePinyin = () => {
    onTogglePinyin();
    if (pinyinVisible) {
      setShowSettings(false);
    }
  };

  return (
    <div className="border-t border-rule bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleTogglePinyin}
          aria-pressed={pinyinVisible}
          className={`flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-base font-medium transition duration-150 ease-out ${
            pinyinVisible
              ? 'bg-jade-soft text-jade shadow-sm shadow-jade/20'
              : 'bg-surface-dim text-ink-soft hover:bg-surface hover:text-ink'
          } active:scale-[0.98] cursor-pointer`}
        >
          {pinyinVisible ? <Eye size={18} strokeWidth={2.25} /> : <EyeOff size={18} strokeWidth={2.25} />}
          {pinyinVisible ? 'Pinyin on' : 'Pinyin off'}
        </button>

        {pinyinVisible && (
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            aria-pressed={showSettings}
            aria-label="Toggle Pinyin Settings"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-150 ease-out active:scale-[0.98] cursor-pointer ${
              showSettings
                ? 'bg-jade border-jade text-surface shadow-sm'
                : 'bg-surface-dim border-rule text-ink-soft hover:bg-surface hover:text-ink'
            }`}
          >
            <Settings size={18} className={showSettings ? 'animate-[spin_10s_linear_infinite]' : ''} />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenVocab}
          className="ml-auto flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-base font-medium text-ink-soft transition duration-150 ease-out hover:bg-lavender-soft hover:text-ink active:scale-[0.98] cursor-pointer"
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

      <div
        className={`grid transition-[grid-template-rows,margin-top] duration-300 ease-out ${
          pinyinVisible && showSettings ? 'grid-rows-[1fr] mt-2.5' : 'grid-rows-[0fr] mt-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-rule bg-surface-dim p-2.5 sm:p-3">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Pinyin Display Mode
              </span>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeHskFilter('all')}
                  aria-pressed={hskFilter === 'all'}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
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
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                    hskFilter !== 'all'
                      ? 'bg-jade text-surface shadow-sm'
                      : 'bg-surface text-ink hover:bg-jade-soft'
                  }`}
                >
                  Only harder words
                </button>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows,margin-top] duration-300 ease-out ${
                hskFilter !== 'all' ? 'grid-rows-[1fr] mt-2.5 border-t border-rule/50 pt-2.5' : 'grid-rows-[0fr] mt-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 xs:flex-row xs:items-center xs:justify-between">
                    <p className="text-xs font-medium text-ink-soft">
                      Hide pinyin for HSK ≤
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => onChangeHskFilter(level)}
                          aria-pressed={hskFilter === level}
                          aria-label={`Hide pinyin for HSK ${level} and below`}
                          className={`h-7 w-7 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            hskFilter === level
                              ? 'bg-jade text-surface shadow-sm'
                              : 'bg-surface text-ink hover:bg-jade-soft'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-ink-faint">
                    Pinyin visible only on HSK {hskFilter + 1}+ and non-HSK words. Hover or hold to peek at hidden pinyin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
