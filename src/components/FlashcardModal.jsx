import { useState, useEffect, useCallback } from 'react';
import { X, Eye, CheckCircle2, XCircle, RotateCcw, Check } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

/**
 * Full-screen Flashcard Review Modal.
 * Displays huge Chinese characters, with option to reveal pinyin + definition,
 * and mark each card as Pass or Fail.
 */
export default function FlashcardModal({ isOpen, onClose, deck = [], onTagStatus }) {
  useEscapeKey(onClose, isOpen);
  const modalRef = useFocusTrap(isOpen);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionResults, setSessionResults] = useState({}); // { [word]: 'passed' | 'failed' }
  const [isFinished, setIsFinished] = useState(false);

  // Reset state when deck changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setShowAnswer(false);
      setSessionResults({});
      setIsFinished(false);
    }
  }, [isOpen, deck]);

  const currentCard = deck[currentIndex];

  const handleNextCard = useCallback(
    (status) => {
      if (!currentCard) return;

      onTagStatus(currentCard.word, status);
      setSessionResults((prev) => ({ ...prev, [currentCard.word]: status }));

      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((prev) => prev + 1);
        setShowAnswer(false);
      } else {
        setIsFinished(true);
      }
    },
    [currentCard, currentIndex, deck.length, onTagStatus]
  );

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionResults({});
    setIsFinished(false);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen || isFinished || !currentCard) return;

    const handleKeyDown = (e) => {
      // Don't interfere if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setShowAnswer((prev) => !prev);
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNextCard('failed');
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard('passed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFinished, currentCard, handleNextCard]);

  if (!isOpen) return null;

  const passedCount = Object.values(sessionResults).filter((s) => s === 'passed').length;
  const failedCount = Object.values(sessionResults).filter((s) => s === 'failed').length;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-paper p-4 dark:bg-slate-950 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Flashcard study session"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-rule pb-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-semibold text-ink-soft dark:text-slate-400">
            Flashcards
          </span>
          {!isFinished && deck.length > 0 && (
            <span className="rounded-full bg-surface-dim px-2.5 py-0.5 text-xs font-medium text-ink-soft dark:bg-slate-800 dark:text-slate-300">
              {currentIndex + 1} / {deck.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close flashcards"
          className="rounded-full p-2 text-ink-soft transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      {isFinished ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-jade-soft text-jade mb-4">
            <Check size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink dark:text-slate-100">
            Session Completed!
          </h2>
          <p className="mt-2 text-sm text-ink-soft dark:text-slate-400">
            You reviewed {deck.length} card{deck.length === 1 ? '' : 's'}.
          </p>

          <div className="mt-6 flex items-center gap-6 rounded-2xl border border-rule bg-surface px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center">
              <span className="text-2xl font-bold text-jade">{passedCount}</span>
              <p className="text-xs font-medium text-ink-soft dark:text-slate-400">Passed</p>
            </div>
            <div className="h-8 w-px bg-rule dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-2xl font-bold text-seal">{failedCount}</span>
              <p className="text-xs font-medium text-ink-soft dark:text-slate-400">Needs Review</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-xl border border-rule bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-dim cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw size={16} />
              Restart Deck
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-jade px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-opacity-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade"
            >
              Done
            </button>
          </div>
        </div>
      ) : currentCard ? (
        <div className="flex flex-1 flex-col items-center justify-between py-6">
          {/* Top Progress Bar */}
          <div className="w-full max-w-xl bg-surface-dim h-1.5 rounded-full overflow-hidden dark:bg-slate-800">
            <div
              className="bg-jade h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>

          {/* Character Display Area */}
          <div className="my-auto flex flex-col items-center justify-center text-center px-4 w-full max-w-3xl">
            <p className="font-reading text-7xl sm:text-8xl md:text-9xl font-normal leading-none tracking-tight text-ink dark:text-slate-50 select-none">
              {currentCard.word}
            </p>

            {/* Answer Section */}
            {showAnswer ? (
              <div className="mt-8 sm:mt-10 flex flex-col items-center gap-2 animate-fadeIn">
                <p className="text-xl sm:text-2xl font-medium text-jade dark:text-sky-400">
                  {currentCard.pinyin}
                </p>
                {currentCard.definitions?.length > 0 && (
                  <p className="max-w-md text-base sm:text-lg leading-relaxed text-ink-soft dark:text-slate-300">
                    {currentCard.definitions.join('; ')}
                  </p>
                )}
                {currentCard.sentence && (
                  <p className="mt-3 max-w-lg text-sm text-ink-faint italic dark:text-slate-400">
                    "{currentCard.sentence}"
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="mt-8 sm:mt-10 inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-5 py-2.5 text-sm font-semibold text-ink-soft shadow-sm transition hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Eye size={16} />
                <span>Show Definition & Pinyin</span>
                <kbd className="hidden sm:inline-block rounded bg-surface-dim px-1.5 py-0.5 text-[10px] font-sans text-ink-faint dark:bg-slate-800 dark:text-slate-400">
                  Space
                </kbd>
              </button>
            )}
          </div>

          {/* Action Buttons: Fail vs Pass */}
          <div className="w-full max-w-md flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => handleNextCard('failed')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-seal/30 bg-seal-soft/40 px-6 py-3.5 text-base font-semibold text-seal transition hover:bg-seal hover:text-white cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-700 dark:hover:text-white"
            >
              <XCircle size={20} />
              <span>Needs Review</span>
              <kbd className="hidden sm:inline-block rounded bg-seal/10 px-1.5 py-0.5 text-[10px] font-sans text-seal dark:bg-rose-900/40 dark:text-rose-300">
                1 / ←
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => handleNextCard('passed')}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-jade/30 bg-jade-soft/40 px-6 py-3.5 text-base font-semibold text-jade transition hover:bg-jade hover:text-white cursor-pointer active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-700 dark:hover:text-white"
            >
              <CheckCircle2 size={20} />
              <span>Pass</span>
              <kbd className="hidden sm:inline-block rounded bg-jade/10 px-1.5 py-0.5 text-[10px] font-sans text-jade dark:bg-emerald-900/40 dark:text-emerald-300">
                2 / →
              </kbd>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-ink-faint">
          No cards in deck.
        </div>
      )}
    </div>
  );
}
