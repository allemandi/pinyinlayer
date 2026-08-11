import { useState } from 'react';
import { Eye, EyeOff, BookMarked, Settings } from 'lucide-react';

const LEVELS = [1, 2, 3, 4, 5, 6];

/**
 * Reading controls: pinyin on/off, character format (simplified, traditional, original),
 * HSK filter (inline, clearly labeled), and the saved-vocab drawer button.
 */
export default function Controls({
  pinyinVisible,
  onTogglePinyin,
  hskFilter,
  onChangeHskFilter,
  charFormat,
  onChangeCharFormat,
  vocabCount,
  onOpenVocab,
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="border-t border-rule bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onTogglePinyin}
          aria-pressed={pinyinVisible}
          className={`flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-base font-medium transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
            pinyinVisible
              ? 'bg-jade-soft text-jade shadow-sm shadow-jade/20'
              : 'bg-surface-dim text-ink-soft hover:bg-surface hover:text-ink'
          } active:scale-[0.98] cursor-pointer`}
        >
          {pinyinVisible ? <Eye size={18} strokeWidth={2.25} /> : <EyeOff size={18} strokeWidth={2.25} />}
          {pinyinVisible ? 'Pinyin on' : 'Pinyin off'}
        </button>

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          aria-pressed={showSettings}
          aria-label="Toggle Reader Settings"
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition duration-150 ease-out active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
            showSettings
              ? 'bg-jade border-jade text-surface shadow-sm'
              : 'bg-surface-dim border-rule text-ink-soft hover:bg-surface hover:text-ink'
          }`}
        >
          <Settings size={18} className={showSettings ? 'animate-[spin_10s_linear_infinite]' : ''} />
        </button>

        <button
          type="button"
          onClick={onOpenVocab}
          className="ml-auto flex items-center gap-2 rounded-full border border-rule bg-surface px-4 py-2 text-base font-medium text-ink-soft transition duration-150 ease-out hover:bg-lavender-soft hover:text-ink active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
        >
          <BookMarked size={18} strokeWidth={2.25} />
          Vocab
          {vocabCount > 0 && (
            <span className="rounded-full bg-seal px-2 py-0.5 text-sm font-semibold text-surface animate-[scaleIn_0.2s_ease-out]">
              {vocabCount}
            </span>
          )}
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,margin-top] duration-300 ease-out ${
          showSettings ? 'grid-rows-[1fr] mt-2.5' : 'grid-rows-[0fr] mt-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-rule bg-surface-dim p-3 sm:p-4">
            <div className="flex flex-col gap-4">
              {/* Character Formatting Section */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                    Character Format
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    Adjust reader characters display format
                  </span>
                </div>

                <div className="flex bg-surface rounded-xl p-1 border border-rule gap-1 self-start sm:self-auto">
                  {[
                    { value: 'simplified', label: 'Simplified' },
                    { value: 'traditional', label: 'Traditional' },
                    { value: 'original', label: 'Original' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChangeCharFormat(opt.value)}
                      aria-pressed={charFormat === opt.value}
                      className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                        charFormat === opt.value
                          ? 'bg-jade text-surface shadow-sm'
                          : 'text-ink-soft hover:bg-jade-soft hover:text-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {pinyinVisible && (
                <>
                  <div className="border-t border-rule/50 my-1" />
                  {/* Pinyin Settings */}
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                        Pinyin Display Mode
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        Choose which words get pinyin annotations
                      </span>
                    </div>

                    <div className="flex bg-surface rounded-xl p-1 border border-rule gap-1 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => onChangeHskFilter('all')}
                        aria-pressed={hskFilter === 'all'}
                        className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                          hskFilter === 'all'
                            ? 'bg-lavender text-surface shadow-sm'
                            : 'text-ink-soft hover:bg-lavender-soft hover:text-ink'
                        }`}
                      >
                        Every word
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeHskFilter(hskFilter === 'all' ? 3 : hskFilter)}
                        aria-pressed={hskFilter !== 'all'}
                        className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                          hskFilter !== 'all'
                            ? 'bg-jade text-surface shadow-sm'
                            : 'text-ink-soft hover:bg-jade-soft hover:text-ink'
                        }`}
                      >
                        Only harder words
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid transition-[grid-template-rows,margin-top] duration-300 ease-out ${
                      hskFilter !== 'all' ? 'grid-rows-[1fr] mt-1 border-t border-rule/30 pt-3' : 'grid-rows-[0fr] mt-0'
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
                                className={`h-7 w-7 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
