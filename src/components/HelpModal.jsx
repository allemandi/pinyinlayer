import { X, Shield, Globe, HelpCircle, Layers } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

/**
 * HelpModal displays clear user information about PinyinLayer features,
 * offline vs online capabilities, vocabulary deck management, and privacy.
 */
export default function HelpModal({ isOpen, onClose }) {
  useEscapeKey(onClose, isOpen);
  const helpContainerRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        ref={helpContainerRef}
        className="w-full max-w-xl sm:max-w-2xl max-h-[88dvh] overflow-y-auto rounded-3xl border border-rule bg-surface p-5 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-950 transition-all overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-rule pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-jade-soft text-jade dark:bg-emerald-950 dark:text-emerald-300">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 id="help-modal-title" className="font-display text-base font-bold text-ink dark:text-slate-100">
                PinyinLayer Help & Information
              </h2>
              <p className="text-[11px] font-medium text-ink-soft">Reading assistance & offline privacy guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help dialog"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl border border-rule bg-surface text-xs font-bold text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-950"
          >
            <X size={16} strokeWidth={2.25} />
            <span>Close</span>
          </button>
        </div>

        {/* Feature Sections */}
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          {/* Overview */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <p className="text-xs sm:text-sm leading-snug">
              PinyinLayer is an interactive Chinese reading assistant featuring layered pinyin annotations, HSK level filtering, offline dictionary definitions, audio speech synthesis, and vocabulary deck flashcards.
            </p>
          </div>

          {/* 100% Offline Core Features */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <Globe size={18} className="mt-0.5 shrink-0 text-jade" />
              <div className="space-y-1.5">
                <h3 className="font-bold text-ink dark:text-slate-100 text-xs sm:text-sm">
                  100% Offline Core Functionality
                </h3>
                <p className="text-xs leading-normal">
                  The following features run <strong>100% offline</strong> inside your browser with zero network calls:
                </p>
                <ul className="list-disc list-inside text-xs space-y-0.5 font-medium text-ink-soft dark:text-slate-300">
                  <li>Chinese text segmentation and Pinyin annotations</li>
                  <li>CC-CEDICT offline dictionary lookups</li>
                  <li>HSK difficulty filtering (Levels 1–6)</li>
                  <li>Text-to-Speech audio speech synthesis (`window.speechSynthesis`)</li>
                  <li>PDF and DOCX document text extraction</li>
                  <li>Saved vocabulary decks and flashcard practice sessions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Online Sentence Translation */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <Shield size={18} className="mt-0.5 shrink-0 text-seal dark:text-rose-400" />
              <div className="space-y-1.5">
                <h3 className="font-bold text-ink dark:text-slate-100 text-xs sm:text-sm">
                  Online Sentence Translation (On Demand)
                </h3>
                <p className="text-xs leading-normal">
                  Clicking the explicit <span className="font-semibold text-jade">Translate full sentence (online)</span> button inside a definition popover makes an on-demand external request to the public MyMemory Translation API. No other action in the app ever connects to external servers.
                </p>
              </div>
            </div>
          </div>

          {/* Vocabulary Decks & Actions */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <Layers size={18} className="mt-0.5 shrink-0 text-jade" />
              <div className="space-y-2">
                <h3 className="font-bold text-ink dark:text-slate-100 text-xs sm:text-sm">
                  Vocabulary Decks & Deck Sharing
                </h3>
                <p className="text-xs leading-normal">
                  <strong className="text-ink dark:text-slate-200">Default Deck:</strong> Saved words land automatically in your designated Default Deck. You can change your Default Deck at any time in the Vocab drawer.
                </p>
                <p className="text-xs leading-normal">
                  <strong className="text-ink dark:text-slate-200">Sharing Decks:</strong> Clicking <span className="font-semibold text-jade">Share</span> creates a compact link (<code className="text-[11px] bg-surface px-1 py-0.5 rounded border border-rule/40 dark:border-slate-800">?deck=...</code>). Opening a share link safely sanitizes the deck payload locally before saving.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-2xl bg-jade px-4 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-jade/90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
