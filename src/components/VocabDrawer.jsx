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
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { getDeckShareUrl, decodeDeckPayload } from '../utils/deckShare.js';

/**
 * Production-grade Modal to select destination deck for Copying or Moving selected words.
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
        setIsCreatingNew(false);
      } else {
        setIsCreatingNew(true);
      }
    }
  }, [isOpen, decks, currentDeckId, mode]);

  if (!isOpen) return null;

  const handleAction = (e) => {
    e?.preventDefault();
    if (isCreatingNew) {
      if (!newDeckName.trim()) return;
      onConfirm({ isNew: true, newName: newDeckName.trim() });
    } else {
      if (!targetDeckId) return;
      onConfirm({ isNew: false, targetDeckId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-3xl border border-rule bg-surface p-5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-label={`${mode === 'copy' ? 'Copy' : 'Move'} Words to Deck`}
      >
        <div className="flex items-center justify-between border-b border-rule pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-jade-soft text-jade dark:bg-emerald-950 dark:text-emerald-300">
              {mode === 'copy' ? <Copy size={18} /> : <MoveRight size={18} />}
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink dark:text-slate-100">
                {mode === 'copy' ? 'Copy' : 'Move'} {selectedCount} {selectedCount === 1 ? 'Word' : 'Words'}
              </h3>
              <p className="text-[11px] text-ink-faint">Select or create a target deck</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-surface text-ink-soft transition hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleAction} className="mt-4 space-y-4">
          {!isCreatingNew ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400">
                Destination Deck
              </label>
              <select
                value={targetDeckId}
                onChange={(e) => setTargetDeckId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-rule bg-surface-dim px-3.5 text-sm font-semibold text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 cursor-pointer"
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
                className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-bold text-jade hover:underline cursor-pointer"
              >
                <Plus size={14} />
                Create a new deck instead
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400">
                New Deck Name
              </label>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="e.g., HSK 4 Vocabulary"
                autoFocus
                className="w-full h-11 rounded-2xl border border-rule bg-surface-dim px-3.5 text-sm font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
              {decks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="inline-flex items-center gap-1.5 min-h-[44px] text-xs font-semibold text-ink-soft hover:underline cursor-pointer dark:text-slate-400"
                >
                  Choose from existing decks
                </button>
              )}
            </div>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 inline-flex items-center justify-center rounded-2xl border border-rule bg-surface px-4 text-xs font-bold text-ink-soft transition hover:bg-surface-dim hover:text-ink cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-jade px-4 text-xs font-bold text-white shadow-sm hover:bg-jade/90 transition cursor-pointer"
            >
              {mode === 'copy' ? <Copy size={15} /> : <MoveRight size={15} />}
              <span>{mode === 'copy' ? 'Copy Words' : 'Move Words'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Settings & Security-Sanitized Deck Import Modal.
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
      setImportError('Please paste a valid deck share link or code payload.');
      return;
    }

    const imported = decodeDeckPayload(importInput);
    if (!imported) {
      setImportError('Invalid, corrupted, or oversized deck link. Please check the URL.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
      <div
        ref={settingsRef}
        className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-3xl border border-rule bg-surface p-5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overscroll-contain"
        role="dialog"
        aria-modal="true"
        aria-label="Vocab Deck Settings"
      >
        <div className="flex items-center justify-between border-b border-rule pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-jade-soft text-jade dark:bg-emerald-950 dark:text-emerald-300">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ink dark:text-slate-100">
                Vocab Settings & Import
              </h3>
              <p className="text-[11px] text-ink-faint">Configure flashcards or import decks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-surface text-ink-soft transition hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Flashcard Sorting Order */}
          <div>
            <label
              htmlFor={orderSelectId}
              className="block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400 mb-1.5"
            >
              Flashcard Order
            </label>
            <select
              id={orderSelectId}
              value={cardOrder}
              onChange={(e) => onChangeCardOrder(e.target.value)}
              className="w-full h-11 rounded-2xl border border-rule bg-surface-dim px-3.5 text-sm font-semibold text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 cursor-pointer"
            >
              <option value="sequential">Newest First (Default)</option>
              <option value="oldest">Oldest First</option>
              <option value="needs_review_first">Needs Review First</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
              <option value="shuffled">Shuffled (Random)</option>
            </select>
          </div>

          {/* Import Shared Deck */}
          <div className="pt-3 border-t border-rule/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400">
                Import Shared Deck
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-jade dark:text-emerald-400">
                <ShieldCheck size={12} />
                Sanitized & Private
              </span>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-2">
              <input
                type="text"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste deck link or code here..."
                className="w-full h-11 rounded-2xl border border-rule bg-surface-dim px-3.5 text-xs font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
              <button
                type="submit"
                className="w-full h-11 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-jade px-4 text-xs font-bold text-white shadow-xs hover:bg-jade/90 transition cursor-pointer"
              >
                <FolderInput size={15} />
                Import Deck Payload
              </button>
            </form>

            {importError && (
              <p className="mt-2 text-[11px] font-semibold text-seal dark:text-rose-400">
                {importError}
              </p>
            )}
            {importSuccess && (
              <p className="mt-2 text-[11px] font-semibold text-jade dark:text-emerald-400">
                {importSuccess}
              </p>
            )}
          </div>

          {/* Pass/Fail Tags Reset */}
          <div className="pt-3 border-t border-rule/60 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft dark:text-slate-400 mb-1.5">
              Pass / Fail Statuses
            </label>

            {showConfirmClear ? (
              <div className="rounded-2xl border border-seal/30 bg-seal-soft/30 p-3.5 text-xs dark:bg-rose-950/30">
                <p className="font-semibold text-seal dark:text-rose-300">
                  Reset all Pass / Fail status tags for this deck?
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearStatuses();
                      setShowConfirmClear(false);
                    }}
                    className="h-10 rounded-xl bg-seal px-3 text-xs font-bold text-white shadow-xs hover:bg-seal/90 cursor-pointer"
                  >
                    Yes, Reset Tags
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="h-10 rounded-xl border border-rule bg-surface px-3 text-xs font-semibold text-ink-soft hover:bg-surface-dim cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-2xl border border-rule bg-surface px-3 text-xs font-semibold text-seal hover:bg-seal-soft/50 cursor-pointer transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-950 dark:text-rose-400"
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
            className="w-full h-11 rounded-2xl bg-jade px-4 text-xs font-bold text-white cursor-pointer hover:bg-jade/90 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide-out drawer listing saved vocab with symmetrical multi-deck controls,
 * mobile-friendly selection tools, copying/moving between decks, and Flashcards.
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
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-rule bg-surface shadow-2xl transition-transform sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[28rem] lg:w-[32rem] sm:rounded-t-none sm:border-l sm:border-t-0 ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full'
        }`}
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-rule px-5 py-3.5 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-seal-soft text-seal dark:bg-rose-950 dark:text-rose-300">
              <Stamp size={20} />
            </div>
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-slate-100 sm:text-xl">
                Vocab Decks
                <span className="rounded-full bg-surface-dim px-2.5 py-0.5 text-xs font-bold text-ink-soft dark:bg-slate-800 dark:text-slate-300">
                  {decks.length}
                </span>
              </h2>
              <p className="text-xs font-medium text-ink-soft">Organize, transfer & share decks</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Vocab Settings & Import"
              aria-label="Vocab Settings & Import"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rule bg-surface text-ink-soft transition hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close vocab drawer"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rule bg-surface text-ink-soft transition hover:bg-surface-dim hover:text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Elevated Deck Controller Section */}
        <div className="border-b border-rule bg-paper p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-950/60 shrink-0">
          <div className="rounded-2xl border border-rule/80 bg-surface p-3 sm:p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
            {/* Row 1: Deck Selection Dropdown & New Deck Button */}
            {!isRenamingDeck ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                  <select
                    value={activeDeck?.id || ''}
                    onChange={(e) => onSetActiveDeckId(e.target.value)}
                    className="w-full h-11 sm:h-12 rounded-xl border border-rule bg-surface-dim px-3.5 pr-8 text-sm font-bold text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 cursor-pointer truncate appearance-none"
                  >
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.words?.length || 0} words){d.id === defaultDeckId ? ' ★ Default' : ''}
                      </option>
                    ))}
                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
                    <Layers size={14} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewDeckInput(true)}
                  title="Create New Deck"
                  aria-label="Create New Deck"
                  className="h-11 sm:h-12 inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade/10 border border-jade/30 px-3.5 text-xs sm:text-sm font-bold text-jade hover:bg-jade hover:text-white transition cursor-pointer dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-jade shrink-0"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">New Deck</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleRenameSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={renameDeckInput}
                  onChange={(e) => setRenameDeckInput(e.target.value)}
                  placeholder="Deck name..."
                  autoFocus
                  className="flex-1 h-11 rounded-xl border border-jade bg-surface px-3.5 text-sm font-semibold text-ink focus:outline-none dark:border-jade dark:bg-slate-950 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-jade px-4 text-xs font-bold text-white cursor-pointer hover:bg-jade/90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsRenamingDeck(false)}
                  className="h-11 rounded-xl border border-rule px-3 text-xs font-semibold text-ink-soft cursor-pointer hover:bg-surface-dim dark:border-slate-800"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Inline New Deck Creation Form */}
            {showNewDeckInput && (
              <form onSubmit={handleCreateDeckSubmit} className="flex items-center gap-2 pt-1 border-t border-rule/50 dark:border-slate-800">
                <input
                  type="text"
                  value={newDeckNameInput}
                  onChange={(e) => setNewDeckNameInput(e.target.value)}
                  placeholder="Enter new deck name..."
                  autoFocus
                  className="flex-1 h-11 rounded-xl border border-rule bg-surface-dim px-3.5 text-xs sm:text-sm font-medium text-ink focus:border-jade focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                />
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-jade px-4 text-xs font-bold text-white cursor-pointer hover:bg-jade/90"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewDeckInput(false)}
                  className="h-11 rounded-xl border border-rule px-3 text-xs font-medium text-ink-soft cursor-pointer hover:bg-surface-dim dark:border-slate-800"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Row 2: Symmetrical Deck Quick Toolbar */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-rule/50 dark:border-slate-800">
              <div className="flex items-center">
                {isDefaultDeck ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Star size={13} fill="currentColor" />
                    Default Deck
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetDefaultDeckId(activeDeck.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rule bg-surface px-2.5 py-1.5 min-h-[36px] text-xs font-semibold text-ink-soft hover:bg-amber-500/10 hover:text-amber-700 transition cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <Star size={13} />
                    Set as Default
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy Deck Share Link"
                  className="inline-flex items-center gap-1 rounded-xl border border-rule bg-surface px-2.5 py-1.5 min-h-[36px] text-xs font-semibold text-jade hover:bg-jade-soft transition cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-emerald-400"
                >
                  <Share2 size={13} />
                  <span>{copiedToast ? 'Copied!' : 'Share'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRenameDeckInput(activeDeck?.name || '');
                    setIsRenamingDeck(true);
                  }}
                  title="Rename Deck"
                  className="inline-flex items-center gap-1 rounded-xl border border-rule bg-surface px-2.5 py-1.5 min-h-[36px] text-xs font-semibold text-ink-soft hover:bg-surface-dim transition cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  <Edit2 size={13} />
                  <span>Rename</span>
                </button>

                {decks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteDeck(activeDeck.id)}
                    title="Delete Deck"
                    className="inline-flex items-center justify-center rounded-xl border border-rule bg-surface h-9 w-9 text-ink-faint hover:bg-seal-soft hover:text-seal transition cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-jade px-5 py-2 text-center text-xs font-bold text-white shadow-xs transition-all shrink-0">
            {actionFeedback}
          </div>
        )}

        {/* Selection Bar & Symmetrical Bulk Action Toolbar */}
        {vocab.length > 0 && (
          <div className="border-b border-rule bg-surface px-5 py-3 dark:border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-ink-soft dark:text-slate-400">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="hover:text-jade font-bold cursor-pointer py-1"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleSelectFailed}
                  disabled={failedCount === 0}
                  className={`font-bold cursor-pointer py-1 ${
                    failedCount > 0 ? 'hover:text-seal text-seal' : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  Failed ({failedCount})
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="hover:text-ink font-semibold cursor-pointer py-1"
                >
                  Clear
                </button>
              </div>

              <span className="text-xs font-bold text-ink-faint">
                {selectedWords.size} selected
              </span>
            </div>

            {/* Symmetrical Action Grid */}
            {selectedWords.size > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setTransferModal({ isOpen: true, mode: 'copy' })}
                  className="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-surface-dim text-xs font-bold text-ink transition hover:bg-jade-soft hover:text-jade cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferModal({ isOpen: true, mode: 'move' })}
                  className="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-surface-dim text-xs font-bold text-ink transition hover:bg-jade-soft hover:text-jade cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <MoveRight size={14} />
                  <span>Move</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rule bg-surface-dim text-xs font-bold text-seal transition hover:bg-seal-soft cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vocab List Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {vocab.length === 0 ? (
            <div className="p-8 text-center text-ink-faint space-y-2">
              <p className="text-base font-bold text-ink dark:text-slate-200">No words in this deck.</p>
              <p className="text-xs leading-relaxed max-w-xs mx-auto">
                Tap any word in the reader and stamp it to save it here, or copy/move words from another deck.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-rule dark:divide-slate-800 pb-20 sm:pb-6">
              {vocab.map((entry) => {
                const isChecked = selectedWords.has(entry.word);
                return (
                  <li key={entry.word} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-dim/40 transition">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectWord(entry.word)}
                      aria-label={`${isChecked ? 'Deselect' : 'Select'} ${entry.word}`}
                      className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade ${
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
                      className="shrink-0 rounded-full p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-ink-faint transition-colors hover:bg-seal-soft hover:text-seal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade cursor-pointer dark:hover:bg-rose-950 dark:hover:text-rose-300"
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
          <div className="border-t border-rule bg-surface p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 shrink-0">
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
