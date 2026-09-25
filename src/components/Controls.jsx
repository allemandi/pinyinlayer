import { useState } from 'react';
import { Eye, EyeOff, BookMarked, Settings, X, FolderInput, ShieldCheck } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { decodeDeckPayload } from '../utils/deckShare.js';

const LEVELS = [1, 2, 3, 4, 5, 6];

/**
 * Reading controls: pinyin on/off, character format, HSK filter,
 * security-sanitized deck import, and saved-vocab drawer launch.
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
  onImportDeck,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importFeedback, setImportFeedback] = useState('');
  const [importStatus, setImportStatus] = useState('idle');

  useEscapeKey(() => setShowSettings(false), showSettings);
  const settingsContainerRef = useFocusTrap(showSettings);

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setImportFeedback('');
    setImportStatus('idle');

    if (!importInput.trim()) {
      setImportStatus('error');
      setImportFeedback('Please paste a deck share link or code.');
      return;
    }

    const imported = decodeDeckPayload(importInput);
    if (!imported) {
      setImportStatus('error');
      setImportFeedback('Invalid, corrupted, or oversized deck link. Please check the URL.');
      return;
    }

    if (onImportDeck) {
      const created = onImportDeck(imported);
      if (created) {
        setImportStatus('success');
        setImportFeedback(`Imported deck "${created.name}" (${created.words.length} words)!`);
        setImportInput('');
      }
    }
  };

  return (
    <div className="border-t border-rule bg-surface px-2.5 py-2 sm:px-4 sm:py-2.5 select-none shrink-0 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onTogglePinyin}
          aria-pressed={pinyinVisible}
          className={`flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-xl border px-2 py-1.5 text-xs sm:text-sm font-bold transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-9 sm:h-10 cursor-pointer ${
            pinyinVisible
              ? 'bg-jade-soft border-jade/30 text-jade shadow-xs dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-surface-dim border-rule text-ink-soft hover:bg-surface hover:text-ink dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
          } active:scale-[0.97]`}
        >
          {pinyinVisible ? <Eye size={15} strokeWidth={2.25} /> : <EyeOff size={15} strokeWidth={2.25} />}
          <span>{pinyinVisible ? 'Pinyin On' : 'Pinyin Off'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-haspopup="dialog"
          aria-expanded={showSettings}
          className={`flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-xl border px-2 py-1.5 text-xs sm:text-sm font-bold transition duration-150 ease-out active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-9 sm:h-10 ${
            showSettings
              ? 'bg-jade border-jade text-white shadow-xs'
              : 'bg-surface-dim border-rule text-ink-soft hover:bg-surface hover:text-ink dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
          }`}
        >
          <Settings size={15} className={showSettings ? 'animate-[spin_10s_linear_infinite]' : ''} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={onOpenVocab}
          className="flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-rule bg-surface px-2 py-1.5 text-xs sm:text-sm font-bold text-ink-soft transition duration-150 ease-out hover:bg-lavender-soft hover:text-ink active:scale-[0.97] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade h-9 sm:h-10 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
        >
          <BookMarked size={15} strokeWidth={2.25} />
          <span>Vocab</span>
          {vocabCount > 0 && (
            <span className="rounded-full bg-seal px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              {vocabCount}
            </span>
          )}
        </button>
      </div>

      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setShowSettings(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
        >
          <div
            ref={settingsContainerRef}
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl border border-rule bg-surface p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:p-7 transition-all"
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
                className="inline-flex items-center gap-1 rounded-2xl border border-rule bg-surface px-3 py-1.5 text-xs font-bold text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-950"
              >
                <X size={16} strokeWidth={2.25} />
                <span>Close</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Character Formatting Section */}
              <div className="flex flex-col gap-2.5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400 block">
                    Character Format
                  </span>
                  <span className="text-[11px] text-ink-faint">
                    Adjust reader characters display format
                  </span>
                </div>

                <div className="flex bg-surface-dim rounded-2xl p-1 border border-rule gap-1 self-start sm:self-auto dark:bg-slate-900 dark:border-slate-800">
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
                      className={`flex-1 min-w-0 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                        charFormat === opt.value
                          ? 'bg-jade text-white shadow-xs'
                          : 'text-ink-soft hover:bg-jade-soft hover:text-ink dark:hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-rule/50 my-1 dark:border-slate-800" />

              {/* Text Size Section */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400 block">
                      Text Size
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      Adjust reading font size in the reader
                    </span>
                  </div>
                  <span className="text-xs font-bold text-jade dark:text-sky-400 uppercase tracking-wider">
                    {{ sm: 'Small', md: 'Medium', lg: 'Large', xl: 'X-Large' }[textSize] || 'Medium'}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 px-1 pt-1">
                  {(() => {
                    const SIZES = ['sm', 'md', 'lg', 'xl'];
                    const currentIndex = SIZES.indexOf(textSize) !== -1 ? SIZES.indexOf(textSize) : 1;

                    return (
                      <>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="1"
                          value={currentIndex}
                          onChange={(e) => {
                            const newSize = SIZES[Number(e.target.value)];
                            if (newSize && onChangeTextSize) {
                              onChangeTextSize(newSize);
                            }
                          }}
                          aria-label="Text size"
                          aria-valuetext={{ sm: 'Small', md: 'Medium', lg: 'Large', xl: 'X-Large' }[textSize]}
                          className="w-full accent-jade cursor-pointer h-2 bg-surface-dim rounded-lg appearance-none dark:bg-slate-900 border border-rule/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
                        />
                        <div className="flex justify-between text-[10px] font-semibold text-ink-faint px-0.5 select-none">
                          <span>Small</span>
                          <span>Medium</span>
                          <span>Large</span>
                          <span>X-Large</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {pinyinVisible && (
                <>
                  <div className="border-t border-rule/50 my-1 dark:border-slate-800" />
                  {/* Pinyin Settings */}
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400 block">
                        Pinyin Display Mode
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        Choose which words get pinyin annotations
                      </span>
                    </div>

                    <div className="flex bg-surface-dim rounded-2xl p-1 border border-rule gap-1 self-start sm:self-auto dark:bg-slate-900 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => onChangeHskFilter('all')}
                        aria-pressed={hskFilter === 'all'}
                        className={`flex-1 min-w-0 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                          hskFilter === 'all'
                            ? 'bg-lavender text-white shadow-xs'
                            : 'text-ink-soft hover:bg-lavender-soft hover:text-ink dark:hover:text-slate-200'
                        }`}
                      >
                        Every word
                      </button>

                      <button
                        type="button"
                        onClick={() => onChangeHskFilter(hskFilter === 'all' ? 3 : hskFilter)}
                        aria-pressed={hskFilter !== 'all'}
                        className={`flex-1 min-w-0 rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                          hskFilter !== 'all'
                            ? 'bg-jade text-white shadow-xs'
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
                          <p className="text-xs font-medium text-ink-soft dark:text-slate-300">
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
                                className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                                  hskFilter === level
                                    ? 'bg-jade text-white shadow-xs'
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

              {/* Security-Sanitized Import Deck Link Section */}
              <div className="border-t border-rule/50 my-1 dark:border-slate-800" />
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400 block">
                      Import Shared Deck
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      Paste a deck link or payload code from another instance
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-jade dark:text-emerald-400 shrink-0">
                    <ShieldCheck size={13} />
                    Sanitized
                  </span>
                </div>

                <form onSubmit={handleImportSubmit} className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    placeholder="Paste deck link or payload code..."
                    className="w-full h-11 rounded-2xl border border-rule bg-surface-dim px-3.5 text-xs font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="h-11 inline-flex items-center justify-center gap-2 rounded-2xl bg-jade px-4 text-xs font-bold text-white shadow-xs transition hover:bg-jade/90 cursor-pointer"
                  >
                    <FolderInput size={15} />
                    <span>Import Shared Deck</span>
                  </button>
                </form>

                {importFeedback && (
                  <p
                    className={`text-[11px] font-semibold ${
                      importStatus === 'error' ? 'text-seal dark:text-rose-400' : 'text-jade dark:text-emerald-400'
                    }`}
                  >
                    {importFeedback}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
