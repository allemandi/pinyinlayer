import { useState } from 'react';
import { Eye, EyeOff, BookMarked, Settings, X } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';

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
  textSize = 'md',
  onChangeTextSize,
  vocabCount,
  onOpenVocab,
}) {
  const [showSettings, setShowSettings] = useState(false);

  useEscapeKey(() => setShowSettings(false), showSettings);

  return (
    <div className="border-t border-rule bg-surface px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onTogglePinyin}
          aria-pressed={pinyinVisible}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-full border border-rule px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-9 ${
            pinyinVisible
              ? 'bg-jade-soft text-jade shadow-sm shadow-jade/20'
              : 'bg-surface-dim text-ink-soft hover:bg-surface hover:text-ink'
          } active:scale-[0.97] cursor-pointer`}
        >
          {pinyinVisible ? <Eye size={15} strokeWidth={2.25} /> : <EyeOff size={15} strokeWidth={2.25} />}
          <span>{pinyinVisible ? 'Pinyin on' : 'Pinyin off'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-haspopup="dialog"
          aria-expanded={showSettings}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition duration-150 ease-out active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-9 ${
            showSettings
              ? 'bg-jade border-jade text-surface shadow-sm'
              : 'bg-surface-dim border-rule text-ink-soft hover:bg-surface hover:text-ink'
          }`}
        >
          <Settings size={15} className={showSettings ? 'animate-[spin_10s_linear_infinite]' : ''} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={onOpenVocab}
          className="ml-auto flex items-center gap-1.5 sm:gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-ink-soft transition duration-150 ease-out hover:bg-lavender-soft hover:text-ink active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-9"
        >
          <BookMarked size={15} strokeWidth={2.25} />
          <span>Vocab</span>
          {vocabCount > 0 && (
            <span className="rounded-full bg-seal px-1.5 py-0.5 text-[10px] sm:text-xs font-bold text-surface animate-[scaleIn_0.2s_ease-out]">
              {vocabCount}
            </span>
          )}
        </button>
      </div>

      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setShowSettings(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
        >
          <div
            className="w-full max-w-md rounded-3xl border border-rule bg-surface p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:p-7 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-rule pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-jade" />
                <h2 id="settings-modal-title" className="font-display text-base font-bold text-ink dark:text-slate-100">
                  Reader Settings
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings dialog"
                className="rounded-full border border-rule bg-surface p-1.5 text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-950"
              >
                <X size={16} strokeWidth={2.25} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Character Formatting Section */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                    Character Format
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    Adjust reader characters display format
                  </span>
                </div>

                <div className="flex bg-surface-dim rounded-xl p-1 border border-rule gap-1 self-start sm:self-auto dark:bg-slate-900">
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
                          : 'text-ink-soft hover:bg-jade-soft hover:text-ink dark:hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-rule/50 my-1" />

              {/* Text Size Section */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                    Text Size
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    Adjust reading font size in the reader
                  </span>
                </div>

                <div className="flex bg-surface-dim rounded-xl p-1 border border-rule gap-1 self-start sm:self-auto dark:bg-slate-900">
                  {[
                    { value: 'sm', label: 'Small' },
                    { value: 'md', label: 'Medium' },
                    { value: 'lg', label: 'Large' },
                    { value: 'xl', label: 'X-Large' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChangeTextSize && onChangeTextSize(opt.value)}
                      aria-pressed={textSize === opt.value}
                      className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                        textSize === opt.value
                          ? 'bg-jade text-surface shadow-sm'
                          : 'text-ink-soft hover:bg-jade-soft hover:text-ink dark:hover:text-slate-200'
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
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
                        Pinyin Display Mode
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        Choose which words get pinyin annotations
                      </span>
                    </div>

                    <div className="flex bg-surface-dim rounded-xl p-1 border border-rule gap-1 self-start sm:self-auto dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => onChangeHskFilter('all')}
                        aria-pressed={hskFilter === 'all'}
                        className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                          hskFilter === 'all'
                            ? 'bg-lavender text-surface shadow-sm'
                            : 'text-ink-soft hover:bg-lavender-soft hover:text-ink dark:hover:text-slate-200'
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
                            : 'text-ink-soft hover:bg-jade-soft hover:text-ink dark:hover:text-slate-200'
                        }`}
                      >
                        Only harder words
                      </button>
                    </div>
                  </div>

                  {hskFilter !== 'all' && (
                    <div className="mt-1 border-t border-rule/30 pt-3 dark:border-slate-800">
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
                                    : 'bg-surface text-ink hover:bg-jade-soft dark:bg-slate-900 dark:text-slate-200'
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
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
