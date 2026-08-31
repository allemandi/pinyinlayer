import { useState, useId } from 'react';
import { X, Trash2, Stamp, Settings, Play, Check, XCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

/**
 * Settings Modal for Vocab Deck & Status Management.
 */
function VocabSettingsModal({
  isOpen,
  onClose,
  cardOrder,
  onChangeCardOrder,
  onClearStatuses,
}) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  useEscapeKey(onClose, isOpen);
  const settingsRef = useFocusTrap(isOpen);
  const orderSelectId = useId();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20">
      <div
        ref={settingsRef}
        className="w-full max-w-sm rounded-2xl border border-rule bg-surface p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Vocab Settings"
      >
        <div className="flex items-center justify-between border-b border-rule pb-3 dark:border-slate-800">
          <h3 className="font-display text-base font-semibold text-ink dark:text-slate-100 flex items-center gap-2">
            <Settings size={18} className="text-jade" />
            Vocab Deck Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full p-1 text-ink-soft hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor={orderSelectId}
              className="block text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-slate-400 mb-1.5"
            >
              Flashcard Order
            </label>
            <select
              id={orderSelectId}
              value={cardOrder}
              onChange={(e) => onChangeCardOrder(e.target.value)}
              className="w-full rounded-xl border border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-jade focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="sequential">Original Order (Newest First)</option>
              <option value="shuffled">Shuffled (Random)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-rule dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-slate-400 mb-1.5">
              Pass / Fail Statuses
            </label>

            {showConfirmClear ? (
              <div className="rounded-xl border border-seal/30 bg-seal-soft/30 p-3 text-xs dark:bg-rose-950/30">
                <p className="font-medium text-seal dark:text-rose-300">
                  Reset all Pass / Fail tags for saved words?
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearStatuses();
                      setShowConfirmClear(false);
                    }}
                    className="rounded-lg bg-seal px-3 py-1 text-xs font-semibold text-white shadow hover:bg-seal/90 cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="rounded-lg border border-rule bg-surface px-3 py-1 text-xs font-medium text-ink-soft hover:bg-surface-dim cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rule bg-surface px-3 py-2 text-xs font-medium text-seal hover:bg-seal-soft/50 cursor-pointer transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
              >
                <RotateCcw size={14} />
                Clear Pass / Fail Tags
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-jade px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-jade/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide-out drawer listing saved vocab with selection tools, Pass/Fail indicators,
 * and Flashcard launch button.
 */
export default function VocabDrawer({
  isOpen,
  onClose,
  vocab = [],
  onRemove,
  onStartStudy,
  onClearStatuses,
}) {
  useEscapeKey(onClose, isOpen);
  const drawerRef = useFocusTrap(isOpen);

  const [selectedWords, setSelectedWords] = useState(() => new Set(vocab.map((v) => v.word)));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState('sequential'); // 'sequential' | 'shuffled'

  const handleSelectAll = () => {
    setSelectedWords(new Set(vocab.map((v) => v.word)));
  };

  const handleSelectFailed = () => {
    const failedSet = new Set(
      vocab.filter((v) => v.status === 'failed').map((v) => v.word)
    );
    setSelectedWords(failedSet);
  };

  const handleClearSelection = () => {
    setSelectedWords(new Set());
  };

  const handleToggleSelectWord = (word) => {
    setSelectedWords((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  };

  const handleLaunchStudy = () => {
    let deck = vocab.filter((v) => selectedWords.has(v.word));

    if (cardOrder === 'shuffled') {
      deck = [...deck].sort(() => Math.random() - 0.5);
    }

    if (deck.length > 0) {
      onStartStudy(deck);
    }
  };

  const failedCount = vocab.filter((v) => v.status === 'failed').length;
  const passedCount = vocab.filter((v) => v.status === 'passed').length;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/20 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-rule bg-surface shadow-2xl transition-transform sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-96 sm:rounded-t-none sm:border-l sm:border-t-0 ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-rule px-4 py-3.5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink dark:text-slate-100">
            <Stamp size={19} className="text-seal" />
            Saved vocab
            <span className="text-base font-normal text-ink-faint">
              {vocab.length}
            </span>
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Vocab Deck Settings"
              aria-label="Vocab Deck Settings"
              className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close vocab list"
              className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Selection Quick Bar */}
        {vocab.length > 0 && (
          <div className="flex items-center justify-between border-b border-rule bg-paper px-4 py-2 text-xs dark:bg-slate-950">
            <div className="flex items-center gap-2 text-ink-faint">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:text-jade font-medium cursor-pointer"
              >
                Select All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleSelectFailed}
                disabled={failedCount === 0}
                className={`font-medium cursor-pointer ${
                  failedCount > 0 ? 'hover:text-seal text-seal/90' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                Select Failed ({failedCount})
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="hover:text-ink cursor-pointer"
              >
                Clear
              </button>
            </div>
            <span className="text-ink-faint font-medium">
              {selectedWords.size > 0 ? selectedWords.size : vocab.length} selected
            </span>
          </div>
        )}

        {/* Vocab List Area */}
        <div className="flex-1 overflow-y-auto">
          {vocab.length === 0 ? (
            <p className="p-6 text-center text-base leading-relaxed text-ink-faint">
              Tap any word in the reader and stamp it to save it here.
            </p>
          ) : (
            <ul className="divide-y divide-rule dark:divide-slate-800">
              {vocab.map((entry) => {
                const isChecked = selectedWords.has(entry.word);
                return (
                  <li key={entry.word} className="flex items-start gap-3 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelectWord(entry.word)}
                      aria-label={`Select ${entry.word} for flashcard study`}
                      className="mt-1.5 h-4 w-4 rounded border-rule text-jade focus:ring-jade cursor-pointer"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-reading text-xl leading-tight text-ink dark:text-slate-100">
                          {entry.word}
                        </p>
                        {/* Status Badge */}
                        {entry.status === 'passed' && (
                          <span
                            title="Passed"
                            className="inline-flex items-center gap-1 rounded-full bg-jade-soft/80 px-2 py-0.5 text-[11px] font-semibold text-jade dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            <CheckCircle2 size={12} />
                            Passed
                          </span>
                        )}
                        {entry.status === 'failed' && (
                          <span
                            title="Needs Review"
                            className="inline-flex items-center gap-1 rounded-full bg-seal-soft/80 px-2 py-0.5 text-[11px] font-semibold text-seal dark:bg-rose-950 dark:text-rose-300"
                          >
                            <XCircle size={12} />
                            Needs Review
                          </span>
                        )}
                      </div>

                      <p className="text-base font-medium text-jade dark:text-sky-400">
                        {entry.pinyin}
                      </p>
                      {entry.definitions?.length > 0 && (
                        <p className="mt-1.5 text-base leading-snug text-ink-soft dark:text-slate-300">
                          {entry.definitions[0]}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(entry.word)}
                      aria-label={`Remove ${entry.word} from vocab list`}
                      className="shrink-0 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-seal-soft hover:text-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-rose-950 dark:hover:text-rose-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Drawer Action Footer */}
        {vocab.length > 0 && (
          <div className="border-t border-rule bg-surface p-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleLaunchStudy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-jade px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-jade/90 active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
            >
              <Play size={16} fill="currentColor" />
              <span>
                Study Flashcards ({selectedWords.size > 0 ? selectedWords.size : vocab.length})
              </span>
            </button>
          </div>
        )}
      </aside>

      <VocabSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        cardOrder={cardOrder}
        onChangeCardOrder={setCardOrder}
        onClearStatuses={onClearStatuses}
      />
    </>
  );
}
