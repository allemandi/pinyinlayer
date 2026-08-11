import { useEffect } from 'react';
import { X, Shield, Globe, HelpCircle } from 'lucide-react';

/**
 * HelpModal component displays accessible, user-friendly information about PinyinLayer.
 * It outlines:
 * - App features (pinyin, HSK filtering, lookup, vocab drawer)
 * - Offline capabilities & online API calls (MyMemory translation API)
 * - Data Privacy (local storage, no tracking)
 * - Copyright: © 2026 allemandi
 */
export default function HelpModal({ isOpen, onClose }) {
  // Listen for the Escape key to close the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-3xl border border-rule bg-surface p-6 shadow-2xl ring-1 ring-white/10 dark:border-slate-800 dark:bg-slate-950 sm:top-[15%] sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-rule pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={22} className="text-jade" />
            <h2 id="help-modal-title" className="font-display text-lg font-bold text-ink">
              About PinyinLayer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help dialog"
            className="rounded-full border border-rule bg-surface p-1.5 text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-950"
          >
            <X size={18} strokeWidth={2.25} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <div>
            <h3 className="font-semibold text-ink dark:text-slate-100">Overview</h3>
            <p className="mt-1">
              PinyinLayer is a <strong>minimal Chinese reading assistance tool</strong> designed to streamline reading and comprehension. It provides dynamic pinyin display, customized HSK level filtering, tap-to-define lookup, and an integrated saved vocabulary drawer.
            </p>
          </div>

          <div className="rounded-2xl border border-rule/50 bg-surface-dim/40 p-4 dark:border-slate-800/50 dark:bg-slate-900/40">
            <div className="flex items-start gap-2.5">
              <Globe size={18} className="mt-0.5 shrink-0 text-jade" />
              <div>
                <h3 className="font-semibold text-ink dark:text-slate-100">Offline Lookup & API Calls</h3>
                <p className="mt-1 text-xs sm:text-sm">
                  Your dictionary lookups and HSK word list checks are done <strong>entirely offline (locally)</strong> inside your browser, meaning they require zero internet connection.
                </p>
                <p className="mt-2 text-xs sm:text-sm">
                  However, clicking <em>"Translate full sentence"</em> in the popover sends a query to the free, public third-party <strong>MyMemory Translation API</strong> (<code>https://api.mymemory.translated.net</code>) to translate sentences on-demand.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-rule/50 bg-surface-dim/40 p-4 dark:border-slate-800/50 dark:bg-slate-900/40">
            <div className="flex items-start gap-2.5">
              <Shield size={18} className="mt-0.5 shrink-0 text-seal" />
              <div>
                <h3 className="font-semibold text-ink dark:text-slate-100">Data Privacy</h3>
                <p className="mt-1 text-xs sm:text-sm">
                  Privacy is built-in. Your entered texts, reading history, and saved vocabulary items are stored <strong>strictly on your device</strong> in your browser's <code>LocalStorage</code>. PinyinLayer runs no analytics, trackers, or telemetries, and never stores or logs your texts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-rule pt-4 text-center text-xs text-ink-faint dark:border-slate-800">
          <p>© 2026 allemandi. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
