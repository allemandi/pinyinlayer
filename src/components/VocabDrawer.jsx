import { useState, useEffect, useId } from 'react';
import {
  X,
  Trash2,
  Stamp,
  Settings,
  Play,
  Check,
  XCircle,
  CheckCircle2,
  RotateCcw,
  Plus,
  Share2,
  Edit2,
  Star,
  Copy,
  MoveRight,
  FolderInput,
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { getDeckShareUrl, decodeDeckPayload } from '../utils/deckShare.js';

/**
 * Modal to select destination deck for Copying or Moving selected words.
 */
function DeckTargetModal({
  isOpen,
  mode = 'copy', // 'copy' | 'move'
  selectedCount = 0,
  decks = [],
  currentDeckId,
  onClose,
  onConfirm,
}) {
  const [targetDeckId, setTargetDeckId] = useState('');
  const [newDeckName, setNewDeckName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEscapeKey(onClose, isOpen);
  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (isOpen) {
      const available = decks.filter((d) => (mode === 'move' ? d.id !== currentDeckId : true));
      if (available.length > 0) {
        setTargetDeckId(available[0].id);
      } else {
        setIsCreatingNew(true);
      }
    }
  }, [isOpen, decks, currentDeckId, mode]);

  if (!isOpen) return null;

  const handleAction = () => {
    if (isCreatingNew) {
      if (!newDeckName.trim()) return;
      onConfirm({ isNew: true, newName: newDeckName.trim() });
    } else {
      if (!targetDeckId) return;
      onConfirm({ isNew: false, targetDeckId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-2xl border border-rule bg-surface p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label={`${mode === 'copy' ? 'Copy' : 'Move'} Words to Deck`}
      >
        <div className="flex items-center justify-between border-b border-rule pb-3 dark:border-slate-800">
          <h3 className="font-display text-base font-semibold text-ink dark:text-slate-100 flex items-center gap-2">
            {mode === 'copy' ? <Copy size={18} className="text-jade" /> : <MoveRight size={18} className="text-jade" />}
            {mode === 'copy' ? 'Copy' : 'Move'} {selectedCount} {selectedCount === 1 ? 'word' : 'words'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1 text-ink-soft hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {!isCreatingNew ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-slate-400 mb-1.5">
                Select Destination Deck
              </label>
              <select
                value={targetDeckId}
                onChange={(e) => setTargetDeckId(e.target.value)}
                className="w-full rounded-xl border border-rule bg-surface px-3 py-2 text-sm font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {decks
                  .filter((d) => (mode === 'move' ? d.id !== currentDeckId : true))
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.words?.length || 0} words)
                    </option>
                  ))}
              </select>

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-jade hover:underline cursor-pointer"
              >
                <Plus size={14} />
                Create a new deck instead
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-slate-400 mb-1.5">
                New Deck Name
              </label>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g., HSK 4 Verbs"
                autoFocus
                className="w-full rounded-xl border border-rule bg-surface px-3 py-2 text-sm text-ink focus:border-jade focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              {decks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:underline cursor-pointer dark:text-slate-400"
                >
                  Select existing deck
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-rule px-3.5 py-2 text-xs font-medium text-ink-soft hover:bg-surface-dim cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            className="rounded-xl bg-jade px-4 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-jade/90"
          >
            {mode === 'copy' ? 'Copy Words' : 'Move Words'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings & Import Modal for Vocab Decks.
 */
function VocabSettingsModal({
  isOpen,
  onClose,
  cardOrder,
  onChangeCardOrder,
  onClearStatuses,
  onImportDeck,
}) {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  useEscapeKey(onClose, isOpen);
  const settingsRef = useFocusTrap(isOpen);
  const orderSelectId = useId();

  if (!isOpen) return null;

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess('');

    if (!importInput.trim()) {
      setImportError('Please paste a valid deck share link or payload code.');
      return;
    }

    const imported = decodeDeckPayload(importInput);
    if (!imported) {
      setImportError('Invalid or corrupted deck link. Please check the URL.');
      return;
    }

    if (onImportDeck) {
      const created = onImportDeck(imported);
      if (created) {
        setImportSuccess(`Imported deck "${created.name}" with ${created.words.length} words!`);
        setImportInput('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
      <div
        ref={settingsRef}
        className="w-full max-w-sm rounded-2xl border border-rule bg-surface p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label="Vocab Deck Settings"
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
              className="w-full rounded-xl border border-rule bg-surface px-3 py-2.5 text-sm font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="sequential">Newest First (Default)</option>
              <option value="oldest">Oldest First</option>
              <option value="needs_review_first">Needs Review First</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
              <option value="shuffled">Shuffled (Random)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-rule dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-slate-400 mb-1.5">
              Import Shared Deck Link
            </label>
            <form onSubmit={handleImportSubmit} className="space-y-2">
              <input
                type="text"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste deck link or code here..."
                className="w-full rounded-xl border border-rule bg-surface px-3 py-2 text-xs text-ink focus:border-jade focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade/10 border border-jade/30 px-3 py-1.5 text-xs font-semibold text-jade hover:bg-jade hover:text-white transition cursor-pointer"
              >
                <FolderInput size={14} />
                Import Deck
              </button>
            </form>

            {importError && (
              <p className="mt-1.5 text-[11px] font-medium text-seal dark:text-rose-400">
                {importError}
              </p>
            )}
            {importSuccess && (
              <p className="mt-1.5 text-[11px] font-medium text-jade dark:text-emerald-400">
                {importSuccess}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-rule dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint dark:text-slate-400 mb-1.5">
              Pass / Fail Statuses
            </label>

            {showConfirmClear ? (
              <div className="rounded-xl border border-seal/30 bg-seal-soft/30 p-3 text-xs dark:bg-rose-950/30">
                <p className="font-medium text-seal dark:text-rose-300">
                  Reset all Pass / Fail tags for current deck?
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
 * Slide-out drawer listing saved vocab with deck management, multi-deck switching,
 * selection tools, copying/moving between decks, and Flashcard launch.
 */
export default function VocabDrawer({
  isOpen,
  onClose,
  decks = [],
  activeDeck,
  defaultDeckId,
  onSetActiveDeckId,
  onSetDefaultDeckId,
  onCreateDeck,
  onRenameDeck,
  onDeleteDeck,
  onCopyWords,
  onMoveWords,
  onRemoveWords,
  onRemove,
  onStartStudy,
  onClearStatuses,
  onImportDeck,
}) {
  useEscapeKey(onClose, isOpen);
  const drawerRef = useFocusTrap(isOpen);

  const vocab = activeDeck?.words || [];

  const [selectedWords, setSelectedWords] = useState(() => new Set(vocab.map((v) => v.word)));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState('sequential');
  const [showNewDeckInput, setShowNewDeckInput] = useState(false);
  const [newDeckNameInput, setNewDeckNameInput] = useState('');
  const [isRenamingDeck, setIsRenamingDeck] = useState(false);
  const [renameDeckInput, setRenameDeckInput] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    mode: 'copy', // 'copy' | 'move'
  });

  // Keep selection synced when switching deck or opening drawer
  useEffect(() => {
    if (isOpen && vocab.length > 0) {
      setSelectedWords(new Set(vocab.map((v) => v.word)));
    } else if (isOpen && vocab.length === 0) {
      setSelectedWords(new Set());
    }
  }, [isOpen, activeDeck?.id, vocab.length]);

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

  const handleCreateDeckSubmit = (e) => {
    e.preventDefault();
    if (!newDeckNameInput.trim()) return;
    const created = onCreateDeck(newDeckNameInput.trim());
    setNewDeckNameInput('');
    setShowNewDeckInput(false);
    if (created) {
      setActionFeedback(`Created deck "${created.name}"`);
      setTimeout(() => setActionFeedback(''), 3000);
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (!renameDeckInput.trim()) return;
    onRenameDeck(activeDeck.id, renameDeckInput.trim());
    setIsRenamingDeck(false);
  };

  const handleCopyLink = () => {
    const link = getDeckShareUrl(activeDeck);
    if (link) {
      navigator.clipboard?.writeText(link);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleConfirmTransfer = ({ isNew, targetDeckId, newName }) => {
    const wordList = Array.from(selectedWords);
    let destId = targetDeckId;

    if (isNew) {
      const newDeck = onCreateDeck(newName);
      if (newDeck) {
        destId = newDeck.id;
      }
    }

    if (!destId) return;

    if (transferModal.mode === 'copy') {
      const count = onCopyWords(activeDeck.id, destId, wordList);
      setActionFeedback(`Copied ${count} words!`);
    } else {
      const count = onMoveWords(activeDeck.id, destId, wordList);
      setActionFeedback(`Moved ${count} words!`);
      setSelectedWords(new Set());
    }

    setTransferModal({ isOpen: false, mode: 'copy' });
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleBulkDelete = () => {
    const wordList = Array.from(selectedWords);
    if (wordList.length === 0) return;
    onRemoveWords(activeDeck.id, wordList);
    setSelectedWords(new Set());
    setActionFeedback(`Removed ${wordList.length} words.`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleLaunchStudy = () => {
    let deck = vocab.filter((v) => selectedWords.has(v.word));

    if (cardOrder === 'oldest') {
      deck = [...deck].reverse();
    } else if (cardOrder === 'needs_review_first') {
      deck = [...deck].sort((a, b) => {
        if (a.status === 'failed' && b.status !== 'failed') return -1;
        if (a.status !== 'failed' && b.status === 'failed') return 1;
        return 0;
      });
    } else if (cardOrder === 'alphabetical') {
      deck = [...deck].sort((a, b) => a.word.localeCompare(b.word, 'zh-Hans'));
    } else if (cardOrder === 'shuffled') {
      deck = [...deck].sort(() => Math.random() - 0.5);
    }

    if (deck.length > 0) {
      onStartStudy(deck);
    }
  };

  const failedCount = vocab.filter((v) => v.status === 'failed').length;
  const isDefaultDeck = activeDeck?.id === defaultDeckId;

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
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-2xl border-t border-rule bg-surface shadow-2xl transition-transform sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[28rem] lg:w-[32rem] sm:rounded-t-none sm:border-l sm:border-t-0 ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
      >
        {/* Drawer Header */}
        <div className="flex flex-col border-b border-rule px-5 py-3.5 gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-slate-100 sm:text-xl">
              <Stamp size={20} className="text-seal" />
              Vocab Decks
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                title="Vocab Deck Settings & Import"
                aria-label="Vocab Deck Settings & Import"
                className="rounded-full p-2 text-ink-soft transition-colors hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Settings size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close vocab drawer"
                className="rounded-full p-2 text-ink-soft transition-colors hover:bg-surface-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Multi-Deck Switcher & Management */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRenamingDeck ? (
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <select
                  value={activeDeck?.id || ''}
                  onChange={(e) => onSetActiveDeckId(e.target.value)}
                  className="flex-1 rounded-xl border border-rule bg-surface-dim px-3 py-1.5 text-sm font-bold text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer truncate"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.words?.length || 0}){d.id === defaultDeckId ? ' ★ Default' : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setRenameDeckInput(activeDeck?.name || '');
                    setIsRenamingDeck(true);
                  }}
                  title="Rename Deck"
                  aria-label="Rename Deck"
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-surface-dim hover:text-ink cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Edit2 size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleRenameSubmit} className="flex-1 flex items-center gap-1.5">
                <input
                  type="text"
                  value={renameDeckInput}
                  onChange={(e) => setRenameDeckInput(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-lg border border-jade bg-surface px-2.5 py-1 text-xs font-semibold text-ink focus:outline-none dark:border-jade dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-jade px-2.5 py-1 text-xs font-bold text-white cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenamingDeck(false)}
                  className="rounded-lg border border-rule px-2.5 py-1 text-xs font-medium text-ink-soft cursor-pointer dark:border-slate-700"
                >
                  Cancel
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => setShowNewDeckInput(true)}
              title="Create New Deck"
              aria-label="Create New Deck"
              className="inline-flex items-center gap-1 rounded-xl border border-jade/30 bg-jade-soft/50 px-2.5 py-1.5 text-xs font-bold text-jade hover:bg-jade hover:text-white transition cursor-pointer dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <Plus size={15} />
              <span>New</span>
            </button>
          </div>

          {/* New Deck Inline Input Form */}
          {showNewDeckInput && (
            <form onSubmit={handleCreateDeckSubmit} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={newDeckNameInput}
                onChange={(e) => setNewDeckNameInput(e.target.value)}
                placeholder="Deck name..."
                autoFocus
                className="flex-1 rounded-xl border border-rule bg-surface px-3 py-1.5 text-xs font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="rounded-xl bg-jade px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowNewDeckInput(false)}
                className="rounded-xl border border-rule px-3 py-1.5 text-xs text-ink-soft cursor-pointer dark:border-slate-700"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Deck Metadata & Share Link Quick Bar */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-rule/50 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              {isDefaultDeck ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Star size={13} fill="currentColor" />
                  Default Deck
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetDefaultDeckId(activeDeck.id)}
                  className="inline-flex items-center gap-1 text-ink-soft hover:text-amber-600 font-semibold cursor-pointer dark:text-slate-400 dark:hover:text-amber-400"
                >
                  <Star size={13} />
                  Set as Default Deck
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy Deck Share Link"
                className="inline-flex items-center gap-1 font-semibold text-jade hover:underline cursor-pointer"
              >
                <Share2 size={13} />
                {copiedToast ? 'Link Copied!' : 'Copy Share Link'}
              </button>

              {decks.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteDeck(activeDeck.id)}
                  title="Delete Deck"
                  className="inline-flex items-center gap-1 text-ink-faint hover:text-seal font-semibold cursor-pointer dark:hover:text-rose-400"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-jade-soft px-5 py-1.5 text-center text-xs font-bold text-jade dark:bg-emerald-950 dark:text-emerald-300 transition-all">
            {actionFeedback}
          </div>
        )}

        {/* Selection Quick Bar & Transfer Tools */}
        {vocab.length > 0 && (
          <div className="flex flex-wrap items-center justify-between border-b border-rule bg-paper px-5 py-2.5 text-xs sm:text-sm dark:bg-slate-950 gap-2">
            <div className="flex items-center gap-2.5 text-ink-soft dark:text-slate-400">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:text-jade font-bold cursor-pointer"
              >
                Select All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleSelectFailed}
                disabled={failedCount === 0}
                className={`font-bold cursor-pointer ${
                  failedCount > 0 ? 'hover:text-seal text-seal' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                Select Failed ({failedCount})
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="hover:text-ink font-semibold cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectedWords.size > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setTransferModal({ isOpen: true, mode: 'copy' })}
                    title="Copy selected words to another deck"
                    className="inline-flex items-center gap-1 rounded-lg border border-rule bg-surface px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-jade-soft hover:text-jade cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Copy size={13} />
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferModal({ isOpen: true, mode: 'move' })}
                    title="Move selected words to another deck"
                    className="inline-flex items-center gap-1 rounded-lg border border-rule bg-surface px-2 py-1 text-xs font-semibold text-ink-soft hover:bg-jade-soft hover:text-jade cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <MoveRight size={13} />
                    Move
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    title="Remove selected words from deck"
                    className="inline-flex items-center gap-1 rounded-lg border border-rule bg-surface px-2 py-1 text-xs font-semibold text-seal hover:bg-seal-soft cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
              <span className="text-ink-faint font-semibold ml-1">
                {selectedWords.size} selected
              </span>
            </div>
          </div>
        )}

        {/* Vocab List Area */}
        <div className="flex-1 overflow-y-auto">
          {vocab.length === 0 ? (
            <div className="p-8 text-center text-ink-faint space-y-2">
              <p className="text-lg font-medium">No words in this deck.</p>
              <p className="text-sm">
                Tap any word in the reader and stamp it to save it here, or copy/move words from another deck.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-rule dark:divide-slate-800">
              {vocab.map((entry) => {
                const isChecked = selectedWords.has(entry.word);
                return (
                  <li key={entry.word} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-dim/40 transition">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectWord(entry.word)}
                      aria-label={`${isChecked ? 'Deselect' : 'Select'} ${entry.word} for flashcards`}
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                        isChecked
                          ? 'border-jade bg-jade text-white shadow-xs'
                          : 'border-rule bg-surface text-transparent hover:border-jade/60 dark:border-slate-700 dark:bg-slate-900'
                      }`}
                    >
                      <Check size={16} strokeWidth={3.5} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-reading text-2xl font-medium leading-tight text-ink dark:text-slate-100">
                          {entry.word}
                        </p>
                        {/* Status Badge */}
                        {entry.status === 'passed' && (
                          <span
                            title="Passed"
                            className="inline-flex items-center gap-1 rounded-full bg-jade-soft px-2.5 py-0.5 text-xs font-bold text-jade dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            <CheckCircle2 size={13} />
                            Passed
                          </span>
                        )}
                        {entry.status === 'failed' && (
                          <span
                            title="Needs Review"
                            className="inline-flex items-center gap-1 rounded-full bg-seal-soft px-2.5 py-0.5 text-xs font-bold text-seal dark:bg-rose-950 dark:text-rose-300"
                          >
                            <XCircle size={13} />
                            Needs Review
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-lg font-bold text-jade dark:text-sky-400">
                        {entry.pinyin}
                      </p>
                      {entry.definitions?.length > 0 && (
                        <p className="mt-1.5 text-base sm:text-lg leading-snug text-ink-soft dark:text-slate-300">
                          {entry.definitions[0]}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(entry.word)}
                      aria-label={`Remove ${entry.word} from deck`}
                      className="shrink-0 rounded-full p-2 text-ink-faint transition-colors hover:bg-seal-soft hover:text-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-rose-950 dark:hover:text-rose-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Drawer Action Footer */}
        {vocab.length > 0 && (
          <div className="border-t border-rule bg-surface p-5 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={handleLaunchStudy}
              disabled={selectedWords.size === 0}
              className={`w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-jade px-5 py-3.5 text-base sm:text-lg font-bold text-white shadow-md transition hover:bg-jade/90 active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
                selectedWords.size === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play size={18} fill="currentColor" />
              <span>
                Study Flashcards ({selectedWords.size})
              </span>
            </button>
          </div>
        )}
      </aside>

      <DeckTargetModal
        isOpen={transferModal.isOpen}
        mode={transferModal.mode}
        selectedCount={selectedWords.size}
        decks={decks}
        currentDeckId={activeDeck?.id}
        onClose={() => setTransferModal({ isOpen: false, mode: 'copy' })}
        onConfirm={handleConfirmTransfer}
      />

      <VocabSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        cardOrder={cardOrder}
        onChangeCardOrder={setCardOrder}
        onClearStatuses={onClearStatuses}
        onImportDeck={onImportDeck}
      />
    </>
  );
}
