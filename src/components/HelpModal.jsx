import { X, Shield, Globe, HelpCircle, Layers } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

/**
 * HelpModal displays clear user information about PinyinLayer features,
 * vocabulary deck management, share link security, and privacy standards.
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
                PinyinLayer Help & Info
              </h2>
              <p className="text-[11px] font-medium text-ink-soft">Reading assistance & deck guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help dialog"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-surface text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-950"
          >
            <X size={16} strokeWidth={2.25} />
          </button>
        </div>

        {/* Feature Sections */}
        <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          {/* Overview */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <p className="text-xs sm:text-sm leading-snug">
              Minimalist Chinese reading assistant featuring toggleable pinyin, HSK level filtering, tap-to-define popovers, and customizable vocabulary decks.
            </p>
          </div>

          {/* Vocabulary Decks & Sharing */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <Layers size={18} className="mt-0.5 shrink-0 text-jade" />
              <div className="space-y-2">
                <h3 className="font-bold text-ink dark:text-slate-100 text-xs sm:text-sm">
                  Vocabulary Decks & Actions
                </h3>
                <p className="text-xs leading-normal">
                  <strong className="text-ink dark:text-slate-200">Default Deck:</strong> Saved words land in your Default Deck. You can change your Default Deck at any time.
                </p>
                <p className="text-xs leading-normal">
                  <strong className="text-ink dark:text-slate-200">Copy Text:</strong> Copies selected Chinese words, pinyin, and definitions as plain text to your device clipboard.
                </p>
                <p className="text-xs leading-normal">
                  <strong className="text-ink dark:text-slate-200">Copy to Deck / Move to Deck:</strong> Transfers selected vocabulary between different decks.
                </p>
                <p className="text-xs leading-normal">
                  <strong className="text-ink dark:text-slate-200">Sharing Decks:</strong> Click <span className="font-semibold text-jade">Share</span> to copy a shareable link (<code className="text-[11px] bg-surface px-1 py-0.5 rounded border border-rule/40 dark:border-slate-800">?deck=...</code>). Opening or pasting a link safely sanitizes the deck locally before importing.
                </p>
              </div>
            </div>
          </div>

          {/* Offline Lookups & Storage */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <Globe size={18} className="mt-0.5 shrink-0 text-jade" />
              <div className="space-y-1">
                <h3 className="font-bold text-ink dark:text-slate-100 text-xs sm:text-sm">
                  Offline Lookups & Private Storage
                </h3>
                <p className="text-xs leading-normal">
                  Dictionary lookups and HSK annotations run completely offline inside your browser. All vocabulary decks and user settings stay entirely private in your browser's LocalStorage.
                </p>
              </div>
            </div>
          </div>

          {/* Sentence Translation & Network Requests */}
          <div className="rounded-2xl border border-rule/50 bg-surface-dim/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex gap-3">
              <Shield size={18} className="mt-0.5 shrink-0 text-seal dark:text-rose-400" />
              <div className="space-y-1">
                <h3 className="font-bold text-ink dark:text-slate-100 text-xs sm:text-sm">
                  Sentence Translation & External Requests
                </h3>
                <p className="text-xs leading-normal">
                  Clicking <span className="font-semibold text-jade">Translate full sentence (online)</span> in a definition popover makes an external network connection to send the sentence text to the public MyMemory Translation API. All other operations—dictionary lookups, Pinyin annotations, HSK filtering, and saved vocabulary decks—run 100% offline inside your browser.
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
