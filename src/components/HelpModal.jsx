import { useEffect } from 'react';
import { X, Shield, Globe, HelpCircle } from 'lucide-react';

/**
 * HelpModal displays concise, direct information about PinyinLayer.
 */
export default function HelpModal({ isOpen, onClose }) {
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
      {/* Centered Modal Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      >
        {/* Modal Card */}
        <div
          className="w-full max-w-md rounded-3xl border border-rule bg-surface p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:p-7"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-rule pb-3.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HelpCircle size={20} className="text-jade" />
              <h2 id="help-modal-title" className="font-display text-base font-bold text-ink dark:text-slate-100">
                PinyinLayer Guide
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close help dialog"
              className="rounded-full border border-rule bg-surface p-1.5 text-ink-faint transition hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:border-slate-800 dark:bg-slate-950"
            >
              <X size={16} strokeWidth={2.25} />
            </button>
          </div>

          {/* Concise Content */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-ink-soft dark:text-slate-300">
            <div className="rounded-2xl border border-rule/40 bg-surface-dim/40 p-3.5 dark:border-slate-800/40 dark:bg-slate-900/40">
              <p>
                <strong>PinyinLayer</strong> is a minimalist Chinese reading assistant featuring dynamic pinyin, HSK filtering, tap-to-define lookup, and a saved vocab drawer.
              </p>
            </div>

            <div className="rounded-2xl border border-rule/40 bg-surface-dim/40 p-3.5 dark:border-slate-800/40 dark:bg-slate-900/40">
              <div className="flex gap-2.5">
                <Globe size={18} className="mt-0.5 shrink-0 text-jade" />
                <div>
                  <h3 className="font-semibold text-ink dark:text-slate-100">Offline Lookup & Optional Online Translation</h3>
                  <p className="mt-1 text-xs">
                    Dictionary lookups and HSK word list checks run entirely offline inside your browser — no internet needed.
                  </p>
                  <p className="mt-1.5 text-xs">
                    However, the “Translate full sentence” option in the popover sends your sentence to the public MyMemory Translation API to fetch a translation on demand.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-rule/40 bg-surface-dim/40 p-3.5 dark:border-slate-800/40 dark:bg-slate-900/40">
              <div className="flex gap-2.5">
                <Shield size={18} className="mt-0.5 shrink-0 text-seal" />
                <div>
                  <h3 className="font-semibold text-ink dark:text-slate-100">Data Privacy</h3>
                  <p className="mt-1 text-xs">
                    All texts, reading history, and saved vocabulary are stored strictly inside your browser's <code>LocalStorage</code>. No analytics, tracking, or user logging is integrated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
