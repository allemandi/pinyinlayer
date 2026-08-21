import { X, Trash2, Stamp } from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';

/**
 * Slide-out drawer (right on desktop, bottom sheet on mobile) listing the
 * user's saved words and phrases for later review.
 */
export default function VocabDrawer({ isOpen, onClose, vocab, onRemove }) {
  // Listen for Escape key to close the vocab drawer
  useEscapeKey(onClose, isOpen);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/20 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-2xl border-t border-rule bg-surface shadow-2xl transition-transform sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-96 sm:rounded-t-none sm:border-l sm:border-t-0 ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen ? '' : undefined}
      >
        <div className="flex items-center justify-between border-b border-rule px-4 py-3.5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Stamp size={19} className="text-seal" />
            Saved vocab
            <span className="text-base font-normal text-ink-faint">
              {vocab.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vocab list"
            className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {vocab.length === 0 ? (
            <p className="p-6 text-center text-base leading-relaxed text-ink-faint">
              Tap any word in the reader and stamp it to save it here.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {vocab.map((entry) => (
                <li key={entry.word} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-reading text-xl leading-tight">{entry.word}</p>
                    <p className="text-base font-medium text-jade">{entry.pinyin}</p>
                    {entry.definitions?.length > 0 && (
                      <p className="mt-1.5 text-base leading-snug text-ink-soft">
                        {entry.definitions[0]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(entry.word)}
                    aria-label={`Remove ${entry.word} from vocab list`}
                    className="shrink-0 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-seal-soft hover:text-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
